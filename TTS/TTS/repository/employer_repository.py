import logging
import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iemployer_repository import IEmployerRepository
from models.employer import EmployerCreateUpdate, EmployerResponse
from config.settings import settings
from utils.location_fields import apply_location_to_payload, enrich_employer_location

logger = logging.getLogger(__name__)

# Defaults for employers columns that are NOT NULL without a DB default (dev/prod schemas vary).
_EMPLOYER_INSERT_DEFAULTS: dict[str, object] = {
    "location": "",
    "industry": "General",
    "companysize": "1-10",
    "website": "",
    "contactperson": "Contact",
    "status": "active",
    "isactive": True,
    "subscriptionplan": "basic",
    "monthlybudget": 0,
    "totalhires": 0,
    "logourl": "",
}


class EmployerRepository(IEmployerRepository):
    _column_cache: dict[str, bool] = {}
    _not_null_cols_cache: Optional[List[str]] = None

    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _employers_has_column(self, cursor, column: str) -> bool:
        key = f"employers.{column}"
        if key not in EmployerRepository._column_cache:
            cursor.execute("SELECT COL_LENGTH('dbo.employers', ?)", column)
            row = cursor.fetchone()
            EmployerRepository._column_cache[key] = (
                row is not None and row[0] is not None
            )
        return EmployerRepository._column_cache[key]

    def _employers_company_column(self, cursor) -> Optional[str]:
        for col in ("name", "companyname", "company_name"):
            if self._employers_has_column(cursor, col):
                return col
        return None

    def _put_company_name_on_row(self, cursor, data: dict, company_name: str) -> None:
        """Set company label using the column that exists on this database."""
        col = self._employers_company_column(cursor)
        if not col:
            return
        for key in ("name", "companyname", "company_name"):
            data.pop(key, None)
        data[col] = company_name

    def _not_null_employer_columns_needing_values(self, cursor) -> List[str]:
        if EmployerRepository._not_null_cols_cache is None:
            cursor.execute(
                """
                SELECT c.name
                FROM sys.columns c
                INNER JOIN sys.tables t ON c.object_id = t.object_id
                WHERE t.name = 'employers'
                  AND SCHEMA_NAME(t.schema_id) = 'dbo'
                  AND c.is_nullable = 0
                  AND c.default_object_id = 0
                  AND c.is_computed = 0
                  AND c.is_identity = 0
                  AND c.name <> 'id'
                """
            )
            EmployerRepository._not_null_cols_cache = [
                row[0] for row in cursor.fetchall()
            ]
        return EmployerRepository._not_null_cols_cache

    def _fill_employer_insert_defaults(
        self,
        cursor,
        data: dict,
        company_name: Optional[str] = None,
    ) -> None:
        """Populate required NOT NULL columns missing from the payload."""
        if company_name:
            self._put_company_name_on_row(cursor, data, company_name)
        if not data.get("contactperson") and self._employers_has_column(
            cursor, "contactperson"
        ):
            data["contactperson"] = company_name or _EMPLOYER_INSERT_DEFAULTS[
                "contactperson"
            ]

        existing_lower = {k.lower() for k in data}
        for col in self._not_null_employer_columns_needing_values(cursor):
            if col.lower() in existing_lower:
                continue
            if not self._employers_has_column(cursor, col):
                continue
            if col in ("name", "companyname", "company_name"):
                if company_name:
                    self._put_company_name_on_row(cursor, data, company_name)
                continue
            default = _EMPLOYER_INSERT_DEFAULTS.get(col, "")
            data[col] = default

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def _prepare_employer_dict(self, data: dict) -> dict:
        """Map DB columns to API fields (name/company_name → companyname, default status)."""
        company = (
            data.get("companyname")
            or data.get("name")
            or data.get("company_name")
        )
        if company and not data.get("companyname"):
            data["companyname"] = company
        if not data.get("status"):
            data["status"] = "active"
        return data

    def _to_employer_response(self, cursor, data: dict) -> EmployerResponse:
        enrich_employer_location(data)
        self._prepare_employer_dict(data)
        if data.get("userid"):
            data["user"] = self._get_user_for_employer(cursor, data["userid"])
        return EmployerResponse(**data)

    def _get_user_for_employer(self, cursor, userid: str) -> Optional[dict]:
        if not userid:
            return None
        cursor.execute("SELECT * FROM users WHERE id = ?", str(userid))
        row = cursor.fetchone()
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def get_employer_by_id(self, employer_id: UUID, include_inactive: bool = False) -> Optional[EmployerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM employers WHERE id = ?", str(employer_id))
            else:
                cursor.execute("SELECT * FROM employers WHERE id = ? AND isactive = 1", str(employer_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                return self._to_employer_response(cursor, data)
            return None

    def _backfill_missing_employers(self) -> None:
        """Create employer rows for users with employer role but no company record."""
        employer_role_id = settings.default_employer_role_id
        if not employer_role_id:
            return
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT u.id, u.name, u.email, u.phone
                FROM users u
                WHERE u.roleid = ? AND u.isactive = 1
                  AND NOT EXISTS (
                    SELECT 1 FROM employers e
                    WHERE e.userid = u.id AND e.isactive = 1
                  )
                """,
                employer_role_id,
            )
            rows = cursor.fetchall()
        for row in rows:
            try:
                self.ensure_employer_for_user(
                    UUID(str(row[0])),
                    name=row[1],
                    email=row[2],
                    phone=row[3],
                )
            except Exception as exc:
                logger.warning(
                    "Could not backfill employer for user %s: %s", row[0], exc
                )

    def get_all_employers(self) -> List[EmployerResponse]:
        self._backfill_missing_employers()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employers WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []

            results = []
            for row in rows:
                data = dict(zip(columns, row))
                results.append(self._to_employer_response(cursor, data))
            return results

    def get_employer_by_user_id(self, userid: UUID) -> Optional[EmployerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT TOP 1 * FROM employers
                WHERE userid = ? AND isactive = 1
                ORDER BY createdon
                """,
                str(userid),
            )
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                return self._to_employer_response(cursor, data)
            return None

    def ensure_employer_for_user(
        self,
        userid: UUID,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> EmployerResponse:
        existing = self.get_employer_by_user_id(userid)
        if existing:
            return existing

        company_name = (name or email or "My Company").strip()
        payload = EmployerCreateUpdate(
            userid=userid,
            companyname=company_name,
            contactperson=name or company_name,
            email=email,
            phone=phone,
            location="",
            industry="General",
            companysize="1-10",
            website="",
            status="active",
            isactive=True,
        )
        return self.upsert_employer(payload)

    def _ensure_user_employer_link(self, cursor, userid: str, employer_id: str) -> None:
        cursor.execute(
            "SELECT id FROM user_employers WHERE userid = ? AND employerid = ?",
            userid,
            employer_id,
        )
        link = cursor.fetchone()
        if link:
            cursor.execute(
                "UPDATE user_employers SET isactive = 1 WHERE id = ?",
                link[0],
            )
        else:
            cursor.execute(
                "INSERT INTO user_employers (userid, employerid, isactive) VALUES (?, ?, 1)",
                userid,
                employer_id,
            )

    def upsert_employer(self, employer: EmployerCreateUpdate) -> EmployerResponse:
        data = employer.dict(exclude_unset=True)

        company_name = data.pop("name", None) or data.pop("companyname", None)
        email = data.pop("email", None)
        phone = data.pop("phone", None)

        if not company_name and data.get("contactperson"):
            company_name = data.get("contactperson")

        employer_id = data.pop('id', None)
        userid = data.get('userid')
        email_key = email.strip().lower() if email else None

        location_field_keys = (
            "location",
            "headquarterscity",
            "headquartersstate",
            "headquarterscountry",
            "headquarters_city",
            "headquarters_state",
            "headquarters_country",
        )
        has_location_input = any(
            k in data and data.get(k) not in (None, "", {})
            for k in location_field_keys
        )
        if has_location_input:
            apply_location_to_payload(data, table="employers")

        # Never write NULL into NOT NULL columns on partial updates
        data = {k: v for k, v in data.items() if v is not None}
        if "location" not in data or data.get("location") in (None, ""):
            data.pop("location", None)

        with self._get_connection() as conn:
            cursor = conn.cursor()

            try:
                # Upsert User table logic
                if company_name or email or phone:
                    if userid:
                        user_sets = []
                        user_vals = []
                        if company_name:
                            user_sets.append("name = ?")
                            user_vals.append(company_name)
                        if email:
                            user_sets.append("email = ?")
                            user_vals.append(email)
                        if phone:
                            user_sets.append("phone = ?")
                            user_vals.append(phone)

                        if user_sets:
                            user_vals.append(str(userid))
                            cursor.execute(
                                f"UPDATE users SET {', '.join(user_sets)} WHERE id = ?",
                                user_vals,
                            )
                    elif email_key:
                        cursor.execute(
                            "SELECT id FROM users WHERE LOWER(LTRIM(RTRIM(email))) = ?",
                            email_key,
                        )
                        existing_user = cursor.fetchone()
                        if existing_user:
                            userid = existing_user[0]
                            data['userid'] = str(userid)
                            user_sets = ["roleid = ?"]
                            user_vals = [settings.default_employer_role_id]
                            if company_name:
                                user_sets.append("name = ?")
                                user_vals.append(company_name)
                            if phone:
                                user_sets.append("phone = ?")
                                user_vals.append(phone)
                            user_vals.append(str(userid))
                            cursor.execute(
                                f"UPDATE users SET {', '.join(user_sets)} WHERE id = ?",
                                user_vals,
                            )
                        else:
                            cursor.execute(
                                """
                                INSERT INTO users (name, email, phone, roleid)
                                OUTPUT INSERTED.id
                                VALUES (?, ?, ?, ?)
                                """,
                                (company_name, email, phone, settings.default_employer_role_id),
                            )
                            userid = cursor.fetchone()[0]
                            data['userid'] = str(userid)
                    else:
                        cursor.execute(
                            """
                            INSERT INTO users (name, email, phone, roleid)
                            OUTPUT INSERTED.id
                            VALUES (?, ?, ?, ?)
                            """,
                            (company_name, email, phone, settings.default_employer_role_id),
                        )
                        userid = cursor.fetchone()[0]
                        data['userid'] = str(userid)

                userid = data.get("userid") or userid

                if company_name:
                    self._put_company_name_on_row(cursor, data, company_name)
                if not data.get("status"):
                    data["status"] = "active"
                if data.get("isactive") is None:
                    data["isactive"] = True

                # Reuse existing employer row for this user when creating (no duplicate companies)
                if userid and not employer_id:
                    cursor.execute(
                        "SELECT TOP 1 id FROM employers WHERE userid = ? ORDER BY createdon",
                        str(userid),
                    )
                    existing_employer = cursor.fetchone()
                    if existing_employer:
                        employer_id = existing_employer[0]

                # Upsert Employer table logic
                if employer_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            if not self._employers_has_column(cursor, key):
                                continue
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        if set_clauses:
                            values.append(str(employer_id))
                            query = (
                                f"UPDATE employers SET {', '.join(set_clauses)} "
                                f"WHERE id = ?"
                            )
                            cursor.execute(query, values)
                else:
                    self._fill_employer_insert_defaults(
                        cursor, data, company_name=company_name
                    )

                    columns = []
                    placeholders = []
                    values = []
                    
                    for key, value in data.items():
                        if not self._employers_has_column(cursor, key):
                            continue
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    
                    if columns:
                        query = f"INSERT INTO employers ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                        cursor.execute(query, values)
                        employer_id = cursor.fetchone()[0]
                    else:
                        query = "INSERT INTO employers DEFAULT VALUES OUTPUT INSERTED.id"
                        cursor.execute(query)
                        employer_id = cursor.fetchone()[0]

                if userid and employer_id:
                    self._ensure_user_employer_link(
                        cursor, str(userid), str(employer_id)
                    )

                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            
        return self.get_employer_by_id(employer_id, include_inactive=True)

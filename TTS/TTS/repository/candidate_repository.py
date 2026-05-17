import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.icandidate_repository import ICandidateRepository
from models.candidate import CandidateCreateUpdate, CandidateResponse
from config.settings import settings
from utils.location_fields import apply_location_to_payload, enrich_row_location

class CandidateRepository(ICandidateRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        
        for json_field in ['taxexpertise', 'certifications']:
            if data.get(json_field):
                try:
                    data[json_field] = json.loads(data[json_field])
                except Exception:
                    pass
        enrich_row_location(data, table="candidates")
        return data

    def _get_user_for_candidate(self, cursor, userid: str) -> Optional[dict]:
        if not userid:
            return None
        cursor.execute("SELECT * FROM users WHERE id = ?", str(userid))
        row = cursor.fetchone()
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def get_candidate_by_id(self, candidate_id: UUID, include_inactive: bool = False) -> Optional[CandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM candidates WHERE id = ?", str(candidate_id))
            else:
                cursor.execute("SELECT * FROM candidates WHERE id = ? AND isactive = 1", str(candidate_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                if data.get('userid'):
                    data['user'] = self._get_user_for_candidate(cursor, data['userid'])
                return CandidateResponse(**data)
            return None

    def get_all_candidates(self) -> List[CandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM candidates WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                for json_field in ['taxexpertise', 'certifications']:
                    if data.get(json_field):
                        try:
                            data[json_field] = json.loads(data[json_field])
                        except Exception:
                            pass
                enrich_row_location(data, table="candidates")
                if data.get('userid'):
                    data['user'] = self._get_user_for_candidate(cursor, data['userid'])
                results.append(CandidateResponse(**data))
            return results

    def get_candidate_by_user_id(self, userid: UUID) -> Optional[CandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM candidates WHERE userid = ? AND isactive = 1", str(userid)
            )
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                if data.get("userid"):
                    data["user"] = self._get_user_for_candidate(cursor, data["userid"])
                return CandidateResponse(**data)
            return None

    def ensure_candidate_for_user(self, userid: UUID) -> CandidateResponse:
        existing = self.get_candidate_by_user_id(userid)
        if existing:
            return existing

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM users WHERE id = ? AND isactive = 1", str(userid)
            )
            if not cursor.fetchone():
                raise ValueError("User not found")

            cursor.execute(
                """
                INSERT INTO candidates (userid, status, isactive)
                OUTPUT INSERTED.id
                VALUES (?, ?, 1)
                """,
                str(userid),
                "pending",
            )
            new_id = cursor.fetchone()[0]
            conn.commit()

        return self.get_candidate_by_id(new_id, include_inactive=True)

    def upsert_candidate(self, candidate: CandidateCreateUpdate) -> CandidateResponse:
        data = candidate.dict(exclude_unset=True)
        
        name = data.pop('name', None)
        email = data.pop('email', None)
        phone = data.pop('phone', None)
        
        if any(
            k in data
            for k in (
                "location",
                "locationcity",
                "locationstate",
                "locationcountry",
                "location_city",
                "location_state",
                "location_country",
            )
        ):
            apply_location_to_payload(data, table="candidates")

        for field in ['taxexpertise', 'certifications']:
            if field in data and isinstance(data[field], (dict, list)):
                data[field] = json.dumps(data[field])

        candidate_id = data.pop('id', None)
        userid = data.get('userid')

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                # Upsert User table logic
                if name or email or phone:
                    if userid:
                        user_sets = []
                        user_vals = []
                        if name: user_sets.append("name = ?"); user_vals.append(name)
                        if email: user_sets.append("email = ?"); user_vals.append(email)
                        if phone: user_sets.append("phone = ?"); user_vals.append(phone)
                        
                        if user_sets:
                            user_vals.append(str(userid))
                            cursor.execute(f"UPDATE users SET {', '.join(user_sets)} WHERE id = ?", user_vals)
                    else:
                        # If email is provided, check if a user already exists with this email
                        if email:
                            cursor.execute("SELECT id FROM users WHERE email = ?", email)
                            if cursor.fetchone():
                                raise ValueError("A user with this email already exists.")
                        
                        # Create brand new user
                        cursor.execute("""
                            INSERT INTO users (name, email, phone, roleid) 
                            OUTPUT INSERTED.id 
                            VALUES (?, ?, ?, ?)
                        """, (name, email, phone, settings.default_candidate_role_id))
                        userid = cursor.fetchone()[0]
                        data['userid'] = str(userid)
                
                # Upsert Candidate table logic
                if candidate_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        values.append(str(candidate_id))
                        query = f"UPDATE candidates SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    if userid and not candidate_id:
                        cursor.execute(
                            "SELECT id FROM candidates WHERE userid = ? AND isactive = 1",
                            str(userid),
                        )
                        existing_row = cursor.fetchone()
                        if existing_row:
                            candidate_id = existing_row[0]

                    if candidate_id and data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        values.append(str(candidate_id))
                        query = f"UPDATE candidates SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                    elif not candidate_id:
                        columns = []
                        placeholders = []
                        values = []

                        for key, value in data.items():
                            columns.append(key)
                            placeholders.append("?")
                            values.append(str(value) if isinstance(value, UUID) else value)

                        if columns:
                            query = f"INSERT INTO candidates ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                            cursor.execute(query, values)
                            candidate_id = cursor.fetchone()[0]
                        else:
                            query = "INSERT INTO candidates DEFAULT VALUES OUTPUT INSERTED.id"
                            cursor.execute(query)
                            candidate_id = cursor.fetchone()[0]

                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            
        return self.get_candidate_by_id(candidate_id, include_inactive=True)

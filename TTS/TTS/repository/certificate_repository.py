import json
import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.icertificate_repository import ICertificateRepository
from models.certificate import CertificateCreateUpdate, CertificateResponse
from config.settings import settings


class CertificateRepository(ICertificateRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        if data.get("skillsvalidated") and isinstance(data["skillsvalidated"], str):
            try:
                data["skillsvalidated"] = json.loads(data["skillsvalidated"])
            except Exception:
                pass
        return data

    def get_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[CertificateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM certificates WHERE id = ?", str(id))
            else:
                cursor.execute(
                    "SELECT * FROM certificates WHERE id = ? AND isactive = 1", str(id)
                )
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return CertificateResponse(**data) if data else None

    def get_by_candidate_id(self, candidateid: UUID) -> List[CertificateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM certificates WHERE candidateid = ? AND isactive = 1 ORDER BY issuedate DESC",
                str(candidateid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [
                CertificateResponse(**self._row_to_dict(cursor, row) or dict(zip(columns, row)))
                for row in rows
            ]

    def get_by_user_id(self, userid: UUID) -> List[CertificateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM certificates WHERE userid = ? AND isactive = 1 ORDER BY issuedate DESC",
                str(userid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [
                CertificateResponse(**self._row_to_dict(cursor, row) or dict(zip(columns, row)))
                for row in rows
            ]

    def upsert(self, certificate: CertificateCreateUpdate) -> CertificateResponse:
        data = certificate.dict(exclude_unset=True)
        cert_id = data.pop("id", None)

        if "skillsvalidated" in data and data["skillsvalidated"] is not None:
            if not isinstance(data["skillsvalidated"], str):
                data["skillsvalidated"] = json.dumps(data["skillsvalidated"])

        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                if cert_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        values.append(str(cert_id))
                        query = f"UPDATE certificates SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    columns = []
                    placeholders = []
                    values = []
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    query = f"INSERT INTO certificates ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                    cursor.execute(query, values)
                    cert_id = cursor.fetchone()[0]
                conn.commit()
            except Exception:
                conn.rollback()
                raise

        return self.get_by_id(cert_id, include_inactive=True)

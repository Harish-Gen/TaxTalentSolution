import pyodbc
from uuid import UUID, uuid4
from typing import List, Optional
from interfaces.isavedcandidate_repository import ISavedCandidateRepository
from models.savedcandidate import SavedCandidateCreateUpdate, SavedCandidateResponse
from config.settings import settings


class SavedCandidateRepository(ISavedCandidateRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_response(self, cursor, row) -> SavedCandidateResponse:
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        return SavedCandidateResponse(**data)

    def get_by_employer_id(self, employerid: UUID) -> List[SavedCandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM saved_candidates
                WHERE employerid = ? AND isactive = 1
                ORDER BY savedat DESC
                """,
                str(employerid),
            )
            rows = cursor.fetchall()
            return [self._row_to_response(cursor, row) for row in rows]

    def get_by_employer_and_candidate(
        self, employerid: UUID, candidateid: UUID
    ) -> Optional[SavedCandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM saved_candidates
                WHERE employerid = ? AND candidateid = ?
                """,
                str(employerid),
                str(candidateid),
            )
            row = cursor.fetchone()
            return self._row_to_response(cursor, row) if row else None

    def upsert(self, row: SavedCandidateCreateUpdate) -> SavedCandidateResponse:
        data = row.dict(exclude_unset=True)
        row_id = data.pop("id", None)
        employerid = data.get("employerid")
        candidateid = data.get("candidateid")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                existing = None
                if row_id:
                    cursor.execute("SELECT * FROM saved_candidates WHERE id = ?", str(row_id))
                    existing = cursor.fetchone()
                elif employerid and candidateid:
                    cursor.execute(
                        "SELECT * FROM saved_candidates WHERE employerid = ? AND candidateid = ?",
                        str(employerid),
                        str(candidateid),
                    )
                    existing = cursor.fetchone()

                if existing:
                    columns = [column[0] for column in cursor.description]
                    existing_data = dict(zip(columns, existing))
                    row_id = existing_data["id"]
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        values.append(str(row_id))
                        query = f"UPDATE saved_candidates SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    if not row_id:
                        row_id = uuid4()
                    columns = ["id"]
                    placeholders = ["?"]
                    values = [str(row_id)]
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    query = (
                        f"INSERT INTO saved_candidates ({', '.join(columns)}) "
                        f"VALUES ({', '.join(placeholders)})"
                    )
                    cursor.execute(query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

            cursor.execute("SELECT * FROM saved_candidates WHERE id = ?", str(row_id))
            row_out = cursor.fetchone()
            return self._row_to_response(cursor, row_out)

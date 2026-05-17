import pyodbc
from uuid import UUID, uuid4
from typing import List, Dict
from interfaces.iprofileview_repository import IProfileViewRepository
from models.profileview import ProfileViewCreate, ProfileViewResponse
from config.settings import settings


class ProfileViewRepository(IProfileViewRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_response(self, cursor, row) -> ProfileViewResponse:
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        return ProfileViewResponse(**data)

    def record(self, view: ProfileViewCreate) -> ProfileViewResponse:
        data = view.dict(exclude_unset=True)
        view_id = uuid4()
        columns = ["id"]
        placeholders = ["?"]
        values = [str(view_id)]
        for key, value in data.items():
            columns.append(key)
            placeholders.append("?")
            values.append(str(value) if isinstance(value, UUID) else value)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                query = (
                    f"INSERT INTO profile_views ({', '.join(columns)}) "
                    f"VALUES ({', '.join(placeholders)})"
                )
                cursor.execute(query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

            cursor.execute("SELECT * FROM profile_views WHERE id = ?", str(view_id))
            row = cursor.fetchone()
            return self._row_to_response(cursor, row)

    def get_counts_by_candidate_ids(self, candidate_ids: List[UUID]) -> Dict[str, int]:
        if not candidate_ids:
            return {}
        ids = [str(cid) for cid in candidate_ids]
        placeholders = ",".join("?" * len(ids))
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"""
                SELECT candidateid, COUNT(*) AS viewcount
                FROM profile_views
                WHERE candidateid IN ({placeholders})
                GROUP BY candidateid
                """,
                ids,
            )
            rows = cursor.fetchall()
            return {str(row[0]): int(row[1]) for row in rows}

    def get_by_employer_id(self, employerid: UUID) -> List[ProfileViewResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM profile_views
                WHERE employerid = ?
                ORDER BY viewedat DESC
                """,
                str(employerid),
            )
            rows = cursor.fetchall()
            return [self._row_to_response(cursor, row) for row in rows]

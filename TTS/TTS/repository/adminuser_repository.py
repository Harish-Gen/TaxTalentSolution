import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iadminuser_repository import IAdminUserRepository
from models.adminuser import AdminUserResponse
from config.settings import settings


class AdminUserRepository(IAdminUserRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_response(self, cursor, row) -> AdminUserResponse:
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        return AdminUserResponse(**data)

    def get_all(self) -> List[AdminUserResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM admin_users WHERE isactive = 1 ORDER BY createdon DESC"
            )
            rows = cursor.fetchall()
            return [self._row_to_response(cursor, row) for row in rows]

    def get_by_user_id(self, userid: UUID) -> Optional[AdminUserResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM admin_users WHERE userid = ? AND isactive = 1",
                str(userid),
            )
            row = cursor.fetchone()
            return self._row_to_response(cursor, row) if row else None

import pyodbc
from uuid import UUID
from typing import List
from interfaces.inotification_repository import INotificationRepository
from models.notification import NotificationCreateUpdate, NotificationResponse
from config.settings import settings


class NotificationRepository(INotificationRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def get_by_user_id(self, userid: UUID) -> List[NotificationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM notifications
                WHERE userid = ? AND isactive = 1
                ORDER BY createdon DESC
                """,
                str(userid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [NotificationResponse(**dict(zip(columns, row))) for row in rows]

    def upsert(self, notification: NotificationCreateUpdate) -> NotificationResponse:
        data = notification.dict(exclude_unset=True)
        notif_id = data.pop("id", None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                if notif_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        values.append(str(notif_id))
                        query = f"UPDATE notifications SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    columns = []
                    placeholders = []
                    values = []
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    query = f"INSERT INTO notifications ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                    cursor.execute(query, values)
                    notif_id = cursor.fetchone()[0]
                conn.commit()
            except Exception:
                conn.rollback()
                raise

            cursor.execute("SELECT * FROM notifications WHERE id = ?", str(notif_id))
            row = cursor.fetchone()
            columns = [column[0] for column in cursor.description]
            return NotificationResponse(**dict(zip(columns, row)))

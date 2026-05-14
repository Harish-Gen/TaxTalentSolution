import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iuser_repository import IUserRepository
from models.user import UserCreateUpdate, UserResponse
from config.settings import settings

class UserRepository(IUserRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def _get_employer_ids_for_user(self, cursor, user_id: str) -> List[UUID]:
        cursor.execute("SELECT employerid FROM user_employers WHERE userid = ? AND isactive = 1", user_id)
        rows = cursor.fetchall()
        return [UUID(row[0]) for row in rows]

    def _get_role_for_user(self, cursor, role_id: str) -> Optional[dict]:
        if not role_id:
            return None
        cursor.execute("SELECT * FROM roles WHERE id = ?", str(role_id))
        row = cursor.fetchone()
        return self._row_to_dict(cursor, row)

    def _get_employers_for_user(self, cursor, user_id: str) -> List[dict]:
        cursor.execute("""
            SELECT e.* 
            FROM employers e
            JOIN user_employers ue ON e.id = ue.employerid
            WHERE ue.userid = ? AND ue.isactive = 1
        """, str(user_id))
        rows = cursor.fetchall()
        return [self._row_to_dict(cursor, row) for row in rows]

    def get_user_by_id(self, user_id: UUID, include_inactive: bool = False) -> Optional[UserResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM users WHERE id = ?", str(user_id))
            else:
                cursor.execute("SELECT * FROM users WHERE id = ? AND isactive = 1", str(user_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                data['employer_ids'] = self._get_employer_ids_for_user(cursor, str(user_id))
                data['role'] = self._get_role_for_user(cursor, data.get('roleid'))
                data['employers'] = self._get_employers_for_user(cursor, str(user_id))
                return UserResponse(**data)
            return None

    def get_all_users(self) -> List[UserResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE isactive = 1")
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                data = self._row_to_dict(cursor, row)
                data['employer_ids'] = self._get_employer_ids_for_user(cursor, str(data['id']))
                data['role'] = self._get_role_for_user(cursor, data.get('roleid'))
                data['employers'] = self._get_employers_for_user(cursor, str(data['id']))
                results.append(UserResponse(**data))
            return results

    def upsert_user(self, user: UserCreateUpdate) -> UserResponse:
        data = user.dict(exclude_unset=True)
        
        # Pop employer_ids so it doesn't go into the users table update/insert
        employer_ids = data.pop('employer_ids', None)
        user_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                if user_id:
                    # UPDATE scenario
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(value)
                        
                        values.append(str(user_id))
                        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    # CREATE scenario
                    columns = []
                    placeholders = []
                    values = []
                    
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(value)
                    
                    query = f"INSERT INTO users ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                    cursor.execute(query, values)
                    user_id = cursor.fetchone()[0]
                
                # Now handle child table user_employers if employer_ids was provided
                if employer_ids is not None:
                    # 1. Deactivate existing links
                    cursor.execute("UPDATE user_employers SET isactive = 0 WHERE userid = ?", str(user_id))
                    
                    # 2. Re-insert or Reactivate new links
                    for emp_id in employer_ids:
                        # Check if link exists
                        cursor.execute("SELECT id FROM user_employers WHERE userid = ? AND employerid = ?", str(user_id), str(emp_id))
                        link_row = cursor.fetchone()
                        if link_row:
                            # Reactivate
                            cursor.execute("UPDATE user_employers SET isactive = 1 WHERE id = ?", link_row[0])
                        else:
                            # Insert
                            cursor.execute("INSERT INTO user_employers (userid, employerid) VALUES (?, ?)", str(user_id), str(emp_id))

                conn.commit()
                
            except Exception as e:
                conn.rollback()
                raise e

        # Outside the transaction block, get the fully formed response
        return self.get_user_by_id(user_id, include_inactive=True)

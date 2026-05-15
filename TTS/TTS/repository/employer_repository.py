import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iemployer_repository import IEmployerRepository
from models.employer import EmployerCreateUpdate, EmployerResponse
from config.settings import settings

class EmployerRepository(IEmployerRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

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
                if data.get('userid'):
                    data['user'] = self._get_user_for_employer(cursor, data['userid'])
                return EmployerResponse(**data)
            return None

    def get_all_employers(self) -> List[EmployerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employers WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('userid'):
                    data['user'] = self._get_user_for_employer(cursor, data['userid'])
                results.append(EmployerResponse(**data))
            return results

    def upsert_employer(self, employer: EmployerCreateUpdate) -> EmployerResponse:
        data = employer.dict(exclude_unset=True)
        
        name = data.pop('name', None)
        email = data.pop('email', None)
        phone = data.pop('phone', None)
        
        if not name and data.get('contactperson'):
            name = data.get('contactperson')

        employer_id = data.pop('id', None)
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
                        if email:
                            cursor.execute("SELECT id FROM users WHERE email = ?", email)
                            if cursor.fetchone():
                                raise ValueError("A user with this email already exists.")
                        
                        cursor.execute("""
                            INSERT INTO users (name, email, phone, roleid) 
                            OUTPUT INSERTED.id 
                            VALUES (?, ?, ?, ?)
                        """, (name, email, phone, settings.default_employer_role_id))
                        userid = cursor.fetchone()[0]
                        data['userid'] = str(userid)
                
                # Upsert Employer table logic
                if employer_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        values.append(str(employer_id))
                        query = f"UPDATE employers SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    columns = []
                    placeholders = []
                    values = []
                    
                    for key, value in data.items():
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

                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            
        return self.get_employer_by_id(employer_id, include_inactive=True)

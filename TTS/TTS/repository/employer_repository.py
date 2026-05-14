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

    def get_employer_by_id(self, employer_id: UUID, include_inactive: bool = False) -> Optional[EmployerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM employers WHERE id = ?", str(employer_id))
            else:
                cursor.execute("SELECT * FROM employers WHERE id = ? AND isactive = 1", str(employer_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return EmployerResponse(**data) if data else None

    def get_all_employers(self) -> List[EmployerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employers WHERE isactive = 1")
            rows = cursor.fetchall()
            return [EmployerResponse(**self._row_to_dict(cursor, row)) for row in rows]

    def upsert_employer(self, employer: EmployerCreateUpdate) -> EmployerResponse:
        data = employer.dict(exclude_unset=True)

        employer_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            if employer_id:
                # UPDATE scenario
                if not data:
                    return self.get_employer_by_id(employer_id, include_inactive=True)

                set_clauses = []
                values = []
                for key, value in data.items():
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
                
                values.append(str(employer_id))
                
                query = f"UPDATE employers SET {', '.join(set_clauses)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                
                return self.get_employer_by_id(employer_id, include_inactive=True)
            else:
                # CREATE scenario
                columns = []
                placeholders = []
                values = []
                
                for key, value in data.items():
                    columns.append(key)
                    placeholders.append("?")
                    values.append(value)
                
                query = f"INSERT INTO employers ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                cursor.execute(query, values)
                new_id = cursor.fetchone()[0]
                conn.commit()
                
                return self.get_employer_by_id(new_id, include_inactive=True)

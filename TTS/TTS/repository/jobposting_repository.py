import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.ijobposting_repository import IJobPostingRepository
from models.jobposting import JobPostingCreateUpdate, JobPostingResponse
from config.settings import settings

class JobPostingRepository(IJobPostingRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        
        # Parse JSON fields if they are strings
        for json_field in ['requirements', 'responsibilities', 'benefits']:
            if data.get(json_field):
                try:
                    data[json_field] = json.loads(data[json_field])
                except Exception:
                    pass
        return data

    def get_jobposting_by_id(self, jobposting_id: UUID, include_inactive: bool = False) -> Optional[JobPostingResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM jobpostings WHERE id = ?", str(jobposting_id))
            else:
                cursor.execute("SELECT * FROM jobpostings WHERE id = ? AND isactive = 1", str(jobposting_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return JobPostingResponse(**data) if data else None

    def get_all_jobpostings(self) -> List[JobPostingResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM jobpostings")
            rows = cursor.fetchall()
            return [JobPostingResponse(**self._row_to_dict(cursor, row)) for row in rows]

    def get_jobpostings_by_title(self, jobtitle: str) -> List[JobPostingResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM jobpostings WHERE jobtitle LIKE ? AND isactive = 1", f"%{jobtitle}%")
            rows = cursor.fetchall()
            return [JobPostingResponse(**self._row_to_dict(cursor, row)) for row in rows]

    def upsert_jobposting(self, jobposting: JobPostingCreateUpdate) -> JobPostingResponse:
        data = jobposting.dict(exclude_unset=True)
        
        # Convert lists/dicts to JSON strings
        for field in ['requirements', 'responsibilities', 'benefits']:
            if field in data and isinstance(data[field], (dict, list)):
                data[field] = json.dumps(data[field])

        jobposting_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            if jobposting_id:
                # UPDATE scenario
                if not data:
                    return self.get_jobposting_by_id(jobposting_id, include_inactive=True)

                set_clauses = []
                values = []
                for key, value in data.items():
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
                
                values.append(str(jobposting_id))
                
                query = f"UPDATE jobpostings SET {', '.join(set_clauses)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                
                return self.get_jobposting_by_id(jobposting_id, include_inactive=True)
            else:
                # CREATE scenario
                columns = []
                placeholders = []
                values = []
                
                for key, value in data.items():
                    columns.append(key)
                    placeholders.append("?")
                    values.append(value)
                
                query = f"INSERT INTO jobpostings ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                cursor.execute(query, values)
                new_id = cursor.fetchone()[0]
                conn.commit()
                
                return self.get_jobposting_by_id(new_id, include_inactive=True)

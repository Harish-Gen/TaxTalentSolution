import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.icandidate_repository import ICandidateRepository
from models.candidate import CandidateCreateUpdate, CandidateResponse
from config.settings import settings

class CandidateRepository(ICandidateRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        
        # Parse JSON fields if they are strings
        for json_field in ['location', 'taxexpertise', 'certifications']:
            if data.get(json_field):
                try:
                    data[json_field] = json.loads(data[json_field])
                except Exception:
                    pass
        return data

    def get_candidate_by_id(self, candidate_id: UUID, include_inactive: bool = False) -> Optional[CandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM candidates WHERE id = ?", str(candidate_id))
            else:
                cursor.execute("SELECT * FROM candidates WHERE id = ? AND isactive = 1", str(candidate_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return CandidateResponse(**data) if data else None

    def get_all_candidates(self) -> List[CandidateResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM candidates WHERE isactive = 1")
            rows = cursor.fetchall()
            return [CandidateResponse(**self._row_to_dict(cursor, row)) for row in rows]

    def upsert_candidate(self, candidate: CandidateCreateUpdate) -> CandidateResponse:
        data = candidate.dict(exclude_unset=True) # Only get fields that were explicitly set
        
        # Convert lists/dicts to JSON strings
        for field in ['location', 'taxexpertise', 'certifications']:
            if field in data and isinstance(data[field], (dict, list)):
                data[field] = json.dumps(data[field])

        candidate_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            if candidate_id:
                # UPDATE scenario
                if not data:
                    # Nothing to update, just return the existing candidate
                    return self.get_candidate_by_id(candidate_id, include_inactive=True)

                set_clauses = []
                values = []
                for key, value in data.items():
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
                
                # Append id for the WHERE clause
                values.append(str(candidate_id))
                
                query = f"UPDATE candidates SET {', '.join(set_clauses)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                
                return self.get_candidate_by_id(candidate_id, include_inactive=True)
            else:
                # CREATE scenario
                columns = []
                placeholders = []
                values = []
                
                for key, value in data.items():
                    columns.append(key)
                    placeholders.append("?")
                    values.append(value)
                
                query = f"INSERT INTO candidates ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                cursor.execute(query, values)
                new_id = cursor.fetchone()[0]
                conn.commit()
                
                return self.get_candidate_by_id(new_id, include_inactive=True)

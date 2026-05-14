import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iassessment_repository import IAssessmentRepository
from models.assessment import AssessmentCreateUpdate, AssessmentResponse
from config.settings import settings

class AssessmentRepository(IAssessmentRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def get_assessment_by_id(self, assessment_id: UUID, include_inactive: bool = False) -> Optional[AssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM assessments WHERE id = ?", str(assessment_id))
            else:
                cursor.execute("SELECT * FROM assessments WHERE id = ? AND isactive = 1", str(assessment_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return AssessmentResponse(**data) if data else None

    def get_all_assessments(self) -> List[AssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM assessments WHERE isactive = 1")
            rows = cursor.fetchall()
            return [AssessmentResponse(**self._row_to_dict(cursor, row)) for row in rows]

    def upsert_assessment(self, assessment: AssessmentCreateUpdate) -> AssessmentResponse:
        data = assessment.dict(exclude_unset=True)

        assessment_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            if assessment_id:
                # UPDATE scenario
                if not data:
                    return self.get_assessment_by_id(assessment_id, include_inactive=True)

                set_clauses = []
                values = []
                for key, value in data.items():
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
                
                values.append(str(assessment_id))
                
                query = f"UPDATE assessments SET {', '.join(set_clauses)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                
                return self.get_assessment_by_id(assessment_id, include_inactive=True)
            else:
                # CREATE scenario
                columns = []
                placeholders = []
                values = []
                
                for key, value in data.items():
                    columns.append(key)
                    placeholders.append("?")
                    values.append(value)
                
                query = f"INSERT INTO assessments ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                cursor.execute(query, values)
                new_id = cursor.fetchone()[0]
                conn.commit()
                
                return self.get_assessment_by_id(new_id, include_inactive=True)

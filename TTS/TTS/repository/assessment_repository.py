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

    def _to_response(self, cursor, row) -> Optional[AssessmentResponse]:
        data = self._row_to_dict(cursor, row)
        if not data:
            return None
        allowed = set(AssessmentResponse.model_fields.keys())
        filtered = {k: v for k, v in data.items() if k in allowed}
        return AssessmentResponse(**filtered)

    def get_assessment_by_id(self, assessment_id: UUID, include_inactive: bool = False) -> Optional[AssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM assessments WHERE id = ?", str(assessment_id))
            else:
                cursor.execute("SELECT * FROM assessments WHERE id = ? AND isactive = 1", str(assessment_id))
            row = cursor.fetchone()
            return self._to_response(cursor, row)

    def get_all_assessments(self) -> List[AssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM assessments WHERE isactive = 1")
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = self._to_response(cursor, row)
                if item:
                    results.append(item)
            return results

    def upsert_assessment(self, assessment: AssessmentCreateUpdate) -> AssessmentResponse:
        data = assessment.dict(exclude_unset=True)

        if data.get('isactive') is None:
            data['isactive'] = True

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

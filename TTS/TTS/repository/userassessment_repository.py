import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.iuserassessment_repository import IUserAssessmentRepository
from models.userassessment import UserAssessmentCreateUpdate, UserAssessmentResponse
from config.settings import settings

class UserAssessmentRepository(IUserAssessmentRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def get_userassessment_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserAssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM user_assessments WHERE id = ?", str(id))
            else:
                cursor.execute("SELECT * FROM user_assessments WHERE id = ? AND isactive = 1", str(id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                return UserAssessmentResponse(**data)
            return None

    def get_all_userassessments(self) -> List[UserAssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_assessments WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                results.append(UserAssessmentResponse(**data))
            return results

    def get_userassessments_by_user_id(self, userid: UUID) -> List[UserAssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_assessments WHERE userid = ? AND isactive = 1", str(userid))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                results.append(UserAssessmentResponse(**data))
            return results

    def get_userassessments_by_assessment_id(self, assessmentid: UUID) -> List[UserAssessmentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_assessments WHERE assessmentid = ? AND isactive = 1", str(assessmentid))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                results.append(UserAssessmentResponse(**data))
            return results

    def upsert_userassessment(self, ua: UserAssessmentCreateUpdate) -> UserAssessmentResponse:
        data = ua.dict(exclude_unset=True)
            
        ua_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                if ua_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        values.append(str(ua_id))
                        query = f"UPDATE user_assessments SET {', '.join(set_clauses)} WHERE id = ?"
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
                        query = f"INSERT INTO user_assessments ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                        cursor.execute(query, values)
                        ua_id = cursor.fetchone()[0]
                    else:
                        query = "INSERT INTO user_assessments DEFAULT VALUES OUTPUT INSERTED.id"
                        cursor.execute(query)
                        ua_id = cursor.fetchone()[0]
                
                conn.commit()
                
            except Exception as e:
                conn.rollback()
                raise e

        return self.get_userassessment_by_id(ua_id, include_inactive=True)

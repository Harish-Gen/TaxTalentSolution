import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.iuserassessmentanswer_repository import IUserAssessmentAnswerRepository
from models.userassessmentanswer import UserAssessmentAnswerCreateUpdate, UserAssessmentAnswerResponse
from config.settings import settings

class UserAssessmentAnswerRepository(IUserAssessmentAnswerRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        if data.get('answersjson'):
            try:
                data['answersjson'] = json.loads(data['answersjson'])
            except Exception:
                pass
        return data

    def get_userassessmentanswer_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserAssessmentAnswerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM user_assessment_answers WHERE id = ?", str(id))
            else:
                cursor.execute("SELECT * FROM user_assessment_answers WHERE id = ? AND isactive = 1", str(id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                return UserAssessmentAnswerResponse(**data)
            return None

    def get_all_userassessmentanswers(self) -> List[UserAssessmentAnswerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_assessment_answers WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('answersjson'):
                    try:
                        data['answersjson'] = json.loads(data['answersjson'])
                    except Exception:
                        pass
                results.append(UserAssessmentAnswerResponse(**data))
            return results

    def get_userassessmentanswers_by_userassessmentid(self, userassessmentid: UUID) -> List[UserAssessmentAnswerResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_assessment_answers WHERE userassessmentid = ? AND isactive = 1", str(userassessmentid))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('answersjson'):
                    try:
                        data['answersjson'] = json.loads(data['answersjson'])
                    except Exception:
                        pass
                results.append(UserAssessmentAnswerResponse(**data))
            return results

    def upsert_userassessmentanswer(self, ua_answer: UserAssessmentAnswerCreateUpdate) -> UserAssessmentAnswerResponse:
        data = ua_answer.dict(exclude_unset=True)
        
        if 'answersjson' in data and isinstance(data['answersjson'], (dict, list)):
            data['answersjson'] = json.dumps(data['answersjson'])
            
        ua_answer_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                if ua_answer_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        values.append(str(ua_answer_id))
                        query = f"UPDATE user_assessment_answers SET {', '.join(set_clauses)} WHERE id = ?"
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
                        query = f"INSERT INTO user_assessment_answers ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                        cursor.execute(query, values)
                        ua_answer_id = cursor.fetchone()[0]
                    else:
                        query = "INSERT INTO user_assessment_answers DEFAULT VALUES OUTPUT INSERTED.id"
                        cursor.execute(query)
                        ua_answer_id = cursor.fetchone()[0]
                
                conn.commit()
                
            except Exception as e:
                conn.rollback()
                raise e

        return self.get_userassessmentanswer_by_id(ua_answer_id, include_inactive=True)

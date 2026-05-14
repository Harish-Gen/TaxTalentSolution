import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.iquestion_repository import IQuestionRepository
from models.question import QuestionCreateUpdate, QuestionResponse
from config.settings import settings

class QuestionRepository(IQuestionRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        if data.get('qajson'):
            try:
                data['qajson'] = json.loads(data['qajson'])
            except Exception:
                pass
        return data

    def _get_assessment_ids_for_question(self, cursor, question_id: str) -> List[UUID]:
        cursor.execute("SELECT assessmentid FROM assessment_questions WHERE questionid = ? AND isactive = 1", question_id)
        rows = cursor.fetchall()
        return [UUID(row[0]) for row in rows]

    def _get_assessments_for_question(self, cursor, question_id: str) -> List[dict]:
        cursor.execute("""
            SELECT a.* 
            FROM assessments a
            JOIN assessment_questions aq ON a.id = aq.assessmentid
            WHERE aq.questionid = ? AND aq.isactive = 1
        """, str(question_id))
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            columns = [column[0] for column in cursor.description]
            results.append(dict(zip(columns, row)))
        return results

    def get_question_by_id(self, question_id: UUID, include_inactive: bool = False) -> Optional[QuestionResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM questions WHERE id = ?", str(question_id))
            else:
                cursor.execute("SELECT * FROM questions WHERE id = ? AND isactive = 1", str(question_id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                data['assessment_ids'] = self._get_assessment_ids_for_question(cursor, str(question_id))
                data['assessments'] = self._get_assessments_for_question(cursor, str(question_id))
                return QuestionResponse(**data)
            return None

    def get_all_questions(self) -> List[QuestionResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM questions WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('qajson'):
                    try:
                        data['qajson'] = json.loads(data['qajson'])
                    except Exception:
                        pass
                data['assessment_ids'] = self._get_assessment_ids_for_question(cursor, str(data['id']))
                data['assessments'] = self._get_assessments_for_question(cursor, str(data['id']))
                results.append(QuestionResponse(**data))
            return results

    def get_questions_by_assessment_id(self, assessment_id: UUID) -> List[QuestionResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT q.* 
                FROM questions q
                JOIN assessment_questions aq ON q.id = aq.questionid
                WHERE aq.assessmentid = ? AND aq.isactive = 1 AND q.isactive = 1
            """, str(assessment_id))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('qajson'):
                    try:
                        data['qajson'] = json.loads(data['qajson'])
                    except Exception:
                        pass
                data['assessment_ids'] = self._get_assessment_ids_for_question(cursor, str(data['id']))
                data['assessments'] = self._get_assessments_for_question(cursor, str(data['id']))
                results.append(QuestionResponse(**data))
            return results

    def upsert_question(self, question: QuestionCreateUpdate) -> QuestionResponse:
        data = question.dict(exclude_unset=True)
        
        # Convert qajson to string if it's a dict/list
        if 'qajson' in data and isinstance(data['qajson'], (dict, list)):
            data['qajson'] = json.dumps(data['qajson'])
            
        assessment_ids = data.pop('assessment_ids', None)
        question_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                if question_id:
                    # UPDATE scenario
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(value)
                        
                        values.append(str(question_id))
                        query = f"UPDATE questions SET {', '.join(set_clauses)} WHERE id = ?"
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
                    
                    if columns:
                        query = f"INSERT INTO questions ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                        cursor.execute(query, values)
                        question_id = cursor.fetchone()[0]
                    else:
                        query = "INSERT INTO questions DEFAULT VALUES OUTPUT INSERTED.id"
                        cursor.execute(query)
                        question_id = cursor.fetchone()[0]
                
                # Now handle child table assessment_questions if assessment_ids was provided
                if assessment_ids is not None:
                    # 1. Deactivate existing links
                    cursor.execute("UPDATE assessment_questions SET isactive = 0 WHERE questionid = ?", str(question_id))
                    
                    # 2. Re-insert or Reactivate new links
                    for asmt_id in assessment_ids:
                        # Check if link exists
                        cursor.execute("SELECT id FROM assessment_questions WHERE questionid = ? AND assessmentid = ?", str(question_id), str(asmt_id))
                        link_row = cursor.fetchone()
                        if link_row:
                            # Reactivate
                            cursor.execute("UPDATE assessment_questions SET isactive = 1 WHERE id = ?", link_row[0])
                        else:
                            # Insert
                            cursor.execute("INSERT INTO assessment_questions (questionid, assessmentid) VALUES (?, ?)", str(question_id), str(asmt_id))

                conn.commit()
                
            except Exception as e:
                conn.rollback()
                raise e

        # Outside the transaction block, get the fully formed response
        return self.get_question_by_id(question_id, include_inactive=True)

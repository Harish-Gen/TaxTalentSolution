import pyodbc
import json
from uuid import UUID
from typing import List, Optional
from interfaces.iusercompetency_repository import IUserCompetencyRepository
from models.usercompetency import UserCompetencyCreateUpdate, UserCompetencyResponse
from config.settings import settings

class UserCompetencyRepository(IUserCompetencyRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        if data.get('competenciesjson'):
            try:
                data['competenciesjson'] = json.loads(data['competenciesjson'])
            except Exception:
                pass
        return data

    def get_usercompetency_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserCompetencyResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM usercompetencies WHERE id = ?", str(id))
            else:
                cursor.execute("SELECT * FROM usercompetencies WHERE id = ? AND isactive = 1", str(id))
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            if data:
                return UserCompetencyResponse(**data)
            return None

    def get_all_usercompetencies(self) -> List[UserCompetencyResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usercompetencies WHERE isactive = 1")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('competenciesjson'):
                    try:
                        data['competenciesjson'] = json.loads(data['competenciesjson'])
                    except Exception:
                        pass
                results.append(UserCompetencyResponse(**data))
            return results

    def get_usercompetencies_by_user_id(self, userid: UUID) -> List[UserCompetencyResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usercompetencies WHERE userid = ? AND isactive = 1", str(userid))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            
            results = []
            for row in rows:
                data = dict(zip(columns, row))
                if data.get('competenciesjson'):
                    try:
                        data['competenciesjson'] = json.loads(data['competenciesjson'])
                    except Exception:
                        pass
                results.append(UserCompetencyResponse(**data))
            return results

    def upsert_usercompetency(self, comp: UserCompetencyCreateUpdate) -> UserCompetencyResponse:
        data = comp.dict(exclude_unset=True)
        
        # Convert competenciesjson to string if it's a dict/list
        if 'competenciesjson' in data and isinstance(data['competenciesjson'], (dict, list)):
            data['competenciesjson'] = json.dumps(data['competenciesjson'])
            
        comp_id = data.pop('id', None)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            try:
                if comp_id:
                    # UPDATE scenario
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        
                        values.append(str(comp_id))
                        query = f"UPDATE usercompetencies SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    # CREATE scenario
                    columns = []
                    placeholders = []
                    values = []
                    
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    
                    if columns:
                        query = f"INSERT INTO usercompetencies ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                        cursor.execute(query, values)
                        comp_id = cursor.fetchone()[0]
                    else:
                        query = "INSERT INTO usercompetencies DEFAULT VALUES OUTPUT INSERTED.id"
                        cursor.execute(query)
                        comp_id = cursor.fetchone()[0]
                
                conn.commit()
                
            except Exception as e:
                conn.rollback()
                raise e

        # Outside the transaction block, get the fully formed response
        return self.get_usercompetency_by_id(comp_id, include_inactive=True)

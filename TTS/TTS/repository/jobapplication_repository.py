import pyodbc
from uuid import UUID
from typing import List, Optional
from interfaces.ijobapplication_repository import IJobApplicationRepository
from models.jobapplication import JobApplicationCreateUpdate, JobApplicationResponse
from config.settings import settings


class JobApplicationRepository(IJobApplicationRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_dict(self, cursor, row):
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

    def get_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM job_applications WHERE id = ?", str(id))
            else:
                cursor.execute(
                    "SELECT * FROM job_applications WHERE id = ? AND isactive = 1", str(id)
                )
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return JobApplicationResponse(**data) if data else None

    def get_all(self) -> List[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM job_applications WHERE isactive = 1 ORDER BY appliedat DESC")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [JobApplicationResponse(**dict(zip(columns, row))) for row in rows]

    def get_by_candidate_id(self, candidateid: UUID) -> List[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM job_applications WHERE candidateid = ? AND isactive = 1 ORDER BY appliedat DESC",
                str(candidateid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [JobApplicationResponse(**dict(zip(columns, row))) for row in rows]

    def get_by_user_id(self, userid: UUID) -> List[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM job_applications WHERE userid = ? AND isactive = 1 ORDER BY appliedat DESC",
                str(userid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [JobApplicationResponse(**dict(zip(columns, row))) for row in rows]

    def get_by_employer_id(self, employerid: UUID) -> List[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM job_applications WHERE employerid = ? AND isactive = 1 ORDER BY appliedat DESC",
                str(employerid),
            )
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description] if cursor.description else []
            return [JobApplicationResponse(**dict(zip(columns, row))) for row in rows]

    def get_by_job_and_candidate(
        self, jobpostingid: UUID, candidateid: UUID
    ) -> Optional[JobApplicationResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT TOP 1 * FROM job_applications
                WHERE jobpostingid = ? AND candidateid = ?
                ORDER BY appliedat DESC
                """,
                str(jobpostingid),
                str(candidateid),
            )
            row = cursor.fetchone()
            data = self._row_to_dict(cursor, row)
            return JobApplicationResponse(**data) if data else None

    def upsert(self, application: JobApplicationCreateUpdate) -> JobApplicationResponse:
        data = application.dict(exclude_unset=True)
        app_id = data.pop("id", None)

        if not app_id:
            job_id = data.get("jobpostingid", application.jobpostingid)
            candidate_id = data.get("candidateid", application.candidateid)
            if job_id and candidate_id:
                existing = self.get_by_job_and_candidate(job_id, candidate_id)
                if existing:
                    app_id = existing.id

        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                if app_id:
                    if data:
                        set_clauses = []
                        values = []
                        for key, value in data.items():
                            set_clauses.append(f"{key} = ?")
                            values.append(str(value) if isinstance(value, UUID) else value)
                        set_clauses.append("modifiedon = SYSUTCDATETIME()")
                        if "isactive" not in data:
                            set_clauses.append("isactive = 1")
                        values.append(str(app_id))
                        query = f"UPDATE job_applications SET {', '.join(set_clauses)} WHERE id = ?"
                        cursor.execute(query, values)
                else:
                    columns = []
                    placeholders = []
                    values = []
                    for key, value in data.items():
                        columns.append(key)
                        placeholders.append("?")
                        values.append(str(value) if isinstance(value, UUID) else value)
                    query = f"INSERT INTO job_applications ({', '.join(columns)}) OUTPUT INSERTED.id VALUES ({', '.join(placeholders)})"
                    cursor.execute(query, values)
                    app_id = cursor.fetchone()[0]
                conn.commit()
            except Exception:
                conn.rollback()
                raise

        return self.get_by_id(app_id, include_inactive=True)

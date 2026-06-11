import pyodbc
from uuid import UUID, uuid4
from typing import List, Optional
from interfaces.ipayment_repository import IPaymentRepository
from models.payment import PaymentCreateUpdate, PaymentResponse
from config.settings import settings

class PaymentRepository(IPaymentRepository):
    def _get_connection(self):
        return pyodbc.connect(settings.database_connection_string)

    def _row_to_response(self, cursor, row) -> PaymentResponse:
        columns = [column[0] for column in cursor.description]
        data = dict(zip(columns, row))
        return PaymentResponse(**data)

    def create(self, payment: PaymentCreateUpdate) -> PaymentResponse:
        payment_id = payment.id or uuid4()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO payments (
                    id, userid, assessmentid, plan_name, amount, 
                    razorpay_order_id, razorpay_payment_id, razorpay_signature, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                str(payment_id),
                str(payment.userid),
                str(payment.assessmentid) if payment.assessmentid else None,
                payment.plan_name,
                payment.amount,
                payment.razorpay_order_id,
                payment.razorpay_payment_id,
                payment.razorpay_signature,
                payment.status
            )
            conn.commit()
            
            cursor.execute("SELECT * FROM payments WHERE id = ?", str(payment_id))
            row = cursor.fetchone()
            if not row:
                raise Exception("Failed to retrieve created payment record")
            return self._row_to_response(cursor, row)

    def get_by_order_id(self, order_id: str) -> Optional[PaymentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM payments WHERE razorpay_order_id = ? AND isactive = 1",
                order_id
            )
            row = cursor.fetchone()
            return self._row_to_response(cursor, row) if row else None

    def get_by_user_id(self, user_id: UUID) -> List[PaymentResponse]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM payments WHERE userid = ? AND isactive = 1 ORDER BY createdon DESC",
                str(user_id)
            )
            rows = cursor.fetchall()
            return [self._row_to_response(cursor, row) for row in rows]

import { apiRequest } from './apiService';

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface PaymentResponse {
  id: string;
  userid: string;
  assessmentid: string | null;
  plan_name: string | null;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  status: string;
  createdon: string;
  isactive: boolean;
}

export const paymentService = {
  createOrder: async (amount: number, receipt?: string, assessmentId?: string, planName?: string): Promise<CreateOrderResponse> => {
    return apiRequest<CreateOrderResponse>('/api/payment/create-order', 'POST', {
      amount,
      receipt,
      assessmentid: assessmentId || null,
      plan_name: planName || null,
    });
  },

  verifySignature: async (
    paymentId: string,
    orderId: string,
    signature: string,
    userId: string,
    assessmentId?: string,
    planName?: string,
    amount?: number
  ): Promise<PaymentResponse> => {
    return apiRequest<PaymentResponse>('/api/payment/verify-signature', 'POST', {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      userid: userId,
      assessmentid: assessmentId || null,
      plan_name: planName || null,
      amount: amount || 0,
    });
  },

  getUserPayments: async (userId: string): Promise<PaymentResponse[]> => {
    return apiRequest<PaymentResponse[]>(`/api/payment/user/${userId}`, 'GET');
  },
};

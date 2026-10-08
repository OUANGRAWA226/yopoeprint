import { api } from './api'

export interface InitiatePaymentDto {
  orderId: string
  amount: number
  paymentMethod: string // 'orange_money' | 'moov_money' | 'card'
  phoneNumber?: string
  returnUrl?: string
  notifyUrl?: string
}

export interface ValidateOtpDto {
  paymentId: string
  otp: string
}

export const paymentService = {
  /**
   * Initialize a payment (either returns a URL for redirection, or a payment ID for OTP)
   */
  async initiatePayment(data: InitiatePaymentDto) {
    const res = await api.post('/payments/initiate', data)
    return res.data
  },

  /**
   * Validate an OTP for Seamless Mobile Money payments
   */
  async validateOtp(data: ValidateOtpDto) {
    const res = await api.post('/payments/validate-otp', data)
    return res.data
  },

  /**
   * Check payment status
   */
  async checkStatus(paymentId: string) {
    const res = await api.get(`/payments/${paymentId}/status`)
    return res.data
  }
}

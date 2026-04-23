import axios, { AxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import adminSystemSettingService from '~/services/admin/system-setting.service.js'

type CreateSePayOrderPayload = {
  amount: number
  order_code: string
  with_qrcode: '0' | '1'
}

type CreateSePayOrderResponse = {
  id: string
  order_code: string
  va_number?: string
  va_holder_name?: string
  amount: number
  status: string
  bank_name?: string
  account_holder_name?: string
  account_number?: string
  expired_at?: string | null
  qr_code?: string
  qr_code_url?: string
}

class SePayProvider {
  private readonly client = axios.create({
    baseURL: 'https://userapi.sepay.vn',
    timeout: 30000
  })

  private async ensureConfigured() {
    const sePayConfig = await adminSystemSettingService.getSePayConfig()
    const apiToken = await adminSystemSettingService.getSePayApiToken()

    if (!apiToken || !sePayConfig.bank_account_id) {
      throw new AppError({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: UserMessages.SERVER_ERROR
      })
    }

    return {
      ...sePayConfig,
      apiToken
    }
  }

  async createOrder(payload: CreateSePayOrderPayload): Promise<CreateSePayOrderResponse> {
    const sePayConfig = await this.ensureConfigured()

    try {
      const response = await this.client.post<{ data: CreateSePayOrderResponse }>(
        `/v2/bank-accounts/${sePayConfig.bank_account_id}/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sePayConfig.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      const message = axiosError.response?.data?.message || axiosError.message || UserMessages.SERVER_ERROR

      throw new AppError({
        statusCode: StatusCodes.BAD_GATEWAY,
        message
      })
    }
  }
}

const sepayProvider = new SePayProvider()
export default sepayProvider

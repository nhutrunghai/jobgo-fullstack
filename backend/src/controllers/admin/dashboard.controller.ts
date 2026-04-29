import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import adminDashboardService from '~/services/admin/dashboard.service.js'

export const getAdminDashboardSummaryController = async (req: Request, res: Response) => {
  const summary = await adminDashboardService.getSummary()

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: summary
  })
}

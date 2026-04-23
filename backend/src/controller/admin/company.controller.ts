import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import {
  AdminAuditAction,
  AdminAuditTargetType,
  JobApplicationStatus,
  JobStatus,
  NotificationType
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AdminCompanyLocals } from '~/models/requests/responseType.js'
import adminAuditLogService from '~/services/admin/audit-log.service.js'
import adminCompanyService from '~/services/admin/company.service.js'
import notificationService from '~/services/client/notification.service.js'

export const getAdminCompaniesController = async (req: Request, res: Response) => {
  const verified = typeof req.query.verified === 'boolean' ? req.query.verified : undefined
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  const result = await adminCompanyService.getCompanies({
    verified,
    keyword,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      companies: result.companies.map((company) => ({
        _id: company._id,
        company_name: company.company_name,
        logo: company.logo,
        website: company.website,
        address: company.address,
        verified: company.verified,
        created_at: company.created_at,
        updated_at: company.updated_at
      })),
      pagination: result.pagination
    }
  })
}

export const getAdminCompanyDetailController = async (req: Request, res: Response) => {
  const companyId = new ObjectId(req.params.companyId as string)
  const companyDetail = await adminCompanyService.getCompanyDetail(companyId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: companyDetail
  })
}

export const getAdminCompanyJobsController = async (
  req: Request,
  res: Response<unknown, AdminCompanyLocals>
) => {
  const company = res.locals.adminCompany
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as JobStatus | undefined
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined

  const result = await adminCompanyService.getCompanyJobsForAdmin({
    companyId: company._id as ObjectId,
    status,
    keyword,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      company: {
        _id: company._id,
        company_name: company.company_name,
        verified: company.verified
      },
      jobs: result.jobs.map((job) => ({
        _id: job._id,
        title: job.title,
        location: job.location,
        job_type: job.job_type,
        level: job.level,
        status: job.status,
        quantity: job.quantity,
        expired_at: job.expired_at,
        published_at: job.published_at,
        created_at: job.created_at,
        updated_at: job.updated_at
      })),
      pagination: result.pagination
    }
  })
}

export const getAdminCompanyApplicationsController = async (
  req: Request,
  res: Response<unknown, AdminCompanyLocals>
) => {
  const company = res.locals.adminCompany
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as JobApplicationStatus | undefined
  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined
  const candidateId = typeof req.query.candidateId === 'string' ? req.query.candidateId : undefined

  const result = await adminCompanyService.getCompanyApplicationsForAdmin({
    companyId: company._id as ObjectId,
    status,
    jobId: jobId ? new ObjectId(jobId) : undefined,
    candidateId: candidateId ? new ObjectId(candidateId) : undefined,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      company: {
        _id: company._id,
        company_name: company.company_name,
        verified: company.verified
      },
      applications: result.applications,
      pagination: result.pagination
    }
  })
}

export const updateAdminCompanyStatusController = async (
  req: Request<any, any, { verified: boolean }>,
  res: Response<unknown, AdminCompanyLocals>
) => {
  const company = res.locals.adminCompany
  const verified = req.body.verified

  const updatedCompany =
    company.verified === verified
      ? company
      : await adminCompanyService.updateCompanyVerificationStatus(company._id as ObjectId, verified)

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.COMPANY_VERIFICATION_UPDATE,
    targetType: AdminAuditTargetType.COMPANY,
    targetId: company._id,
    statusCode: StatusCodes.OK,
    metadata: {
      previous_verified: company.verified,
      next_verified: verified
    }
  })

  await notificationService.create({
    userId: company.user_id,
    type: NotificationType.COMPANY_VERIFICATION_UPDATED,
    title: 'Trạng thái công ty đã thay đổi',
    content: verified
      ? `Công ty "${company.company_name}" đã được xác minh.`
      : `Công ty "${company.company_name}" đã bị bỏ xác minh.`,
    data: {
      company_id: String(company._id),
      verified
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.ADMIN_COMPANY_VERIFICATION_UPDATED_SUCCESS,
    data: {
      _id: updatedCompany?._id,
      verified: updatedCompany?.verified,
      updated_at: updatedCompany?.updated_at
    }
  })
}

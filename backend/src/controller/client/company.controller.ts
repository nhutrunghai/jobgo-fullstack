import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import _ from 'lodash'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { UserRole } from '~/constants/enum'
import UserMessages from '~/constants/messages'
import { CompanyLocals } from '~/models/requests/responseType'
import { UpdateCompanyLogoRqType } from '~/models/requests/requestsType'
import Company from '~/models/schema/client/companies.schema'
import companyService from '~/services/client/company.service'

export const createCompanyController = async (req: Request<ParamsDictionary, unknown, Company>, res: Response) => {
  const userId = req.decodeToken?.userId as string
  const objectUserId = new ObjectId(userId)
  const companyPayload = new Company({
    ...req.body,
    user_id: objectUserId
  })
  const result = await companyService.createCompany(companyPayload)
  await databaseService.users.updateOne(
    { _id: objectUserId },
    { $set: { role: UserRole.EMPLOYER, updated_at: new Date() } }
  )

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.COMPANY_PROFILE_CREATED_SUCCESS,
    data: {
      _id: result.insertedId,
      ...companyPayload
    }
  })
}

export const getCompanyMeController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: _.pick(company, [
      'company_name',
      'logo',
      'website',
      'address',
      'description',
      'verified',
      'created_at',
      'updated_at'
    ])
  })
}

export const updateCompanyController = async (req: Request, res: Response<unknown, CompanyLocals>) => {
  const company = res.locals.company as Company
  await companyService.updateCompany(company._id as ObjectId, req.body)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.COMPANY_PROFILE_UPDATED_SUCCESS
  })
}

export const updateCompanyLogoController = async (
  req: Request<ParamsDictionary, unknown, UpdateCompanyLogoRqType>,
  res: Response<unknown, CompanyLocals>
) => {
  await companyService.updateLogo(res.locals.company as Company, req.body)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.COMPANY_LOGO_UPDATED_SUCCESS
  })
}


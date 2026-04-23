import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import {
  AdminAuditAction,
  AdminAuditTargetType,
  UserRole,
  UserStatus,
  WalletTopUpOrderStatus
} from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import { AdminUserLocals } from '~/models/requests/responseType.js'
import adminAuditLogService from '~/services/admin/audit-log.service.js'
import adminUserService from '~/services/admin/user.service.js'

export const getAdminUsersController = async (req: Request, res: Response) => {
  const role = req.query.role as UserRole | undefined
  const status = req.query.status as UserStatus | undefined
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)

  const result = await adminUserService.getUsers({
    role,
    status,
    keyword,
    page,
    limit
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      users: result.users.map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      pagination: result.pagination
    }
  })
}

export const getAdminUserDetailController = async (
  req: Request,
  res: Response<unknown, AdminUserLocals>
) => {
  const user = res.locals.adminUser

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      address: user.address,
      skills: user.skills,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  })
}

export const getAdminUserWalletController = async (
  req: Request,
  res: Response<unknown, AdminUserLocals>
) => {
  const user = res.locals.adminUser
  const wallet = await adminUserService.getUserWallet(user._id!)

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.USER_WALLET_VIEW,
    targetType: AdminAuditTargetType.USER,
    targetId: user._id,
    statusCode: StatusCodes.OK,
    metadata: {
      wallet_id: wallet?._id
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        is_verified: user.is_verified
      },
      wallet
    }
  })
}

export const getAdminUserTopUpOrdersController = async (
  req: Request,
  res: Response<unknown, AdminUserLocals>
) => {
  const user = res.locals.adminUser
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 10)
  const status = req.query.status as WalletTopUpOrderStatus | undefined

  const result = await adminUserService.getUserTopUpOrdersForAdmin({
    userId: user._id!,
    status,
    page,
    limit
  })

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.USER_TOPUP_ORDERS_VIEW,
    targetType: AdminAuditTargetType.USER,
    targetId: user._id,
    statusCode: StatusCodes.OK,
    metadata: {
      status,
      page,
      limit,
      total: result.pagination.total
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        is_verified: user.is_verified
      },
      orders: result.orders,
      pagination: result.pagination
    }
  })
}

export const updateAdminUserStatusController = async (
  req: Request<any, any, { status: UserStatus }>,
  res: Response<unknown, AdminUserLocals>
) => {
  const targetUser = res.locals.adminUser
  const nextStatus = req.body.status
  const currentAdmin = req.user

  if (
    currentAdmin?._id &&
    String(currentAdmin._id) === String(targetUser._id) &&
    nextStatus === UserStatus.BANNED
  ) {
    throw new AppError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: UserMessages.INVALID_DATA
    })
  }

  const updatedUser =
    targetUser.status === nextStatus
      ? targetUser
      : await adminUserService.updateUserStatus(targetUser._id!, nextStatus)

  await adminAuditLogService.create({
    req,
    action: AdminAuditAction.USER_STATUS_UPDATE,
    targetType: AdminAuditTargetType.USER,
    targetId: targetUser._id,
    statusCode: StatusCodes.OK,
    metadata: {
      previous_status: targetUser.status,
      next_status: nextStatus
    }
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.USER_UPDATE_SUCCESS,
    data: {
      _id: updatedUser?._id,
      status: updatedUser?.status,
      updated_at: updatedUser?.updated_at
    }
  })
}

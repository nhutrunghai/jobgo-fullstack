import { createRouteHandler, createUploadthing, type FileRouter } from 'uploadthing/express'
import { UploadThingError, UTApi } from 'uploadthing/server'
import env from '~/configs/env.config.js'
import ErrorCode from '~/constants/error.js'
import UserMessages from '~/constants/messages.js'
import { verifyToken } from '~/utils/jwt.util.js'

const f = createUploadthing({
  errorFormatter: (error) => ({
    status: 'fail',
    message: error.message,
    errorCode:
      error.message === UserMessages.ACCESS_TOKEN_NOT_FOUND
        ? ErrorCode.UNAUTHORIZED
        : error.message === UserMessages.ACCESS_TOKEN_INVALID
          ? ErrorCode.INVALID_TOKEN
          : error.code
  })
})
const MAX_AVATAR_FILE_SIZE = '64MB'
const MAX_RESUME_FILE_SIZE = '64MB'

class UploadThingProvider {
  private readonly utapi: UTApi

  private readonly router: FileRouter

  constructor() {
    this.utapi = new UTApi({
      token: env.UPLOADTHING_TOKEN
    })

    this.router = {
      userAvatar: f({
        image: {
          maxFileSize: MAX_AVATAR_FILE_SIZE,
          maxFileCount: 1
        }
      })
        .middleware(this.requireAuth)
        .onUploadComplete(({ metadata, file }) => ({
        userId: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size
      })),

      companyAvatar: f({
        image: {
          maxFileSize: MAX_AVATAR_FILE_SIZE,
          maxFileCount: 1
        }
      })
        .middleware(this.requireAuth)
        .onUploadComplete(({ metadata, file }) => ({
        userId: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size
      })),

      userResume: f({
        pdf: {
          maxFileSize: MAX_RESUME_FILE_SIZE,
          maxFileCount: 1
        },
        'application/msword': {
          maxFileSize: MAX_RESUME_FILE_SIZE,
          maxFileCount: 1
        },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
          maxFileSize: MAX_RESUME_FILE_SIZE,
          maxFileCount: 1
        }
      })
        .middleware(this.requireAuth)
        .onUploadComplete(({ metadata, file }) => ({
        userId: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size
      }))
    }
  }

  private getAuthorizationHeader(req: any) {
    const headers = req?.headers

    if (!headers) {
      return undefined
    }

    if (typeof headers.get === 'function') {
      return headers.get('authorization') ?? headers.get('Authorization')
    }

    return headers.authorization ?? headers.Authorization
  }

  private requireAuth = async ({ req }: { req: any }) => {
    const rawAuthorization = this.getAuthorizationHeader(req)
    const authorization = Array.isArray(rawAuthorization) ? rawAuthorization[0] : rawAuthorization
    const accessToken = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '').trim() : ''

    if (!accessToken) {
      throw new UploadThingError({
        code: 'FORBIDDEN',
        message: UserMessages.ACCESS_TOKEN_NOT_FOUND
      })
    }

    const decoded = await verifyToken(accessToken, env.SECRET_ACCESS_TOKEN).catch((error) => {
      throw new UploadThingError({
        code: 'FORBIDDEN',
        message: UserMessages.ACCESS_TOKEN_INVALID,
        cause: error
      })
    })

    return {
      userId: decoded.userId,
      role: decoded.role
    }
  }

  createExpressHandler() {
    return createRouteHandler({
      router: this.router,
      config: {
        token: env.UPLOADTHING_TOKEN
      }
    })
  }

  async deleteFile(fileKey: string) {
    return this.utapi.deleteFiles(fileKey)
  }

  async deleteFiles(fileKeys: string[]) {
    return this.utapi.deleteFiles(fileKeys)
  }
}

const uploadThingProvider = new UploadThingProvider()

export default uploadThingProvider

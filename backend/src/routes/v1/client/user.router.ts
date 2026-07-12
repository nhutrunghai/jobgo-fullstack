import { Router } from 'express'
import {
  changePasswordController,
  getProfileMeController,
  getProfileUserController,
  getSettingUserController,
  newPasswordController,
  resendMailController,
  updateUserAvatarController,
  updateProfileUserController,
  updateSettingUserController
} from '~/controllers/client/user.controller'
import {
  createResumeController,
  deleteResumeController,
  getMyResumesController,
  getResumeDetailController
} from '~/controllers/client/resume.controller'
import {
  getFavoriteJobsController,
  removeFavoriteJobController,
  saveFavoriteJobController
} from '~/controllers/client/favoriteJob.controller'
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from '~/controllers/client/notification.controller'
import { newPasswordMiddleware, resendMailMiddleware } from '~/middlewares/client/user.middleware'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware'
import { loadPublicJobDetail, requirePublicJobDetail } from '~/middlewares/client/public-job.middleware'
import { accountLimiter, mailLimiter, writeLimiter } from '~/middlewares/common/rate-limit.middleware'
import validate from '~/middlewares/common/validator.middleware'
import {
  getFavoriteJobsValidator,
  removeFavoriteJobValidator,
  saveFavoriteJobValidator
} from '~/validators/client/favoriteJob.validator'
import { getNotificationsValidator, markNotificationAsReadValidator } from '~/validators/client/notification.validator'
import { createResumeValidator, getResumeDetailValidator } from '~/validators/client/resume.validator'
import {
  newPasswordValidator,
  updateUserAvatarValidator,
  updateProfileUserValidator,
  updateSettingUserValidator
} from '~/validators/client/user.validator'
const userRouter = Router()
userRouter.get('/me', isAuthorized, getProfileMeController)
userRouter.get('/profile/:id', getProfileUserController)
userRouter.patch('/profile', isAuthorized, writeLimiter, validate(updateProfileUserValidator), updateProfileUserController)
userRouter.patch('/profile/avatar', isAuthorized, writeLimiter, validate(updateUserAvatarValidator), updateUserAvatarController)
userRouter.post('/resumes', isAuthorized, writeLimiter, validate(createResumeValidator), createResumeController)
userRouter.get('/resumes', isAuthorized, getMyResumesController)
userRouter.get('/resumes/:resumeId', isAuthorized, validate(getResumeDetailValidator), getResumeDetailController)
userRouter.delete('/resumes/:resumeId', isAuthorized, writeLimiter, validate(getResumeDetailValidator), deleteResumeController)
userRouter.get('/setting', isAuthorized, getSettingUserController)
userRouter.patch('/setting', isAuthorized, accountLimiter, validate(updateSettingUserValidator), updateSettingUserController)
userRouter.get('/favorite-jobs', isAuthorized, validate(getFavoriteJobsValidator), getFavoriteJobsController)
userRouter.get('/notifications', isAuthorized, validate(getNotificationsValidator), getNotificationsController)
userRouter.get('/notifications/unread-count', isAuthorized, getUnreadNotificationCountController)
userRouter.patch(
  '/notifications/:notificationId/read',
  isAuthorized,
  writeLimiter,
  validate(markNotificationAsReadValidator),
  markNotificationAsReadController
)
userRouter.patch('/notifications/read-all', isAuthorized, writeLimiter, markAllNotificationsAsReadController)
userRouter.post(
  '/favorite-jobs/:jobId',
  isAuthorized,
  writeLimiter,
  validate(saveFavoriteJobValidator),
  loadPublicJobDetail,
  requirePublicJobDetail,
  saveFavoriteJobController
)
userRouter.delete(
  '/favorite-jobs/:jobId',
  isAuthorized,
  writeLimiter,
  validate(removeFavoriteJobValidator),
  removeFavoriteJobController
)
userRouter.post('/setting/resend-mail', isAuthorized, resendMailMiddleware, mailLimiter, resendMailController)
userRouter.post('/setting/change-password', isAuthorized, accountLimiter, changePasswordController)
userRouter.post(
  '/setting/new-password',
  isAuthorized,
  accountLimiter,
  validate(newPasswordValidator),
  newPasswordMiddleware,
  newPasswordController
)
export default userRouter

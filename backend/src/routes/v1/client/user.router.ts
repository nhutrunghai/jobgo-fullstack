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
} from '~/controller/client/user.controller'
import {
  createResumeController,
  deleteResumeController,
  getMyResumesController,
  getResumeDetailController
} from '~/controller/client/resume.controller'
import {
  getFavoriteJobsController,
  removeFavoriteJobController,
  saveFavoriteJobController
} from '~/controller/client/favoriteJob.controller'
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController
} from '~/controller/client/notification.controller'
import { newPasswordMiddleware, resendMailMiddleware } from '~/middlewares/client/user.middleware'
import isAuthorized from '~/middlewares/client/isAuthorized.middleware'
import { loadPublicJobDetail, requirePublicJobDetail } from '~/middlewares/client/public-job.middleware'
import { mailLimiter } from '~/middlewares/rateLimit.middleware'
import validate from '~/middlewares/validator.middleware'
import {
  getFavoriteJobsValidator,
  removeFavoriteJobValidator,
  saveFavoriteJobValidator
} from '~/validators/client/favoriteJob.validator'
import {
  getNotificationsValidator,
  markNotificationAsReadValidator
} from '~/validators/client/notification.validator'
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
userRouter.patch('/profile', isAuthorized, validate(updateProfileUserValidator), updateProfileUserController)
userRouter.patch('/profile/avatar', isAuthorized, validate(updateUserAvatarValidator), updateUserAvatarController)
userRouter.post('/resumes', isAuthorized, validate(createResumeValidator), createResumeController)
userRouter.get('/resumes', isAuthorized, getMyResumesController)
userRouter.get('/resumes/:resumeId', isAuthorized, validate(getResumeDetailValidator), getResumeDetailController)
userRouter.delete('/resumes/:resumeId', isAuthorized, validate(getResumeDetailValidator), deleteResumeController)
userRouter.get('/setting', isAuthorized, getSettingUserController)
userRouter.patch('/setting', isAuthorized, validate(updateSettingUserValidator), updateSettingUserController)
userRouter.get('/favorite-jobs', isAuthorized, validate(getFavoriteJobsValidator), getFavoriteJobsController)
userRouter.get('/notifications', isAuthorized, validate(getNotificationsValidator), getNotificationsController)
userRouter.get('/notifications/unread-count', isAuthorized, getUnreadNotificationCountController)
userRouter.patch(
  '/notifications/:notificationId/read',
  isAuthorized,
  validate(markNotificationAsReadValidator),
  markNotificationAsReadController
)
userRouter.patch('/notifications/read-all', isAuthorized, markAllNotificationsAsReadController)
userRouter.post(
  '/favorite-jobs/:jobId',
  isAuthorized,
  validate(saveFavoriteJobValidator),
  loadPublicJobDetail,
  requirePublicJobDetail,
  saveFavoriteJobController
)
userRouter.delete('/favorite-jobs/:jobId', isAuthorized, validate(removeFavoriteJobValidator), removeFavoriteJobController)
userRouter.post('/setting/resend-mail', isAuthorized, resendMailMiddleware, mailLimiter, resendMailController)
userRouter.post('/setting/change-password', isAuthorized, changePasswordController) // mailLimiter ( rate limit theo tài khoản )
userRouter.post(
  '/setting/new-password',
  isAuthorized,
  validate(newPasswordValidator),
  newPasswordMiddleware,
  newPasswordController
) // ( rate limit theo tài khoản )
// Còn thiếu chức năng upload ảnh bìa và ảnh thumnail ... 
export default userRouter


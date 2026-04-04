import { z } from 'zod'
import _ from 'lodash'
import UserMessages from '~/constants/messages'
import { CONFIRM_PASSWORD_NOT_STRING, passwordSchema } from './auth.validator'
export const updateProfileUserValidator = z.object({
  body: z
    .object({
      fullName: z
        .string({ message: UserMessages.FULL_NAME_NOT_STRING })
        .trim()
        .min(1, { message: UserMessages.FULL_NAME_MIN_LENGHT })
        .max(50, { message: UserMessages.NAME_MAX_LENGTH })
        .transform((val) => _.escape(val))
        .optional(),
      bio: z
        .string({ message: UserMessages.FULL_NAME_NOT_STRING })
        .trim()
        .max(300, { message: UserMessages.NAME_MAX_LENGTH })
        .transform((val) => _.escape(val))
        .optional(),
      address: z
        .string({ message: UserMessages.ADDRESS_NOT_STRING })
        .trim()
        .max(100, { message: UserMessages.ADDRESS_MAX_LENGTH })
        .transform((val) => _.escape(val))
        .optional(),
      skills: z
        .array(
          z
            .string()
            .trim()
            .transform((val) => _.escape(val)),
          { message: UserMessages.SKILLS_NOT_ARRAY }
        )
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0, { message: UserMessages.NOT_VALUE_PROFILE })
})
export const updateSettingUserValidator = z.object({
  body: z
    .object({
      phone: z
        .string()
        .trim()
        .regex(/^(0[3|5|7|8|9])([0-9]{8})$/, 'Số điện thoại không đúng định dạng Việt Nam')
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0, { message: UserMessages.NOT_VALUE_PROFILE })
})
export const newPasswordValidator = z.object({
  body: z
    .object({
      newPassword: passwordSchema,
      confirmNewPassword: CONFIRM_PASSWORD_NOT_STRING,
      OtpCode: z.string({ message: UserMessages.OTP_CODE_CHANGE_PASSWORD })
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: UserMessages.CONFIRM_PASSWORD_MISMATCH,
      path: ['confirmNewPassword']
    })
})

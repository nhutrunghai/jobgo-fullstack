import _ from 'lodash'
import { z } from 'zod'
import UserMessages from '~/constants/messages'

const companyNameSchema = z
  .string({ message: UserMessages.NAME_NOT_STRING })
  .trim()
  .min(2, { message: UserMessages.NAME_MIN_LENGTH })
  .max(100, { message: UserMessages.NAME_MAX_LENGTH })
  .transform((val) => _.escape(val))

const addressSchema = z
  .string({ message: UserMessages.ADDRESS_NOT_STRING })
  .trim()
  .min(2, { message: UserMessages.ADDRESS_MIN_LENGTH })
  .max(100, { message: UserMessages.ADDRESS_MAX_LENGTH })
  .transform((val) => _.escape(val))

const websiteSchema = z
  .string({ message: UserMessages.WEBSITE_NOT_STRING })
  .trim()
  .url({ message: UserMessages.WEBSITE_INVALID })
  .optional()

const logoSchema = z
  .string({ message: UserMessages.LOGO_NOT_STRING })
  .trim()
  .url({ message: UserMessages.LOGO_INVALID })
  .optional()

const descriptionSchema = z
  .string({ message: UserMessages.BIO_NOT_STRING })
  .trim()
  .max(500, { message: UserMessages.COMPANY_DESCRIPTION_MAX_LENGTH })
  .transform((val) => _.escape(val))
  .optional()

export const createCompanyValidator = z.object({
  body: z.object({
    company_name: companyNameSchema,
    logo: logoSchema,
    website: websiteSchema,
    address: addressSchema,
    description: descriptionSchema
  })
})

export const updateCompanyValidator = z.object({
  body: z
    .object({
      company_name: companyNameSchema.optional(),
      logo: logoSchema,
      website: websiteSchema,
      address: addressSchema.optional(),
      description: descriptionSchema
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: UserMessages.NOT_VALUE_PROFILE
    })
})

export const updateCompanyLogoValidator = z.object({
  body: z.object({
    logo: z.url({ message: UserMessages.LOGO_INVALID }),
    logo_file_key: z.string().trim().min(1, { message: UserMessages.LOGO_FILE_KEY_REQUIRED })
  })
})

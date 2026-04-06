import { ZodObject } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ParsedQs } from 'qs'
import { ParamsDictionary } from 'express-serve-static-core'

const validate = (schema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await schema.parseAsync({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
      headers: req.headers ?? {}
    })

    if ('body' in result) req.body = result.body
    if ('query' in result) {
      const query = req.query as ParsedQs

      Object.keys(query).forEach((key) => {
        delete query[key]
      })

      Object.assign(query, result.query as ParsedQs)
    }

    if ('params' in result) req.params = result.params as ParamsDictionary
    next()
  } catch (error) {
    next(error)
  }
}

export default validate

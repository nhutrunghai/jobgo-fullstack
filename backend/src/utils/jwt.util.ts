import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import userInfo from '~/models/userInfo.js'
export const generateJwt = (userInfo: userInfo, privateKey: string, option: SignOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(userInfo, privateKey, option, (err, token) => {
      if (err) {
        return reject(err)
      }
      return resolve(token as string)
    })
  })
}
export const verifyToken = (token: string, privateKey: string): Promise<userInfo> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, privateKey, (err, decode) => {
      if (err) {
        return reject(err)
      }
      return resolve(decode as userInfo)
    })
  })
}

import { UAParser } from 'ua-parser-js'
export const getDeviceInfo = (userAgent: string) => {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const deviceInfo = browser.name ? `${browser.name} trên ${os.name}` : 'Unknow'
  return deviceInfo
}

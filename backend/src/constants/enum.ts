export enum UserRole {
  CANDIDATE, // Ứng viên
  EMPLOYER, // Nhà tuyển dụng
  ADMIN // Quản trị viên
}
export enum UserStatus {
  ACTIVE, // Đang hoạt động
  BANNED, // Bị khóa
  DELETED // Đã xóa
}
export enum OtpType {
  VERIFY_EMAIL, // Xác thực tài khoản ngay sau khi đăng ký.
  RESET_PASSWORD, // Quên mật khẩu (trang Login).
  CHANGE_PASSWORD, // Đổi mật khẩu (khi đang đăng nhập) để bảo mật.
  TWO_FACTOR_AUTH, // Xác thực 2 lớp (2FA) khi đăng nhập từ thiết bị lạ.
  UPDATE_EMAIL // Xác nhận khi người dùng muốn đổi sang email mới.
}
export enum TemplateResendId {
  VERIFY_EMAIL = '43d9c588-5929-4efc-a723-b9d584de9ec0',
  CHANGE_PASSWORD = '830044d0-6926-429b-aea1-78d57a963347'
}

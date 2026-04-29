export enum UserRole {
  CANDIDATE, // Ung vien
  EMPLOYER, // Nha tuyen dung
  ADMIN // Quan tri vien
}

export enum UserStatus {
  ACTIVE, // Dang hoat dong
  BANNED, // Bi khoa
  DELETED // Da xoa
}

export enum OtpType {
  VERIFY_EMAIL, // Xac thuc tai khoan sau khi dang ky
  RESET_PASSWORD, // Quen mat khau
  CHANGE_PASSWORD, // Doi mat khau
  TWO_FACTOR_AUTH, // Xac thuc 2 lop
  UPDATE_EMAIL // Xac nhan doi email
}

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

export enum JobStatus {
  DRAFT = 'draft', // Ban nhap
  OPEN = 'open', // Dang tuyen
  PAUSED = 'paused', // Tam dung
  CLOSED = 'closed', // Da dong
  EXPIRED = 'expired' // Het han
}

export enum JobType {
  FULL_TIME = 'full-time', // Toan thoi gian
  PART_TIME = 'part-time', // Ban thoi gian
  INTERNSHIP = 'internship', // Thuc tap
  CONTRACT = 'contract', // Hop dong
  REMOTE = 'remote' // Tu xa
}

export enum JobLevel {
  INTERN = 'intern', // Thuc tap sinh
  FRESHER = 'fresher', // Moi ra truong
  JUNIOR = 'junior', // Co ban
  MIDDLE = 'middle', // Trung cap
  SENIOR = 'senior', // Cao cap
  LEAD = 'lead', // Dan dat nhom nho
  MANAGER = 'manager' // Quan ly
}

export enum JobApplicationStatus {
  SUBMITTED = 'submitted', // Da nop ho so
  REVIEWING = 'reviewing', // Dang xem xet
  SHORTLISTED = 'shortlisted', // Da vao danh sach tot
  INTERVIEWING = 'interviewing', // Dang phong van
  REJECTED = 'rejected', // Bi tu choi
  HIRED = 'hired', // Da duoc nhan
  WITHDRAWN = 'withdrawn' // Tu rut ho so
}

export enum ResumeStatus {
  ACTIVE = 'active', // Dang su dung
  ARCHIVED = 'archived' // Luu tru
}

export enum TemplateResendId {
  VERIFY_EMAIL = '43d9c588-5929-4efc-a723-b9d584de9ec0',
  CHANGE_PASSWORD = '830044d0-6926-429b-aea1-78d57a963347'
}

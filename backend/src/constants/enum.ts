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

export enum JobModerationStatus {
  ACTIVE = 'active', // Hien thi binh thuong
  BLOCKED = 'blocked' // Bi admin chan
}

export enum JobPromotionType {
  HOMEPAGE_FEATURED = 'homepage_featured'
}

export enum JobPromotionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum WalletStatus {
  ACTIVE = 'active',
  LOCKED = 'locked'
}

export enum WalletTransactionType {
  TOP_UP = 'top_up',
  PROMOTION_PURCHASE = 'promotion_purchase',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export enum WalletTransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum WalletTransactionReferenceType {
  PAYMENT = 'payment',
  JOB_PROMOTION = 'job_promotion'
}

export enum WalletTopUpOrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum NotificationType {
  JOB_APPLICATION_SUBMITTED = 'job_application_submitted',
  JOB_APPLICATION_STATUS_UPDATED = 'job_application_status_updated',
  COMPANY_VERIFICATION_UPDATED = 'company_verification_updated',
  WALLET_TOPUP_SUCCEEDED = 'wallet_topup_succeeded',
  WALLET_ADJUSTED = 'wallet_adjusted'
}

export enum AdminAuditAction {
  ADMIN_LOGIN = 'admin.login',
  ADMIN_LOGOUT = 'admin.logout',
  USER_STATUS_UPDATE = 'user.status.update',
  COMPANY_VERIFICATION_UPDATE = 'company.verification.update',
  JOB_MODERATION_UPDATE = 'job.moderation.update',
  WALLET_ADJUST = 'wallet.adjust',
  WALLET_TRANSACTIONS_VIEW = 'wallet.transactions.view',
  USER_WALLET_VIEW = 'user.wallet.view',
  USER_TOPUP_ORDERS_VIEW = 'user.topup_orders.view',
  SEPAY_CONFIG_VIEW = 'sepay.config.view',
  SEPAY_CONFIG_UPDATE = 'sepay.config.update',
  SEPAY_SECRET_ROTATE = 'sepay.secret.rotate',
  SEPAY_CONNECTION_TEST = 'sepay.test_connection',
  SEPAY_DIAGNOSTICS_VIEW = 'sepay.diagnostics.view',
  RAG_CHAT_CONFIG_VIEW = 'rag_chat.config.view',
  RAG_CHAT_CONFIG_UPDATE = 'rag_chat.config.update',
  RAG_CHAT_SECRET_ROTATE = 'rag_chat.secret.rotate',
  RAG_CHAT_HEALTH_VIEW = 'rag_chat.health.view',
  JOB_PROMOTION_VIEW = 'job_promotion.view',
  JOB_PROMOTION_CREATE = 'job_promotion.create',
  JOB_PROMOTION_UPDATE = 'job_promotion.update',
  JOB_PROMOTION_DELETE = 'job_promotion.delete',
  JOB_PROMOTION_REORDER = 'job_promotion.reorder'
}

export enum AdminAuditTargetType {
  ADMIN = 'admin',
  USER = 'user',
  COMPANY = 'company',
  JOB = 'job',
  WALLET = 'wallet',
  WALLET_TRANSACTION = 'wallet_transaction',
  WALLET_TOPUP_ORDER = 'wallet_topup_order',
  SEPAY = 'sepay',
  RAG_CHAT = 'rag_chat',
  SYSTEM_SETTING = 'system_setting',
  JOB_PROMOTION = 'job_promotion'
}

export enum SystemSettingKey {
  RAG_CHAT = 'rag_chat',
  SEPAY = 'sepay'
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

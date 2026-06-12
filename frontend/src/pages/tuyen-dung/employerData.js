const STORAGE_KEY = 'mycoder-employer-jobs'

const seedJobs = [
  {
    id: 1,
    title: 'Senior UI/UX Designer',
    department: 'Phòng Sản phẩm',
    type: 'Văn phòng',
    workMode: 'Văn phòng',
    location: 'Hà Nội',
    salaryMin: '2000',
    salaryMax: '3500',
    salaryLabel: '2,000 - 3,500 USD',
    negotiable: false,
    postedAt: '2026-04-10',
    deadline: '2026-05-10',
    status: 'Đang hoạt động',
    level: 'Senior',
    experience: '3-5 năm',
    benefits: 'Thưởng theo quý, bảo hiểm đầy đủ, 14 ngày phép năm.',
    description:
      'Phối hợp với Product Manager và Engineering team để xây dựng trải nghiệm sản phẩm hiện đại cho hệ sinh thái Mycoder.',
    requirements:
      'Thành thạo Figma, khả năng nghiên cứu người dùng tốt, ưu tiên từng làm việc trong môi trường Agile/Scrum.',
    skills: ['Figma', 'Design System', 'Prototyping', 'UI/UX'],
    applicants: [
      { name: 'Khánh Linh', initials: 'KL', tone: 'bg-rose-100 text-rose-600' },
      { name: 'Minh Hủy', initials: 'MH', tone: 'bg-sky-100 text-sky-600' },
      { name: 'Bảo Ngọc', initials: 'BN', tone: 'bg-violet-100 text-violet-600' },
    ],
    extraApplicants: 15,
    packageType: 'Gói nổi bật',
  },
  {
    id: 2,
    title: 'Backend Developer (Java)',
    department: 'Phòng Kỹ thuật',
    type: 'Văn phòng',
    workMode: 'Văn phòng',
    location: 'Đà Nẵng',
    salaryMin: '1500',
    salaryMax: '2500',
    salaryLabel: '1,500 - 2,500 USD',
    negotiable: false,
    postedAt: '2026-04-08',
    deadline: '2026-05-08',
    status: 'Bản nháp',
    level: 'Middle',
    experience: '2-4 năm',
    benefits: 'Linh hoạt giờ làm, review lương 2 lần/năm, hỗ trợ chứng chỉ.',
    description: 'Phát triển dịch vụ backend hiệu năng cao và tối ưu hệ thống dữ liệu nội bộ.',
    requirements: 'Vững Java Spring, REST API, SQL và có tư duy tối ưu hệ thống.',
    skills: ['Java', 'Spring Boot', 'SQL'],
    applicants: [{ name: 'Tuấn Anh', initials: 'TA', tone: 'bg-amber-100 text-amber-600' }],
    extraApplicants: 4,
    packageType: 'Gói thường',
  },
  {
    id: 3,
    title: 'Frontend Developer (ReactJS)',
    department: 'Phòng Kỹ thuật',
    type: 'Hybrid',
    workMode: 'Hybrid',
    location: 'TP. Hồ Chí Minh',
    salaryMin: '1800',
    salaryMax: '2800',
    salaryLabel: '1,800 - 2,800 USD',
    negotiable: false,
    postedAt: '2026-04-12',
    deadline: '2026-05-15',
    status: 'Đang hoạt động',
    level: 'Senior',
    experience: '3-5 năm',
    benefits: 'Trang bị thiết bị mới, linh hoạt hybrid, ngân sách học tập hằng năm.',
    description: 'Xây dựng giao diện sản phẩm web hiệu năng cao với React và Tailwind CSS.',
    requirements: 'Thành thạo React, TypeScript, tư duy component architecture tốt.',
    skills: ['ReactJS', 'TypeScript', 'Tailwind CSS'],
    applicants: [
      { name: 'Ngọc Hà', initials: 'NH', tone: 'bg-emerald-100 text-emerald-600' },
      { name: 'Hoàng Long', initials: 'HL', tone: 'bg-indigo-100 text-indigo-600' },
      { name: 'Thùy Dương', initials: 'TD', tone: 'bg-fuchsia-100 text-fuchsia-600' },
    ],
    extraApplicants: 28,
    packageType: 'Gói nổi bật',
  },
  {
    id: 4,
    title: 'QA Engineer',
    department: 'Phòng Đảm bảo chất lượng',
    type: 'Remote',
    workMode: 'Remote',
    location: 'Remote',
    salaryMin: '',
    salaryMax: '',
    salaryLabel: 'Thỏa thuận',
    negotiable: true,
    postedAt: '2026-04-14',
    deadline: '2026-05-18',
    status: 'Đang hoạt động',
    level: 'Junior',
    experience: '1-2 năm',
    benefits: 'Phụ cấp internet, khám sức khỏe, teambuilding định kỳ.',
    description: 'Thực hiện test case, báo cáo lỗi và phối hợp với team dev để đảm bảo chất lượng.',
    requirements: 'Có kinh nghiệm test web/mobile, biết viết test case rõ ràng.',
    skills: ['Manual Testing', 'API Testing', 'Jira'],
    applicants: [
      { name: 'Quốc Bảo', initials: 'QB', tone: 'bg-orange-100 text-orange-600' },
      { name: 'Lan Anh', initials: 'LA', tone: 'bg-pink-100 text-pink-600' },
    ],
    extraApplicants: 16,
    packageType: 'Gói thường',
  },
]

const avatarTones = [
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-amber-100 text-amber-600',
  'bg-cyan-100 text-cyan-700',
]

export const statusOptions = ['Tất cả trạng thái', 'Đang hoạt động', 'Bản nháp', 'Tạm dừng', 'Đã đóng', 'Hết hạn']

export const departments = [
  'Phòng Kỹ thuật',
  'Phòng Sản phẩm',
  'Phòng Dữ liệu',
  'Phòng Đảm bảo chất lượng',
  'Phòng Vận hành',
]

export const levels = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead']
export const experienceOptions = ['Chưa yêu cầu', '1-2 năm', '2-4 năm', '3-5 năm', '5+ năm']
export const workModes = ['Văn phòng', 'Hybrid', 'Remote']
export const packageOptions = ['Gói thường', 'Gói nổi bật']

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeSeedJobs() {
  return seedJobs.map((job) => ({ ...job, skills: [...job.skills], applicants: [...job.applicants] }))
}

export function getRecruitmentJobs() {
  if (!isBrowser()) return normalizeSeedJobs()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = normalizeSeedJobs()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : normalizeSeedJobs()
  } catch {
    const seeded = normalizeSeedJobs()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export function saveRecruitmentJobs(jobs) {
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }
  return jobs
}

export function createRecruitmentJob(payload) {
  const currentJobs = getRecruitmentJobs()
  const nextId = currentJobs.reduce((maxId, job) => Math.max(maxId, Number(job.id) || 0), 0) + 1
  const now = new Date()
  const postedAt = now.toISOString().slice(0, 10)
  const newJob = {
    id: nextId,
    title: payload.title,
    department: payload.department,
    type: payload.workMode,
    workMode: payload.workMode,
    location: payload.location,
    salaryMin: payload.salaryMin,
    salaryMax: payload.salaryMax,
    salaryLabel: getSalaryLabel(payload),
    negotiable: payload.negotiable,
    postedAt,
    deadline: payload.deadline,
    status: payload.status,
    level: payload.level,
    experience: payload.experience,
    benefits: payload.benefits,
    description: payload.description,
    requirements: payload.requirements,
    skills: payload.skills,
    applicants: [{ name: 'Ứng viên mới', initials: 'UV', tone: avatarTones[nextId % avatarTones.length] }],
    extraApplicants: 0,
    packageType: payload.packageType,
  }

  const nextJobs = [newJob, ...currentJobs]
  saveRecruitmentJobs(nextJobs)
  return newJob
}

export function getRecruitmentJobById(jobId) {
  const normalizedId = Number(jobId)
  return getRecruitmentJobs().find((job) => Number(job.id) === normalizedId) ?? null
}

export function updateRecruitmentJob(jobId, payload) {
  const normalizedId = Number(jobId)
  const currentJobs = getRecruitmentJobs()
  let updatedJob = null

  const nextJobs = currentJobs.map((job) => {
    if (Number(job.id) !== normalizedId) return job

    updatedJob = {
      ...job,
      ...payload,
      id: job.id,
      type: payload.workMode,
      workMode: payload.workMode,
      salaryLabel: getSalaryLabel(payload),
      skills: [...payload.skills],
    }
    return updatedJob
  })

  saveRecruitmentJobs(nextJobs)
  return updatedJob
}

export function deleteRecruitmentJob(jobId) {
  const normalizedId = Number(jobId)
  const currentJobs = getRecruitmentJobs()
  const nextJobs = currentJobs.filter((job) => Number(job.id) !== normalizedId)
  saveRecruitmentJobs(nextJobs)
  return nextJobs
}

export function getSalaryLabel(job) {
  if (job.negotiable) return 'Thỏa thuận'
  const min = job.salaryMin ? Number(job.salaryMin).toLocaleString('en-US') : ''
  const max = job.salaryMax ? Number(job.salaryMax).toLocaleString('en-US') : ''
  if (min && max) return `${min} - ${max} USD`
  if (min) return `Từ ${min} USD`
  if (max) return `Đến ${max} USD`
  return 'Đang cập nhật'
}

export function getStatCards(jobs) {
  const activeJobs = jobs.filter((job) => job.status === 'Đang hoạt động').length
  const draftJobs = jobs.filter((job) => job.status === 'Bản nháp').length
  const totalApplicants = jobs.reduce((sum, job) => sum + job.extraApplicants + job.applicants.length, 0)
  const featuredJobs = jobs.filter((job) => job.packageType === 'Gói nổi bật').length

  return [
    {
      title: 'Tổng số Job',
      value: String(jobs.length),
      delta: '+5%',
      icon: 'description',
      iconTone: 'bg-blue-50 text-[#2563EB]',
      deltaTone: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Đang đăng tuyển',
      value: String(activeJobs),
      delta: '+2%',
      icon: 'campaign',
      iconTone: 'bg-emerald-50 text-[#22C55E]',
      deltaTone: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Tổng ứng viên',
      value: String(totalApplicants),
      delta: '+12%',
      icon: 'group',
      iconTone: 'bg-blue-50 text-[#2563EB]',
      deltaTone: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Gói nổi bật',
      value: String(featuredJobs),
      delta: draftJobs > 0 ? `${draftJobs} draft` : '0 draft',
      icon: 'auto_awesome',
      iconTone: 'bg-violet-50 text-violet-600',
      deltaTone: 'bg-slate-100 text-slate-500',
    },
  ]
}

export function formatDate(dateString) {
  if (!dateString) return '--/--/----'
  const date = new Date(dateString)
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('vi-VN')
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

export function statusClass(status) {
  if (status === 'Đang hoạt động') return 'bg-emerald-50 text-emerald-600'
  if (status === 'Bản nháp') return 'bg-amber-50 text-amber-600'
  if (status === 'Tạm dừng') return 'bg-sky-50 text-sky-600'
  if (status === 'Đã đóng') return 'bg-slate-100 text-slate-600'
  if (status === 'Hết hạn') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-100 text-slate-500'
}

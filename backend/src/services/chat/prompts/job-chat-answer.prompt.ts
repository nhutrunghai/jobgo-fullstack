import { RetrievedChatJob } from '~/types/chat/chat.type'

const buildSalaryText = (job: RetrievedChatJob) => {
  if (!job.salary) {
    return 'Không có thông tin lương'
  }

  if (job.salary.is_negotiable) {
    return 'Lương thương lượng'
  }

  const min = job.salary.min ?? 'N/A'
  const max = job.salary.max ?? 'N/A'

  return `${min} - ${max} ${job.salary.currency}`
}

const buildJobsContext = (jobs: RetrievedChatJob[]) =>
  jobs
    .map(
      (job, index) => `Job ${index + 1}
- job_id: ${job.job_id}
- title: ${job.title}
- company: ${job.company}
- location: ${job.location}
- level: ${job.level}
- job_type: ${job.job_type}
- salary: ${buildSalaryText(job)}
- skills: ${job.skills.join(', ') || 'Không có'}
- description: ${job.description || 'Không có'}
- requirements: ${job.requirements || 'Không có'}
- benefits: ${job.benefits || 'Không có'}`
    )
    .join('\n\n')

const baseInstruction = `
Bạn là chatbot tư vấn job cho JobGo.
Chỉ được trả lời dựa trên danh sách job trong context.
Nếu dữ liệu chưa đủ để kết luận chắc chắn, hãy nói rõ.
Không được bịa thêm job ngoài context.
Trả lời ngắn gọn, thực dụng, ưu tiên nêu rõ 2-3 job phù hợp nhất và lý do.
`

export const buildJobChatAnswerPrompt = ({ message, jobs }: { message: string; jobs: RetrievedChatJob[] }) => `
${baseInstruction}

User question:
${message}

Jobs context:
${buildJobsContext(jobs)}
`

export const buildJobChatJsonAnswerPrompt = ({ message, jobs }: { message: string; jobs: RetrievedChatJob[] }) => `
${baseInstruction}

Hãy trả về JSON hợp lệ theo schema.
- answer: câu trả lời tiếng Việt hiển thị cho user.
- selected_job_ids: danh sách job_id của đúng các job được nhắc/gợi ý trong answer.
- Nếu answer nói 2 job thì selected_job_ids phải có đúng 2 id.
- Nếu một job không được nhắc trong answer thì tuyệt đối không đưa vào selected_job_ids.
- selected_job_ids chỉ được dùng job_id có trong Jobs context.

User question:
${message}

Jobs context:
${buildJobsContext(jobs)}
`

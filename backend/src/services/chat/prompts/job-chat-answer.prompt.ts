import { RetrievedChatJob } from '~/models/chat/chat.type'

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

export const buildJobChatAnswerPrompt = ({ message, jobs }: { message: string; jobs: RetrievedChatJob[] }) => {
  const jobsContext = jobs
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

  return `
Bạn là chatbot tư vấn job cho JobGo.
Chỉ được trả lời dựa trên danh sách job trong context.
Nếu dữ liệu chưa đủ để kết luận chắc chắn, hãy nói rõ.
Không được bịa thêm job ngoài context.
Trả lời ngắn gọn, thực dụng, ưu tiên nêu rõ 2-3 job phù hợp nhất và lý do.

User question:
${message}

Jobs context:
${jobsContext}
`
}

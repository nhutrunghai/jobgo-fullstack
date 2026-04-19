import { RetrievedResumeChunk } from '~/models/chat/chat.type'

export const buildCvReviewAnswerPrompt = ({
  message,
  chunks,
  visualReviewSummary
}: {
  message: string
  chunks: RetrievedResumeChunk[]
  visualReviewSummary?: string | null
}) => {
  const resumeContext =
    chunks.length > 0
      ? chunks
          .map((chunk) =>
            [
              `Chunk ${chunk.chunk_index}:`,
              chunk.section ? `Section: ${chunk.section}` : '',
              chunk.text
            ]
              .filter(Boolean)
              .join('\n')
          )
          .join('\n\n---\n\n')
      : 'Không có text chunks từ Elasticsearch cho CV này.'

  const visualContext = visualReviewSummary?.trim()
    ? visualReviewSummary.trim()
    : 'Chưa có visual review summary. Không được khẳng định chắc chắn về bố cục/thiết kế nếu thiếu dữ liệu visual.'

  return `
Bạn là chatbot đánh giá CV cho JobGo.
Chỉ sử dụng dữ liệu có trong context. Không bịa, không suy diễn quá mức.

Yêu cầu của user:
${message}

Text chunks từ Elasticsearch:
${resumeContext}

Visual/PDF review summary:
${visualContext}

Yêu cầu trả lời:
- Trả lời bằng tiếng Việt.
- Kết hợp cả nội dung CV và bố cục nếu có đủ dữ liệu.
- Nếu chỉ có text chunks, phải nói rõ rằng chưa đánh giá được bố cục đầy đủ.
- Nếu chỉ có visual review mà không có text chunks, phải nói rõ rằng đánh giá nội dung còn hạn chế.
- Nếu user hỏi mức phù hợp với job nhưng context không có JD cụ thể, chỉ nhận xét mức phù hợp chung theo thông tin đang có.
- Không kết luận về ATS keywords, kỹ năng, kinh nghiệm hoặc học vấn nếu context không đủ bằng chứng.

Định dạng bắt buộc:
1. Tổng quan
2. Điểm mạnh
3. Vấn đề nội dung
4. Vấn đề bố cục/thiết kế
5. Gợi ý sửa ưu tiên
6. Checklist ngắn để tự chỉnh
`.trim()
}

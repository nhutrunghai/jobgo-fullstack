// services/embedding.service.ts
import { HfInference } from '@huggingface/inference'

// Thay bằng Token bạn lấy từ Hugging Face Settings
const hf = new HfInference('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')

/**
 * Hàm biến văn bản tiếng Việt thành Vector 768 chiều
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = 'dangvantuan/vietnamese-embedding'
    // Gọi Inference API
    const output = await hf.featureExtraction({
      model: model,
      inputs: text,
    });

    // Ép kiểu về mảng số
    return output as number[];
  } catch (error) {
    console.error('Lỗi khi tạo Embedding:', error)
    throw error;
  }
};
generateEmbedding('Tôi muốn tìm 1 công việc backend ở Hà Nội').then((result) => {
  console.log(result);
  
})
"use client"

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// 重试函数
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error?.status !== 429) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithDelay(fn, retries - 1, delay * backoff, backoff);
  }
}

// 使用 Gemini-1.5-flash 进行图片文字提取
export async function extractTextFromImage(imageData: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData.split(",")[1]
          }
        },
        "Extract all text from this image and return it as plain text. Please maintain the original text structure and layout as much as possible. If there are multiple languages in the image, please identify and preserve them all.",
      ]);
      const response = await result.response;
      return response.text();
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    if (error?.message?.includes('not found') || error?.message?.includes('deprecated')) {
      console.error('Model not available:', error);
      throw new Error('当前模型不可用，请联系开发者更新');
    }
    console.error('Error extracting text:', error);
    throw error;
  }
}

// 使用 Gemini Pro 进行文本翻译
export async function translateText(text: string, targetLang: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  try {
    return await retryWithDelay(async () => {
      const prompt = `
请将以下文本翻译成${targetLang}。
要求：
1. 保持原文的格式和结构
2. 准确传达原文的语气和风格
3. 如果有专业术语，请保持其专业性
4. 如果有文化特定的表达，请适当调整以符合目标语言文化
5. 对于无法直译的内容，请提供最贴近的表达

原文：
${text}
`;
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      const response = await result.response;
      return response.text();
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    console.error('Error translating text:', error);
    throw error;
  }
}

// 使用 Gemini Pro 进行文本优化
export async function improveText(text: string, targetLang: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  try {
    return await retryWithDelay(async () => {
      const prompt = `
请对以下${targetLang}文本进行优化和改进。
要求：
1. 修正语法和用词错误
2. 提高表达的流畅性和自然度
3. 保持原文的意思和语气
4. 使用更地道的表达方式
5. 如果有专业术语，确保其准确性

原文：
${text}
`;
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      const response = await result.response;
      return response.text();
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    console.error('Error improving text:', error);
    throw error;
  }
}
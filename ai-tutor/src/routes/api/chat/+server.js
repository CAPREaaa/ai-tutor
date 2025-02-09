import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import "dotenv/config";

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 存储会话历史（简单示例，仅适用于单用户）
let chatHistory = [];

export async function POST({ request }) {
  try {
    const { message } = await request.json();
    
    console.log("✅ Received message:", message);

    // 限制上下文长度，防止过长
    if (chatHistory.length > 10) {
      chatHistory.shift(); // 删除最早的消息
    }

    // 添加用户消息到历史
    chatHistory.push({ role: "user", content: message });

    // 调用 OpenAI API（带入历史消息）
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert French tutor. Teach the user French interactively and maintain context." },
        ...chatHistory
      ]
    });

    // 确保 API 返回的格式正确
    if (!chatResponse || !chatResponse.choices || chatResponse.choices.length === 0) {
      console.error("❌ OpenAI API did not return a valid response");
      return json({ error: "No valid response from AI" }, { status: 500 });
    }

    const reply = chatResponse.choices[0].message.content;
    
    console.log("✅ AI Reply:", reply);

    // 记录 AI 回复到历史
    chatHistory.push({ role: "assistant", content: reply });

    return json({ reply });

  } catch (error) {
    console.error("❌ Error calling OpenAI API:", error);
    return json({ error: error.message || "Failed to fetch response from AI" }, { status: 500 });
  }
}

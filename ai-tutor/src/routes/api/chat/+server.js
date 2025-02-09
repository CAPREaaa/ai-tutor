import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import "dotenv/config";

// Create OpenAI instance
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Store chat history (simple example for a single user session)
let chatHistory = [];

export async function POST({ request }) {
    try {
        const { message } = await request.json();
        
        console.log("✅ Received message:", message);

        // Limit chat history length to optimize performance and relevance
        if (chatHistory.length > 10) {
            chatHistory.shift(); // Remove the earliest message to maintain context length
        }

        // Add user message to chat history
        chatHistory.push({ role: "user", content: message });

        // Construct conversation context separately to avoid issues with template literals
        const conversationContext = chatHistory
            .map(entry => `${entry.role === "user" ? "Student" : "Tutor"}: ${entry.content}`)
            .join("\n");

        // Construct system instructions
        const systemPrompt = `
        You are an expert French language teacher, and the user is your student.

        **Instructions for AI:**
        1️⃣ **First**, read the student's latest question carefully.
        2️⃣ **Then**, respond in **French first**.
        3️⃣ **After that**, explain in **English** with grammar rules, sentence structure, and usage.
        4️⃣ **Expand ONLY on relevant topics**—avoid off-topic responses.
        5️⃣ **Encourage practice** by asking a related follow-up question.

        **Conversation Context:**
        ${conversationContext}

        **New Question from the Student (Important, Read Carefully!):**
        "${message}"
        `;

        console.log("✅ System Prompt:", systemPrompt);

        // Call OpenAI API with contextualized messages
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory
            ]
        });

        // Ensure AI response is valid
        if (!chatResponse || !chatResponse.choices || chatResponse.choices.length === 0) {
            console.error("❌ OpenAI API did not return a valid response");
            return json({ error: "No valid response from AI" }, { status: 500 });
        }

        const reply = chatResponse.choices[0].message.content;
        
        console.log("✅ AI Reply:", reply);

        // Save AI response to chat history
        chatHistory.push({ role: "assistant", content: reply });

        return json({ reply });

    } catch (error) {
        console.error("❌ Error calling OpenAI API:", error);
        return json({ error: error.message || "Failed to fetch response from AI" }, { status: 500 });
    }
}

import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST({ request }) {
  try {
    const { message } = await request.json();

    console.log("✅ Received message:", message);

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert French language tutor. Teach the user French interactively." },
        { role: "user", content: message }
      ]
    });

    console.log("✅ OpenAI API Response:", chatResponse);

    // Invalid response from OpenAI API
    if (!chatResponse || !chatResponse.choices || chatResponse.choices.length === 0) {
      console.error("❌ OpenAI API did not return a valid response");
      return json({ error: "No valid response from AI" }, { status: 500 });
    }

    const reply = chatResponse.choices[0].message.content;
    console.log("✅ AI Reply:", reply);

    return json({ reply });

  } catch (error) {
    console.error("❌ Error calling OpenAI API:", error);
    return json({ error: error.message || "Failed to fetch response from AI" }, { status: 500 });
  }
}

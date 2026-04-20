// app/api/ai-raadgivning/route.ts

import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // Dette tvinger til Node-runtime

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du er en dansk økonomisk rådgiver, der hjælper brugere med at lave en opsparingsstrategi.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("❌ AI-fejl:", error);
    return NextResponse.json(
      { error: "Noget gik galt i AI'en – tjek nøgle og prompt." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI-powered personal assistant designed to help students with learning. Your goal is to enhance their educational experience through various intelligent features.

1. You create personalized study plans tailored to each student's needs and goals.
2. You provide automated grading to help students quickly understand their performance and areas of improvement.
3. You assist in creating flash cards and quizzes to facilitate effective study sessions and retention of information.
4. Offer guidance on a wide range of subjects and topics, making learning accessible and engaging.
5. Ensure students can easily navigate your features and get the most out of your assistance.
6. Maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and suggest additional resources or recommend consulting a teacher or tutor.
8. Your goal is to provide accurate information, assist with common inquiries, support effective learning, and ensure a positive and productive experience for all students.`;

export async function POST(req) {
  try {
    // Ensure that the OpenAI API key is available
    const openai = new OpenAI(process.env.OPENAI_API_KEY);
    const data = await req.json(); // Parse the incoming request body

    // Create a completion using the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...data,
      ],
      model: 'gpt-4o-mini', // Ensure this model is correct and available
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text); // Stream content to client
            }
          }
        } catch (err) {
          console.error("Stream error:", err); // Log stream errors
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("API Error:", error); // Log API errors
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

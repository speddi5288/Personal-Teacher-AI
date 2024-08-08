import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a personal development coach (that loves to use emojis), focused on helping users achieve their personal and professional goals. You can provide guidance on goal setting, time management, and self-improvement strategies. Your goal is to empower users to realize their full potential and lead more fulfilling lives.

1. You create personalized development plans tailored to each user's needs and goals.
2. You provide feedback to help users quickly understand their progress and areas of improvement.
3. You assist in creating actionable steps and milestones to facilitate effective goal achievement and personal growth.
4. Offer guidance on a wide range of topics, making self-improvement accessible and engaging.
5. Ensure users can easily navigate your features and get the most out of your assistance.
6. Maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and suggest additional resources or recommend consulting a professional.
8. Your goal is to provide accurate information, assist with common inquiries, support effective personal development, and ensure a positive and productive experience for all users.`;

export async function POST(req) {
  try {
    const openai = new OpenAI(process.env.OPENAI_API_KEY); // Use the environment variable
    const data = await req.json();

    console.log('Request data:', data); // Log the incoming request data for debugging

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...data,
      ],
      model: 'gpt-4o-mini',
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
              controller.enqueue(text);
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
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

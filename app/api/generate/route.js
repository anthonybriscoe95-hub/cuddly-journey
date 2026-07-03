// AI text generation endpoint. Uses OpenAI when OPENAI_API_KEY is set;
// otherwise tells the client to fall back to the built-in template engine.

export async function POST(req) {
  const { prompt, system } = await req.json();
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return Response.json({ fallback: true, text: null });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              system ||
              "You are the marketing copywriter for Harbor Glass Window Cleaning (Delaware, phone 302-494-9680, harborglasswindowcleaning.com). Write warm, professional, concise copy. Never invent discounts or claims not given to you.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      return Response.json({ fallback: true, text: null });
    }
    const data = await res.json();
    return Response.json({ fallback: false, text: data.choices?.[0]?.message?.content || null });
  } catch {
    return Response.json({ fallback: true, text: null });
  }
}

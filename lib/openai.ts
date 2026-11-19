import OpenAI from "openai";

export async function createMovieFact(
  movie: string,
  recentFacts: string[] = []
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
  const previousFacts = recentFacts.length
    ? recentFacts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")
    : "No facts have been shared yet.";

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.9,
    max_tokens: 110,
    messages: [
      {
        role: "system",
        content:
          "You write short, accurate and interesting movie trivia. Return exactly one new fact in 1-2 sentences. The fact must add a specific detail, not reword, summarize, or lightly paraphrase anything in the recent-facts list. Choose a different angle where possible, such as casting, production, filming location, music, director, source material, release, awards, or cultural impact. Do not make up details. Only state something you are reasonably confident is true; if you cannot find a distinct reliable fact, say that you do not have another distinct fact rather than inventing one."
      },
      {
        role: "user",
        content: `Give me a fresh, distinct fact about "${movie}". Do not repeat any of these facts or their underlying details:\n${previousFacts}`
      }
    ]
  });

  const fact = response.choices[0]?.message?.content?.trim();
  if (!fact) throw new Error("The AI response was empty.");
  return fact;
}

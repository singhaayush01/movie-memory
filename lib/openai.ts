import OpenAI from "openai";

export async function createMovieFact(movie: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 150,
    messages: [
      { role: "system", content: "You write short, accurate and interesting movie facts. Give one fact in 2-3 sentences. Do not invent production details. If you are not confident about a detail, say so rather than guessing." },
      { role: "user", content: "Share one interesting fact about the movie: " + movie }
    ]
  });
  const fact = response.choices[0]?.message?.content?.trim();
  if (!fact) throw new Error("The AI response was empty.");
  return fact;
}

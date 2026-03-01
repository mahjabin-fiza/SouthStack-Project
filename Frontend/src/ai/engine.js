import * as webllm from "@mlc-ai/web-llm";

let engine = null;

export async function loadModel() {
  if (engine) return engine;

  console.log("Initializing WebLLM...");

  const modelId = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

  engine = await webllm.CreateMLCEngine(modelId);

  console.log("Model loaded!");
  return engine;
}

export async function generateText(prompt) {
  const model = await loadModel();

  const reply = await model.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a senior software engineer. Always return complete, fully working, syntactically correct code. Do not truncate. Do not explain unless asked. Ensure the program compiles.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 300,
    temperature: 0.2,
  });

  return reply.choices[0].message.content;
}

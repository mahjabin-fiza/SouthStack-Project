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
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50,
  });

  return reply.choices[0].message.content;
}

import * as webllm from "@mlc-ai/web-llm";

let engine = null;
let loadingPromise = null;

// CHANGE THIS PER DEVICE
const MODEL = "Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC";
// const MODEL = "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC";

async function loadModel() {
  if (engine) return engine;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    engine = await webllm.CreateMLCEngine(MODEL);
    return engine;
  })();

  return loadingPromise;
}

export async function generateText(prompt) {
  const model = await loadModel();

  const res = await model.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful coding AI." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  return res.choices[0].message.content;
}

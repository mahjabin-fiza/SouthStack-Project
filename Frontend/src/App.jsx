import { useState, useEffect } from "react";
import { loadModel, generateText } from "./ai/engine";

function App() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    async function init() {
      await loadModel();
      setModelReady(true);
    }
    init();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateText(prompt);
    setOutput(result);
    setLoading(false);
  };

  return (
    <div className="p-5 flex flex-col gap-2">
      <h1 className="px-4 pb-8 font-bold text-3xl">SouthStack</h1>
      <div className="flex justify-center">
        <div className="w-140 p-2">
          <div className="">
            <textarea
              className="w-full h-35 p-2 border border-2 rounded"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
            />
          </div>
          <div className="">
            <button
              onClick={handleGenerate}
              disabled={!modelReady || loading}
              className={`bg-gray-100 px-4 py-2 rounded-md
                ${
                  !modelReady
                    ? ""
                    : loading
                      ? ""
                      : "border border-2 bg-gray-700 text-white hover:bg-white hover:text-black transition duration-200 ease-in-out"
                }}`}
            >
              {!modelReady
                ? "Loading model..."
                : loading
                  ? "Generating..."
                  : "Generate"}
            </button>
          </div>
        </div>
      </div>
      <div className="">
        <p className="px-4 pt-6 font-semibold text-gray-600">
          Generated Answer:
        </p>
        <pre className="auto p-[25px] m-[15px] bg-[#1e1e1e] text-[#00ff99] font-mono rounded">
          {output}
        </pre>
      </div>
    </div>
  );
}

export default App;

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
    <div style={{ padding: "20px" }}>
      <h1>SouthStack</h1>

      <textarea
        rows="5"
        cols="60"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />

      <br />
      <br />

      <button onClick={handleGenerate} disabled={!modelReady || loading}>
        {!modelReady
          ? "Loading model..."
          : loading
            ? "Generating..."
            : "Generate"}
      </button>

      <pre
        style={{ marginTop: "20px", background: "#f4f4f4", padding: "10px" }}
      >
        {output}
      </pre>
    </div>
  );
}

export default App;

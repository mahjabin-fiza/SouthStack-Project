import { useState, useEffect } from "react";
import { loadModel, generateText } from "./ai/engine";
import {
  createOffer,
  createAnswer,
  connectWithAnswer,
  sendMessage,
} from "./webrtc";

function App() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const [signal, setSignal] = useState("");
  const [inputSignal, setInputSignal] = useState("");
  const [receivedMsg, setReceivedMsg] = useState("");

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
    <>
      <div className="p-6 flex flex-col gap-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center">
          Peer Connection Setup
        </h2>

        {/* MAC SECTION */}
        <div className="border p-4 rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-2">💻 Mac (Device A)</h3>

          <button
            onClick={() => createOffer(setSignal, setReceivedMsg)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            Step 1: Create Offer
          </button>

          <textarea
            className="w-full mt-3 p-2 border rounded"
            value={signal}
            readOnly
            placeholder="Copy this offer and send to Windows"
          />

          <textarea
            className="w-full mt-3 p-2 border rounded"
            placeholder="Paste answer from Windows"
            value={inputSignal}
            onChange={(e) => setInputSignal(e.target.value)}
          />

          <button
            onClick={() => connectWithAnswer(inputSignal)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Step 3: Connect with Answer
          </button>
        </div>

        {/* WINDOWS SECTION */}
        <div className="border p-4 rounded-lg bg-green-50">
          <h3 className="font-semibold mb-2">💻 Windows (Device B)</h3>

          <textarea
            className="w-full p-2 border rounded"
            placeholder="Paste offer from Mac"
            value={inputSignal}
            onChange={(e) => setInputSignal(e.target.value)}
          />

          <button
            onClick={() => createAnswer(inputSignal, setSignal, setReceivedMsg)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Step 2: Create Answer
          </button>

          <textarea
            className="w-full mt-3 p-2 border rounded"
            value={signal}
            readOnly
            placeholder="Copy this answer back to Mac"
          />
        </div>

        {/* TEST SECTION */}
        <div className="border p-4 rounded-lg bg-gray-100">
          <h3 className="font-semibold mb-2">🧪 Test Connection</h3>

          <button
            onClick={() => sendMessage("Hello from peer!")}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition"
          >
            Send Test Message
          </button>

          <p className="mt-2">
            <strong>Received:</strong> {receivedMsg}
          </p>
        </div>
      </div>
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
    </>
  );
}

export default App;

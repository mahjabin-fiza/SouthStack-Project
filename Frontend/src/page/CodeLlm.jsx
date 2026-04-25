import { useState, useEffect } from "react";
import {
  createPeer,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  sendTask,
} from ".././webrtc";
import { generateText } from ".././ai/engine";

export default function CodeLlm() {
  const [status, setStatus] = useState("new");
  const [peerId] = useState(() => crypto.randomUUID());

  const [localOffer, setLocalOffer] = useState("");
  const [remoteOffer, setRemoteOffer] = useState("");
  const [localAnswer, setLocalAnswer] = useState("");
  const [remoteAnswer, setRemoteAnswerState] = useState("");

  const [mode, setMode] = useState("generate");
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");

  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [displayedOutput, setDisplayedOutput] = useState("");
  const [fullOutput, setFullOutput] = useState("");

  // ✅ NEW: Voice state
  const [isListening, setIsListening] = useState(false);

  // ✅ NEW: Voice function
  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("Voice started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice input:", transcript);
      setCommand(transcript);
    };

    recognition.onerror = (e) => {
      console.log("Voice error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Voice ended");
      setIsListening(false);
    };

    recognition.start();
  }

  useEffect(() => {
    if (!fullOutput) return;

    console.log("Starting typing animation...");

    let index = 0;
    setDisplayedOutput("");

    const interval = setInterval(() => {
      setDisplayedOutput((prev) => prev + (fullOutput[index] || ""));
      index++;

      if (index >= fullOutput.length) {
        clearInterval(interval);
        console.log("Typing complete");
      }
    }, 10);

    return () => clearInterval(interval);
  }, [fullOutput]);

  useEffect(() => {
    async function initModel() {
      console.log("Auto loading model...");

      // trigger lazy load once
      await generateText("Hello");

      setModelLoaded(true);
      setLoadingModel(false);
    }

    initModel();
  }, []);

  function init() {
    console.log("Initializing peer...");
    createPeer(setStatus, null, (res) => {
      console.log("Output received");
      const clean = res || "";
      setFullOutput(clean);
      setGenerating(false);
    });
  }

  async function handleCreateOffer() {
    try {
      const offer = await createOffer();
      setLocalOffer(JSON.stringify(offer));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCreateAnswer() {
    console.log("Creating answer...");
    const offer = JSON.parse(remoteOffer);
    const answer = await createAnswer(offer);
    setLocalAnswer(JSON.stringify(answer));
  }

  async function handleSetAnswer() {
    console.log("Setting remote answer...");
    const answer = JSON.parse(remoteAnswer);
    await setRemoteAnswer(answer);
  }

  function downloadFile(data, filename) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function handleUpload(setter, e) {
    const file = e.target.files[0];
    const text = await file.text();
    setter(text);
    console.log("File uploaded");
  }

  async function handleRun() {
    if (loadingModel) return;

    console.log("Running task...");
    setGenerating(true);
    setFullOutput("");
    setDisplayedOutput("");

    await sendTask(command, mode);
  }

  return (
    <div className="p-6 space-y-6">
      {/* CONNECTION (UNCHANGED) */}
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Peer-to-Peer Connection</h2>

        <div className="text-sm text-gray-600">
          <span className="font-semibold">Node ID:</span>
          <div className="bg-gray-100 p-2 rounded mt-1 break-all">{peerId}</div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "connected"
                ? "bg-green-500"
                : status === "connecting"
                  ? "bg-yellow-500"
                  : status === "failed"
                    ? "bg-red-500"
                    : "bg-gray-400"
            }`}
          />
          <span>
            Status: <b>{status}</b>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Init", fn: init },
            { label: "Create Offer", fn: handleCreateOffer },
            { label: "Create Answer", fn: handleCreateAnswer },
            { label: "Set Answer", fn: handleSetAnswer },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.fn}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg
              hover:bg-blue-700 hover:scale-105 active:scale-95
              transition-all duration-150"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* offer/answer unchanged */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Local Offer</label>
            <textarea
              value={localOffer}
              readOnly
              className="w-full h-28 p-2 border rounded-lg bg-gray-100"
            />
            <button
              onClick={() => downloadFile(localOffer, "offer.json")}
              className="mt-2 bg-gray-200 px-3 py-1 rounded hover:scale-105 transition"
            >
              Download
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold">Remote Offer</label>
            <textarea
              value={remoteOffer}
              onChange={(e) => setRemoteOffer(e.target.value)}
              className="w-full h-28 p-2 border rounded-lg"
            />
            <input
              type="file"
              onChange={(e) => handleUpload(setRemoteOffer, e)}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Local Answer</label>
            <textarea
              value={localAnswer}
              readOnly
              className="w-full h-28 p-2 border rounded-lg bg-gray-100"
            />
            <button
              onClick={() => downloadFile(localAnswer, "answer.json")}
              className="mt-2 bg-gray-200 px-3 py-1 rounded hover:scale-105 transition"
            >
              Download
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold">Remote Answer</label>
            <textarea
              value={remoteAnswer}
              onChange={(e) => setRemoteAnswerState(e.target.value)}
              className="w-full h-28 p-2 border rounded-lg"
            />
            <input
              type="file"
              onChange={(e) => handleUpload(setRemoteAnswerState, e)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* MODE TOGGLE (UNCHANGED) */}
      <div className="flex rounded-lg overflow-hidden border w-fit">
        <button
          onClick={() => setMode("generate")}
          className={`px-5 py-2 ${
            mode === "generate"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Code Generation
        </button>
        <button
          onClick={() => setMode("debug")}
          className={`px-5 py-2 ${
            mode === "debug"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Debugging
        </button>
      </div>

      {/* GENERATE */}
      {mode === "generate" && (
        <div className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-bold">Code Generation</h2>

          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full border p-3 rounded-lg"
            rows={4}
          />

          {/* ✅ NEW VOICE BUTTON */}
          <div className="flex justify-end gap-2">
            <button
              onClick={startListening}
              className={`px-4 py-2 rounded-lg text-white transition ${
                isListening ? "bg-red-500" : "bg-blue-500"
              }`}
            >
              {isListening ? "Listening..." : "Speak"}
            </button>

            <button
              onClick={handleRun}
              disabled={!modelLoaded || generating}
              className={`px-4 py-2 rounded-lg text-white
              ${
                loadingModel || generating
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {loadingModel
                ? "Loading..."
                : generating
                  ? "Running..."
                  : "Generate"}
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg min-h-[150px]">
            <h3 className="font-semibold mb-2">Output:</h3>
            <pre className="whitespace-pre-wrap">{displayedOutput}</pre>
          </div>
        </div>
      )}

      {/* DEBUG (VOICE ALSO ADDED) */}
      {mode === "debug" && (
        <div className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-bold">Debugging</h2>

          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full border p-3 rounded-lg font-mono"
            rows={10}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={startListening}
              className={`px-4 py-2 rounded-lg text-white ${
                isListening ? "bg-red-500" : "bg-blue-500"
              }`}
            >
              {isListening ? "Listening..." : "Speak"}
            </button>

            <button
              onClick={handleRun}
              disabled={!modelLoaded || generating}
              className={`px-4 py-2 rounded-lg text-white
              ${
                loadingModel || generating
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {loadingModel
                ? "Loading..."
                : generating
                  ? "Running..."
                  : "Debug"}
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg min-h-[200px]">
            <h3 className="font-semibold mb-2">Output:</h3>
            <pre className="whitespace-pre-wrap">{displayedOutput}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

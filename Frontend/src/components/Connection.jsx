import React, { useState } from "react";
import { createOffer, createAnswer, acceptAnswer } from "../collab/webrtcUi";

export default function Connection({ uiTree, dispatch, onReceiveOperation }) {
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const [connected, setConnected] = useState(false);

  function handleMessage(op) {
    onReceiveOperation(op);
  }

  function handleOpen() {
    setConnected(true);

    dispatch({
      type: "INIT",
      state: uiTree,
    });
  }

  // 📥 upload JSON file
  function handleFileUpload(e, setValue) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setValue(event.target.result);
    };
    reader.readAsText(file);
  }

  // 📤 download JSON file
  function downloadJSON(data, filename) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 text-xs">
      {!connected ? (
        <>
          {/* 🔹 OFFER ROW */}
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded"
              onClick={async () => {
                const off = await createOffer(handleMessage, handleOpen);
                setOffer(off);
              }}
            >
              Offer
            </button>

            <input
              className="flex-1 px-2 py-1 border rounded"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="Offer JSON..."
            />

            <button
              className="px-2 py-1 bg-blue-200 rounded"
              onClick={() => downloadJSON(offer, "offer.json")}
            >
              ⬇
            </button>

            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, setOffer)}
            />
          </div>

          {/* 🔹 ANSWER ROW */}
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded"
              onClick={async () => {
                const ans = await createAnswer(
                  offer,
                  handleMessage,
                  handleOpen,
                );
                setAnswer(ans);
              }}
            >
              Answer
            </button>

            <input
              className="flex-1 px-2 py-1 border rounded"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer JSON..."
            />

            <button
              className="px-2 py-1 bg-blue-200 rounded"
              onClick={() => downloadJSON(answer, "answer.json")}
            >
              ⬇
            </button>

            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, setAnswer)}
            />
          </div>

          {/* 🔹 CONNECT */}
          <button
            className="px-3 py-1 bg-green-500 text-white rounded"
            onClick={() => acceptAnswer(answer)}
          >
            Connect
          </button>
        </>
      ) : (
        <div className="text-green-600 font-semibold">✅ Connected</div>
      )}
    </div>
  );
}

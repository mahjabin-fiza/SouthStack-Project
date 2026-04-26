import React, { useState } from "react";
import {
  createPeer,
  createOffer,
  createAnswer,
  setRemoteAnswer,
} from "../collab/webrtcUi";

export default function Connection({ uiTree, dispatch, onReceiveOperation }) {
  const [status, setStatus] = useState("new");

  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");

  function handleMessage(op) {
    onReceiveOperation(op);
  }

  function handleOpen() {
    console.log("✅ CONNECTED");

    dispatch({
      type: "INIT",
      state: uiTree,
    });
  }

  function init() {
    console.log("🚀 INIT");
    createPeer(setStatus, null, handleMessage);
  }

  function download(data, name) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }

  async function upload(setter, e) {
    const file = e.target.files[0];
    const text = await file.text();
    setter(text);
  }

  return (
    <div className="p-3 border rounded text-xs space-y-3">
      {/* STATUS */}
      <div>
        Status: <b>{status}</b>
      </div>

      {/* INIT */}
      <button onClick={init} className="bg-gray-300 px-2 py-1 rounded">
        Init
      </button>

      <div className="flex gap-4">
        {/* OFFER */}
        <div className="border p-2 rounded w-48">
          <b>Host</b>

          <button
            className="block w-full mt-2 bg-blue-500 text-white"
            onClick={async () => {
              const off = await createOffer(handleMessage, handleOpen);
              setOffer(JSON.stringify(off));
            }}
          >
            Create Offer
          </button>

          <button onClick={() => download(offer, "offer.json")}>⬇</button>

          <input type="file" onChange={(e) => upload(setAnswer, e)} />

          <button
            className="mt-2 bg-green-500 text-white w-full"
            onClick={async () => {
              await setRemoteAnswer(JSON.parse(answer));
            }}
          >
            Accept Answer
          </button>
        </div>

        {/* ANSWER */}
        <div className="border p-2 rounded w-48">
          <b>Peer</b>

          <input type="file" onChange={(e) => upload(setOffer, e)} />

          <button
            className="mt-2 bg-purple-500 text-white w-full"
            onClick={async () => {
              const ans = await createAnswer(
                JSON.parse(offer),
                handleMessage,
                handleOpen,
              );
              setAnswer(JSON.stringify(ans));
            }}
          >
            Create Answer
          </button>

          <button onClick={() => download(answer, "answer.json")}>⬇</button>
        </div>
      </div>
    </div>
  );
}

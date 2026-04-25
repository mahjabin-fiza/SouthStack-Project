import { generateText } from "./ai/engine";

let pc;
let dataChannel;
let onResultCallback;

let collected = [];
let startTime = 0;

// INIT
export function createPeer(updateStatus, _, onResult) {
  onResultCallback = onResult;

  pc = new RTCPeerConnection();

  pc.onconnectionstatechange = () => {
    updateStatus(pc.connectionState);
  };

  pc.ondatachannel = (e) => {
    dataChannel = e.channel;
    setupChannel();
  };
}

function setupChannel() {
  dataChannel.onopen = () => console.log("✅ [SYSTEM] Peer Connected");

  dataChannel.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    // =========================
    // 🌐 REMOTE WORKER
    // =========================
    if (data.type === "task_part") {
      console.log("🌐 [REMOTE WORKER] Task received");
      console.time("🌐 REMOTE_PROCESS");

      const result = await generateText(data.payload);

      console.timeEnd("🌐 REMOTE_PROCESS");
      console.log("✅ [REMOTE WORKER] Finished processing");

      dataChannel.send(
        JSON.stringify({
          type: "task_result",
          id: data.id,
          result,
        }),
      );
    }

    // =========================
    // 📥 MERGER RECEIVES
    // =========================
    if (data.type === "task_result") {
      console.timeEnd("🌐 REMOTE_TOTAL");
      console.log("📥 [MERGER] Remote result received");

      collected.push(data.result);

      if (collected.length === 2) {
        console.log("🧩 [MERGER] Merging results...");
        console.time("🧩 MERGE_TIME");

        const merged = await mergeResults(collected);

        console.timeEnd("🧩 MERGE_TIME");

        const total = performance.now() - startTime;
        console.log(`🚀 [TOTAL EXECUTION TIME]: ${total.toFixed(2)} ms`);

        onResultCallback(merged);
        collected = [];
      }
    }
  };
}

// OFFER
export async function createOffer() {
  if (!pc) {
    throw new Error("Peer not initialized. Click Init first.");
  }

  dataChannel = pc.createDataChannel("chat");
  setupChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitIce();

  return pc.localDescription;
}

// ANSWER
export async function createAnswer(offer) {
  if (!pc) {
    throw new Error("Peer not initialized. Click Init first.");
  }

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitIce();

  return pc.localDescription;
}

export async function setRemoteAnswer(answer) {
  await pc.setRemoteDescription(answer);
}

// =========================
// 🧠 PLANNER
// =========================
export async function sendTask(prompt) {
  if (!dataChannel || dataChannel.readyState !== "open") {
    console.log("💻 [LOCAL ONLY] No peer → running locally");
    const res = await generateText(prompt);
    onResultCallback(res);
    return;
  }

  console.log("🧠 [PLANNER] Splitting task...");
  startTime = performance.now();

  const parts = splitTask(prompt);

  console.log("📦 Task split into 2 parts");

  // =========================
  // ⚡ LOCAL WORKER
  // =========================
  console.log("⚡ [LOCAL WORKER] Started");
  console.time("⚡ LOCAL_PROCESS");

  const localPromise = generateText(parts[0]);

  // =========================
  // 🌐 REMOTE WORKER
  // =========================
  console.log("🌐 [REMOTE WORKER] Sending task...");
  console.time("🌐 REMOTE_TOTAL");

  dataChannel.send(
    JSON.stringify({
      type: "task_part",
      id: 1,
      payload: parts[1],
    }),
  );

  // wait local (runs in parallel)
  const localResult = await localPromise;

  console.timeEnd("⚡ LOCAL_PROCESS");
  console.log("✅ [LOCAL WORKER] Finished");

  collected.push(localResult);
}

// SPLIT
function splitTask(prompt) {
  return [`Part 1:\n${prompt}`, `Part 2:\n${prompt}`];
}

// MERGE
async function mergeResults(results) {
  const combined = results.join("\n\n");

  return await generateText(`
Merge and refine the following outputs into one clean final answer:

${combined}
`);
}

// ICE
function waitIce() {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") resolve();
    else {
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") resolve();
      };
    }
  });
}

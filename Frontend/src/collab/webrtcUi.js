let pc;
let dataChannel;
let onMessageCallback;
let onOpenCallback;

// INIT (MANDATORY)
export function createPeer(updateStatus, _, onMessage) {
  onMessageCallback = onMessage;

  pc = new RTCPeerConnection();

  pc.onconnectionstatechange = () => {
    console.log("🔄 Connection:", pc.connectionState);
    updateStatus(pc.connectionState);
  };

  pc.onsignalingstatechange = () => {
    console.log("📡 Signaling:", pc.signalingState);
  };

  pc.ondatachannel = (e) => {
    dataChannel = e.channel;
    setupChannel();
  };
}

// SETUP CHANNEL
function setupChannel() {
  dataChannel.onopen = () => {
    console.log("✅ DataChannel OPEN");
    onOpenCallback?.();
  };

  dataChannel.onmessage = (e) => {
    const op = JSON.parse(e.data);
    console.log("📥 Received:", op);
    onMessageCallback(op);
  };
}

// OFFER
export async function createOffer(onMessage, onOpen) {
  if (!pc) throw new Error("❌ Call INIT first");

  onMessageCallback = onMessage;
  onOpenCallback = onOpen;

  dataChannel = pc.createDataChannel("ui");
  setupChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await waitIce();

  console.log("📤 Offer created");
  return pc.localDescription;
}

// ANSWER
export async function createAnswer(offer, onMessage, onOpen) {
  if (!pc) throw new Error("❌ Call INIT first");

  onMessageCallback = onMessage;
  onOpenCallback = onOpen;

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await waitIce();

  console.log("📤 Answer created");
  return pc.localDescription;
}

// SET ANSWER (FIXED WITH GUARD)
export async function setRemoteAnswer(answer) {
  if (!pc) return;

  if (pc.signalingState !== "have-local-offer") {
    console.warn("⚠️ Wrong state:", pc.signalingState);
    return;
  }

  await pc.setRemoteDescription(answer);

  console.log("✅ Answer accepted");
}

// SEND
export function sendOperation(op) {
  if (dataChannel?.readyState === "open") {
    dataChannel.send(JSON.stringify(op));
  }
}

// ICE WAIT
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

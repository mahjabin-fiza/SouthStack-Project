// /src/collab/webrtc.js

let pc;
let dataChannel;

export function initConnection(onMessage, onOpen) {
  pc = new RTCPeerConnection();

  // receive channel (for answerer)
  pc.ondatachannel = (event) => {
    dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("Connected ✅");
      onOpen?.();
    };

    dataChannel.onmessage = (e) => {
      onMessage(JSON.parse(e.data));
    };
  };
}

// OFFER SIDE
export async function createOffer(onMessage, onOpen) {
  pc = new RTCPeerConnection();

  dataChannel = pc.createDataChannel("data");

  dataChannel.onopen = () => {
    console.log("Connected ✅");
    onOpen?.();
  };

  dataChannel.onmessage = (e) => {
    onMessage(JSON.parse(e.data));
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  return JSON.stringify(offer);
}

// ANSWER SIDE
export async function createAnswer(offerStr, onMessage, onOpen) {
  pc = new RTCPeerConnection();

  pc.ondatachannel = (event) => {
    dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("Connected ✅");
      onOpen?.();
    };

    dataChannel.onmessage = (e) => {
      onMessage(JSON.parse(e.data));
    };
  };

  const offer = JSON.parse(offerStr);
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  return JSON.stringify(answer);
}

// FINAL STEP
export async function acceptAnswer(answerStr) {
  const answer = JSON.parse(answerStr);
  await pc.setRemoteDescription(answer);
}

// SEND DATA
export function sendOperation(op) {
  if (dataChannel?.readyState === "open") {
    dataChannel.send(JSON.stringify(op));
  }
}

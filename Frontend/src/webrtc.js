let peerConnection;
let dataChannel;

export function createOffer(setSignal, onMessage) {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onconnectionstatechange = () => {
    console.log("🔗 Connection state:", peerConnection.connectionState);
  };

  dataChannel = peerConnection.createDataChannel("chat");

  dataChannel.onopen = () => {
    console.log("✅ Connected!");
  };

  dataChannel.onmessage = (event) => {
    console.log("📩 Received:", event.data);
    onMessage(event.data);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE candidate:", event.candidate);
    } else {
      console.log("Final SDP ready");
      setSignal(JSON.stringify(peerConnection.localDescription));
    }
  };

  peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer));
}

export function createAnswer(signal, setSignal, onMessage) {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onconnectionstatechange = () => {
    console.log("🔗 Connection state:", peerConnection.connectionState);
  };

  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("✅ Connected!");
    };

    dataChannel.onmessage = (event) => {
      console.log("📩 Received:", event.data);
      onMessage(event.data);
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate === null) {
      setSignal(JSON.stringify(peerConnection.localDescription));
    }
  };

  const offer = new RTCSessionDescription(JSON.parse(signal));

  peerConnection
    .setRemoteDescription(offer)
    .then(() => peerConnection.createAnswer())
    .then((answer) => peerConnection.setLocalDescription(answer));
}

export function connectWithAnswer(signal) {
  const answer = new RTCSessionDescription(JSON.parse(signal));
  peerConnection.setRemoteDescription(answer);
}

export function sendMessage(message) {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(message);
  }
}

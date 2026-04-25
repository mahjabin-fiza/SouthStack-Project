// wsClient.js
let socket;

export function connectWebSocket(onMessage, isAI = false) {
  // 🔥 CHANGE THIS to your IP when testing on university WiFi
  const WS_URL = "ws://172.20.21.53:3001";

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = async (event) => {
    console.log("📩 WS message:", event.data);

    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      console.log("❌ Invalid WS message");
      return;
    }

    console.log("📦 Parsed WS message:", msg);

    // 🤖 AI device handles prompt
    if (msg.type === "prompt" && isAI) {
      console.log("🤖 AI received prompt:", msg.data);

      try {
        const { generateText } = await import("./ai/engine");

        console.log("🧠 Generating...");
        const result = await generateText(msg.data);

        console.log("✅ AI result:", result);

        socket.send(
          JSON.stringify({
            type: "response",
            data: result,
          }),
        );
      } catch (err) {
        console.error("❌ AI error:", err);
      }
    }

    // 📤 Sender receives response
    if (msg.type === "response") {
      console.log("📨 Response received:", msg.data);
      onMessage(msg.data);
    }
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };
}

export function sendWSMessage(data) {
  console.log("📤 WS sending:", data);

  if (socket && socket.readyState === 1) {
    socket.send(data);
  } else {
    console.log("❌ WS not connected");
  }
}

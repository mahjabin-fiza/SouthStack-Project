import React, { useState } from "react";
import { analyzeImage } from "../ai/generateUI"; // ⚠️ adjust path if needed

function AiChatBox({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState("");

  // 🧠 IMAGE HANDLER
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const description = await analyzeImage(file);

      console.log("AI Image Description:", description);

      // 🔥 reuse existing system
      onSubmit(description);
    } catch (err) {
      console.error("Image processing failed:", err);
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[480px] z-50">
      <div className="bg-white border rounded-xl shadow-lg p-2 flex gap-2 items-center">
        {/* TEXT INPUT */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Ask AI to generate UI..."
          className="flex-1 outline-none px-2"
        />

        {/* 📸 IMAGE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-xs"
        />

        {/* BUTTON */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (!prompt.trim()) return;
            onSubmit(prompt);
            setPrompt("");
          }}
          className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm"
        >
          {loading ? "..." : "Done"}
        </button>
      </div>
    </div>
  );
}

export default AiChatBox;

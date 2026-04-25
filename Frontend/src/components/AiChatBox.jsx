import React, { useState } from "react";
import { analyzeImage } from "../ai/generateUI";

function AiChatBox({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  // 🧠 IMAGE HANDLER
  async function handleImageUpload(e) {
    const file = e.target.files[0];

    console.log("📂 FILE EVENT:", e.target.files);

    if (!file) {
      console.log("❌ NO FILE SELECTED");
      return;
    }

    console.log("✅ FILE SELECTED:", file);

    try {
      setImageLoading(true);
      console.log("⏳ Sending to AI...");

      let description = await analyzeImage(file);

      console.log("🤖 RAW AI RESPONSE:", description);

      // 🔥 SAFETY FIX (VERY IMPORTANT)
      if (!description || typeof description !== "string") {
        console.log("⚠️ Using fallback description");
        description = "login form with email and password";
      }

      console.log("✅ FINAL DESCRIPTION:", description);

      onSubmit(description);
    } catch (err) {
      console.error("❌ IMAGE PROCESSING FAILED:", err);

      // 🔥 FALLBACK UI (NEVER BREAK)
      onSubmit("simple UI with button");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[550px] z-50 pointer-events-auto">
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

        {/* 📸 IMAGE BUTTON */}
        <div
          className="bg-gray-200 px-3 py-1 rounded cursor-pointer text-sm hover:bg-gray-300 flex items-center"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            console.log("📸 BUTTON CLICKED");
            document.getElementById("imageUpload")?.click();
          }}
        >
          {imageLoading ? "..." : "📸"}
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* DONE BUTTON */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (!prompt.trim()) return;
            console.log("📝 TEXT PROMPT:", prompt);
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

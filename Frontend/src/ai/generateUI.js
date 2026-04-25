// 🧠 NORMALIZE PROMPT
function normalizePrompt(prompt) {
  return prompt.toLowerCase().replace(/\s+/g, "").replace(/-/g, "").trim();
}

// 🧠 DETECT TYPE
function detectLayoutType(prompt, elements) {
  const raw = prompt.toLowerCase();
  const text = normalizePrompt(prompt);

  if (
    text.includes("login") ||
    text.includes("signin") ||
    text.includes("signup") ||
    text.includes("register") ||
    raw.includes("log in") ||
    raw.includes("sign in")
  ) {
    return "form";
  }

  if (text.includes("dashboard") || text.includes("admin")) {
    return "dashboard";
  }

  if (
    text.includes("homepage") ||
    text.includes("landingpage") ||
    raw.includes("home page")
  ) {
    return "homepage";
  }

  if (elements.length > 6) return "dashboard";

  return "form";
}

// 🧠 ENFORCE FORM STRUCTURE
function enforceFormStructure(elements, prompt) {
  const text = normalizePrompt(prompt);

  const isLogin = text.includes("login") || text.includes("signin");

  const isSignup = text.includes("signup") || text.includes("register");

  const isContact = text.includes("contact");

  let fields = [];

  if (isLogin) {
    fields = ["Email", "Password"];
  } else if (isSignup) {
    fields = ["Name", "Email", "Password", "Confirm Password"];
  } else if (isContact) {
    fields = ["Name", "Email", "Message"];
  }

  if (!isLogin && !isSignup && !isContact) {
    return elements;
  }

  const result = [];

  result.push({
    type: "text",
    text: isLogin ? "Login" : isSignup ? "Sign Up" : "Contact",
  });

  fields.forEach((f) => {
    result.push({
      type: "rectangle",
      text: f,
    });
  });

  result.push({
    type: "button",
    text: "Submit",
  });

  return result;
}

// 🟩 FORM LAYOUT
function buildForm(elements) {
  // 🔥 SORT ELEMENTS
  elements.sort((a, b) => {
    if (a.type === "text") return -1;
    if (b.type === "text") return 1;
    if (a.type === "rectangle") return -1;
    if (b.type === "rectangle") return 1;
    return 0;
  });

  let currentY = 80;
  const centerX = 900 / 2;

  return elements.flatMap((el, index) => {
    const items = [];

    // TITLE
    if (el.type === "text" && index === 0) {
      items.push({
        ...el,
        x: centerX - 150,
        y: currentY,
        width: 300,
        height: 50,
        style: { fontSize: 28, fontWeight: "bold" },
      });

      currentY += 80;
      return items;
    }

    // INPUT
    if (el.type === "rectangle") {
      const labelWidth = 100;

      items.push({
        type: "text",
        text: el.text,
        x: centerX - 160,
        y: currentY + 12,
        width: labelWidth,
        height: 20,
      });

      items.push({
        ...el,
        x: centerX - 160 + labelWidth + 10,
        y: currentY,
        width: 200,
        height: 45,
        style: {
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
        },
      });

      currentY += 60;
      return items;
    }

    // BUTTON
    if (el.type === "button") {
      items.push({
        ...el,
        x: centerX - 140,
        y: currentY,
        width: 280,
        height: 50,
        style: {
          backgroundColor: "#2563eb",
          color: "#fff",
          borderRadius: 10,
        },
      });

      currentY += 70;
      return items;
    }

    return [];
  });
}

// 🟦 HOMEPAGE (PRETTY VERSION)
function buildHomepage(elements) {
  const items = [];

  // NAVBAR
  items.push({
    type: "rectangle",
    x: 0,
    y: 0,
    width: 900,
    height: 70,
    style: { backgroundColor: "#111827" },
  });

  items.push({
    type: "text",
    text: "MyBrand",
    x: 20,
    y: 20,
    width: 150,
    height: 30,
    style: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  });

  const nav = ["Home", "Features", "Pricing", "Contact"];
  nav.forEach((n, i) => {
    items.push({
      type: "text",
      text: n,
      x: 500 + i * 90,
      y: 22,
      width: 80,
      height: 30,
      style: { color: "#d1d5db" },
    });
  });

  // HERO
  items.push({
    type: "text",
    text: "Build Your UI Instantly",
    x: 200,
    y: 120,
    width: 500,
    height: 60,
    style: { fontSize: 32, fontWeight: "bold" },
  });

  items.push({
    type: "text",
    text: "Generate beautiful UI with AI in seconds",
    x: 230,
    y: 180,
    width: 450,
    height: 40,
    style: { fontSize: 16, color: "#6b7280" },
  });

  items.push({
    type: "button",
    text: "Get Started",
    x: 350,
    y: 240,
    width: 200,
    height: 50,
  });

  // FEATURES
  for (let i = 0; i < 3; i++) {
    items.push({
      type: "rectangle",
      x: 100 + i * 250,
      y: 320,
      width: 200,
      height: 140,
      style: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
      },
    });
  }

  return items;
}

// 🟥 DASHBOARD (PRETTY VERSION)
function buildDashboard(elements) {
  const items = [];

  // HEADER
  items.push({
    type: "rectangle",
    x: 0,
    y: 0,
    width: 900,
    height: 70,
    style: { backgroundColor: "#1f2937" },
  });

  items.push({
    type: "text",
    text: "Dashboard",
    x: 20,
    y: 20,
    width: 200,
    height: 30,
    style: { color: "#fff", fontSize: 20 },
  });

  // SIDEBAR
  items.push({
    type: "rectangle",
    x: 0,
    y: 70,
    width: 200,
    height: 530,
    style: { backgroundColor: "#111827" },
  });

  const menu = ["Dashboard", "Users", "Analytics", "Settings"];
  menu.forEach((m, i) => {
    items.push({
      type: "text",
      text: m,
      x: 20,
      y: 100 + i * 40,
      width: 160,
      height: 30,
      style: { color: "#d1d5db" },
    });
  });

  // CARDS
  let startX = 220;
  let startY = 100;

  for (let i = 0; i < 4; i++) {
    items.push({
      type: "rectangle",
      x: startX + (i % 2) * 260,
      y: startY + Math.floor(i / 2) * 160,
      width: 240,
      height: 120,
      style: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
      },
    });
  }

  return items;
}

// 🧠 MAIN SWITCH
function buildLayout(elements, type) {
  if (type === "dashboard") return buildDashboard(elements);
  if (type === "homepage") return buildHomepage(elements);
  return buildForm(elements);
}

// 🤖 MAIN FUNCTION
export async function generateUI(prompt, normalizeElement, setElements) {
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:7b",
        stream: false,
        prompt: `
Return ONLY JSON array.

Each item:
{
  "type": "text" | "button" | "rectangle",
  "text": string
}

User request:
${prompt}
        `,
      }),
    });

    const data = await res.json();

    let text = data.response || "";

    text = text.replace(/```json|```/g, "").trim();

    // 🔥 SAFE PARSE
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    let parsed = [];

    if (start !== -1 && end !== -1) {
      try {
        parsed = JSON.parse(text.slice(start, end + 1));
      } catch {
        parsed = [];
      }
    }

    // fallback
    if (!parsed.length) {
      parsed = [
        { type: "text", text: "Fallback UI" },
        { type: "rectangle", text: "Field" },
        { type: "button", text: "Submit" },
      ];
    }

    const fixed = enforceFormStructure(parsed, prompt);
    const layoutType = detectLayoutType(prompt, fixed);
    const laidOut = buildLayout(fixed, layoutType);

    const normalized = laidOut.map((el) => normalizeElement(el));

    setElements(normalized);
  } catch (err) {
    console.error(err);

    setElements([
      normalizeElement({
        type: "text",
        text: "Something went wrong",
        x: 100,
        y: 100,
        width: 200,
        height: 50,
      }),
    ]);
  }
}

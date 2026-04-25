import { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import Canvas from "../components/Canvas";
import PropertiesPanel from "../components/PropertiesPanel";
import Connection from "../components/Connection";
import * as htmlToImage from "html-to-image";
import AiChatBox from "../components/AiChatBox";
import { generateUI } from "../ai/generateUI";
let idCounter = 1;

function UiBuilder() {
  function generateId() {
    return idCounter++;
  }

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("ui-builder-data");
    const parsed = saved ? JSON.parse(saved) : [];

    return {
      past: [],
      present: parsed,
      future: [],
    };
  });

  const elements = history.present;

  function setElements(newElements, options = { saveHistory: true }) {
    setHistory((prev) => {
      const resolvedElements =
        typeof newElements === "function"
          ? newElements(prev.present)
          : newElements;

      // 🛑 skip if same
      if (JSON.stringify(prev.present) === JSON.stringify(resolvedElements)) {
        return prev;
      }

      // 🚫 no history (drag)
      if (!options.saveHistory) {
        return {
          ...prev,
          present: resolvedElements,
        };
      }

      // ✅ normal
      return {
        past: [...prev.past, prev.present],
        present: resolvedElements,
        future: [],
      };
    });
  }

  const [selectedIds, setSelectedIds] = useState([]);
  const selectedId = selectedIds[0] || null;

  const [draggingId, setDraggingId] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const [panelTab, setPanelTab] = useState("properties");

  const [loading, setLoading] = useState(false);

  const [copiedElements, setCopiedElements] = useState([]);

  function copyElements() {
    if (selectedIds.length === 0) return;

    const selected = elements.filter((el) => selectedIds.includes(el.id));

    setCopiedElements(selected);
  }
  function pasteElements() {
    if (copiedElements.length === 0) return;

    const newItems = copiedElements.map((el) => ({
      ...el,
      id: Date.now() + Math.random(), // unique id
      x: el.x + 20, // offset so it's visible
      y: el.y + 20,
    }));

    setElements((prev) => {
      const combined = [...prev, ...newItems];
      return renumberElements(combined);
    });
    setSelectedIds(newItems.map((el) => el.id));
  }

  useEffect(() => {
    localStorage.setItem("ui-builder-data", JSON.stringify(elements));
  }, [elements]);

  function updateElements(newElements) {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newElements,
      future: [], // clear redo stack
    }));
  }

  function updateElement(id, key, value) {
    const updated = elements.map((el) => {
      if (el.id === id) {
        return { ...el, [key]: value };
      }
      if (el.type === "container" && el.children) {
        const newChildren = el.children.map((child) => {
          if (child.id === id) {
            return { ...child, [key]: value };
          }
          return child;
        });

        return { ...el, children: newChildren };
      }

      return el;
    });

    setElements(updated);
  }

  function undo() {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }

  function redo() {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: prev.future.slice(1),
      };
    });
  }

  function createBaseElement(type) {
    const base = {
      id: generateId(),
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      text: "",

      style: {
        backgroundColor: type === "rectangle" ? "#ffffff" : "#d1d5db",
        color: "#000000",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "Arial",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#d1d5db",
        boxShadow: "none",
        hoverBackgroundColor: "#d1d5db",
        hoverColor: "#000000",
      },
    };

    if (type === "container") {
      return {
        ...base,
        width: 250,
        height: 150,
        children: [],
        layout: "row",
        gap: 10,
        padding: 10,
      };
    }

    return base;
  }

  function getElementCount(type) {
    let count = 0;

    elements.forEach((el) => {
      // count top-level
      if (el.type === type) count++;

      // count inside container
      if (el.type === "container" && el.children) {
        el.children.forEach((child) => {
          if (child.type === type) count++;
        });
      }
    });

    return count + 1;
  }

  function renumberElements(elements) {
    const counts = {};

    function renumberList(list) {
      return list.map((el) => {
        // count type globally
        if (!counts[el.type]) counts[el.type] = 1;
        else counts[el.type]++;

        const updatedEl = {
          ...el,
          text:
            el.text ||
            `${el.type.charAt(0).toUpperCase() + el.type.slice(1)} ${counts[el.type]}`,
        };

        // 🔁 recursively renumber children
        if (el.type === "container" && el.children) {
          updatedEl.children = renumberList(el.children);
        }

        return updatedEl;
      });
    }

    return renumberList(elements);
  }

  function addButton() {
    const count = getElementCount("button");
    const newEl = {
      ...createBaseElement("button"),
      text: `Button ${count}`,
      width: 90,
      height: 35,

      style: {
        backgroundColor: "#d1d5db",
        color: "#000000",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "Arial",
        borderRadius: 4,
        borderWidth: 0,
        borderColor: "#000000",
        boxShadow: "none",
        enableHover: false,
        hoverBackgroundColor: "#d1d5db",
        hoverColor: "#000000",
      },
    };

    if (selectedId) {
      const updated = elements.map((el) => {
        if (el.id === selectedId && el.type === "container") {
          return {
            ...el,
            children: [...el.children, { ...newEl, parentId: el.id }],
          };
        }
        return el;
      });

      setElements(renumberElements(updated));
      return;
    }

    setElements((prev) => [...prev, newEl]);
  }

  function addText() {
    const count = getElementCount("text");
    const newEl = {
      ...createBaseElement("text"),
      text: `Text ${count}`,
    };
    if (selectedId) {
      const updated = elements.map((el) => {
        if (el.id === selectedId && el.type === "container") {
          return {
            ...el,
            children: [...el.children, { ...newEl, parentId: el.id }],
          };
        }
        return el;
      });

      setElements(renumberElements(updated));
      return;
    }
    setElements((prev) => renumberElements([...prev, newEl]));
  }

  function addRectangle() {
    const count = getElementCount("rectangle");
    const newEl = {
      ...createBaseElement("rectangle"),
      text: `Rectangle ${count}`,
      width: 150,
      height: 150,
    };

    if (selectedId) {
      const updated = elements.map((el) => {
        if (el.id === selectedId && el.type === "container") {
          return {
            ...el,
            children: [...el.children, { ...newEl, parentId: el.id }],
          };
        }
        return el;
      });

      setElements(renumberElements(updated));
      return;
    }

    setElements((prev) => renumberElements([...prev, newEl]));
  }

  function addCircle() {
    const count = getElementCount("circle");
    const newEl = {
      ...createBaseElement("circle"),
      text: `Circle ${count}`,
      width: 80,
      height: 80,
    };

    if (selectedId) {
      const updated = elements.map((el) => {
        if (el.id === selectedId && el.type === "container") {
          return {
            ...el,
            children: [...el.children, { ...newEl, parentId: el.id }],
          };
        }
        return el;
      });

      setElements(renumberElements(updated));
      return;
    }
    setElements((prev) => renumberElements([...prev, newEl]));
  }

  function addContainer() {
    const newEl = {
      ...createBaseElement("container"),
      text: "Container",
      width: 250,
      height: 150,
    };

    setElements((prev) => [...prev, newEl]);
  }

  function deleteElement() {
    if (selectedIds.length === 0) return;

    function removeFromList(list) {
      return list
        .filter((el) => !selectedIds.includes(el.id))
        .map((el) => {
          if (el.type === "container" && el.children) {
            return {
              ...el,
              children: removeFromList(el.children),
            };
          }
          return el;
        });
    }

    const updated = removeFromList(elements);

    setElements(renumberElements(updated));
    setSelectedIds([]);
  }

  function exportPNG() {
    const node = document.getElementById("canvas");
    htmlToImage.toPng(node).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "design.png";
      link.href = dataUrl;
      link.click();
    });
  }

  function exportJPG() {
    const node = document.getElementById("canvas");
    htmlToImage.toJpeg(node).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "design.jpg";
      link.href = dataUrl;
      link.click();
    });
  }

  function updateElementStyle(id, key, value) {
    const updated = elements.map((el) => {
      if (el.id === id) {
        return {
          ...el,
          style: {
            ...el.style,
            [key]: value,
          },
        };
      }

      if (el.type === "container" && el.children) {
        const newChildren = el.children.map((child) => {
          if (child.id === id) {
            return {
              ...child,
              style: {
                ...child.style,
                [key]: value,
              },
            };
          }
          return child;
        });

        return { ...el, children: newChildren };
      }

      return el;
    });

    setElements(updated);
  }

  function toggleLayout(id) {
    const updated = elements.map((el) => {
      if (el.id === id && el.type === "container") {
        return {
          ...el,
          layout: el.layout === "row" ? "column" : "row",
        };
      }
      return el;
    });

    setElements(updated);
  }

  function handleMouseDown(e) {
    // only pan when clicking empty canvas area
    if (e.target.id !== "canvas") return;
  }

  function normalizeElement(el) {
    return {
      ...createBaseElement(el.type),
      ...el,
      id: crypto.randomUUID(),
      style: {
        ...createBaseElement(el.type).style,
        ...(el.style || {}),
      },
    };
  }

  function generateElementsFromAI(data) {
    if (!data || !data.type) return null;

    const base = createBaseElement(data.type);

    const element = {
      ...base,
      text:
        data.text ||
        (data.type === "button" && "Button") ||
        (data.type === "text" && "Text") ||
        "",

      style: {
        ...base.style,
        ...(data.style || {}), // 🔥 THIS IS THE FIX
      },
    };

    if (data.type === "container") {
      element.layout = data.layout || "row";
      element.gap = data.gap || 10;
      element.padding = data.padding || 10;

      element.children = data.children
        ? data.children
            .map((child) => generateElementsFromAI(child))
            .filter(Boolean)
            .map((child) => ({
              ...child,
              parentId: element.id,
            }))
        : [];
    }

    return element;
  }

  async function handleAI(prompt) {
    setLoading(true);
    await generateUI(prompt, normalizeElement, setElements);
    setLoading(false);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteElement();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds, elements]);

  useEffect(() => {
    function handleKeyDown(e) {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      // COPY
      if (isCmdOrCtrl && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copyElements();
      }

      // PASTE
      if (isCmdOrCtrl && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteElements();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteElement();
      }

      // UNDO
      if (isCmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // REDO
      if (isCmdOrCtrl && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds, elements, copiedElements]);

  return (
    <div className="relative h-screen flex">
      {/* SIDEBAR */}
      {showSidebar && (
        <div className="w-[200px] bg-white">
          <Sidebar
            addButton={addButton}
            addText={addText}
            addRectangle={addRectangle}
            addCircle={addCircle}
            elements={elements}
            setElements={setElements}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            selectedId={selectedId}
            exportJPG={exportJPG}
            exportPNG={exportPNG}
            addContainer={addContainer}
            updateElement={updateElement}
            toggleLayout={toggleLayout}
          />
        </div>
      )}

      {/* CANVAS AREA */}
      <div
        className="flex-1 flex items-center justify-center bg-gray-200 relative overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        <div
          id="canvas"
          className="bg-white shadow-lg absolute z-0"
          style={{
            width: 980,
            height: 600,
            transformOrigin: "center",
          }}
        >
          <Canvas
            elements={elements}
            setElements={setElements}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
            dragStart={dragStart}
            setDragStart={setDragStart}
            resizingId={resizingId}
            setResizingId={setResizingId}
            resizeStart={resizeStart}
            setResizeStart={setResizeStart}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      {showRightPanel && (
        <div className="w-[280px] bg-gray-100 flex flex-col">
          <div className="flex border-b">
            <button
              onClick={() => setPanelTab("properties")}
              className={`flex-1 p-2 ${
                panelTab === "properties" ? "bg-white font-bold" : ""
              }`}
            >
              Properties
            </button>

            <button
              onClick={() => setPanelTab("connection")}
              className={`flex-1 p-2 ${
                panelTab === "connection" ? "bg-white font-bold" : ""
              }`}
            >
              Connection
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {panelTab === "properties" ? (
              <PropertiesPanel
                elements={elements}
                selectedId={selectedId}
                setElements={setElements}
                deleteElement={deleteElement}
                draggingId={draggingId}
                setDraggingId={setDraggingId}
                updateElementStyle={updateElementStyle}
                updateElement={updateElement}
              />
            ) : (
              <div className="p-4 text-gray-500">
                Connection panel (coming soon)
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOGGLE BUTTONS */}
      <div className="absolute bottom-4 left-3 flex flex-col gap-2 z-50">
        {/* TOGGLE BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="bg-gray-800 text-white px-2 py-1 text-xs rounded"
          >
            Left Panel
          </button>

          <button
            onClick={() => setShowRightPanel((prev) => !prev)}
            className="bg-gray-800 text-white px-2 py-1 text-xs rounded"
          >
            Right Panel
          </button>
        </div>
      </div>

      {/* AI BOX */}
      <AiChatBox onSubmit={handleAI} loading={loading} />
    </div>
  );
}

export default UiBuilder;

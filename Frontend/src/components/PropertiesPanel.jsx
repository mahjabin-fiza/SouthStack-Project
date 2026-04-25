import { useState } from "react";

export default function PropertiesPanel({
  elements,
  selectedId,
  setElements,
  deleteElement,
  updateElement,
  updateElementStyle,
}) {
  const selectedElement = findElementById(elements, selectedId);
  const [manualMode, setManualMode] = useState(false);

  const FONT_OPTIONS = [
    "Arial",
    "Verdana",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Trebuchet MS",
    "Tahoma",
    "Impact",
    "Comic Sans MS",
    "Lucida Console",
  ];

  function findElementById(elements, id) {
    for (let el of elements) {
      if (el.id === id) return el;

      if (el.type === "container" && el.children) {
        const found = findElementById(el.children, id); // 🔥 recursion
        if (found) return found;
      }
    }
    return null;
  }

  // function updateText(e) {
  //   const newText = e.target.value;

  //   const updated = elements.map((el) => {
  //     if (el.id === selectedId) {
  //       return { ...el, text: newText };
  //     }
  //     return el;
  //   });

  //   setElements(updated);
  // }

  // function updateStyle(key, value) {
  //   const updated = elements.map((el) => {
  //     if (el.id === selectedId) {
  //       return {
  //         ...el,
  //         style: {
  //           ...el.style,
  //           [key]: value,
  //         },
  //       };
  //     }
  //     return el;
  //   });

  //   setElements(updated);
  // }

  // function updateLayout(key, value) {
  //   const updated = elements.map((el) => {
  //     if (el.id === selectedId) {
  //       return {
  //         ...el,
  //         [key]: Number(value),
  //       };
  //     }
  //     return el;
  //   });

  //   setElements(updated);
  // }

  return (
    <div className="flex flex-col">
      {/* <h2 className="text-lg font-bold">Properties</h2> */}

      {!selectedElement ? (
        <p className="text-sm text-gray-500 p-2">Select an element</p>
      ) : (
        <>
          <div className="p-4 bg-gray-100 flex flex-col gap-5">
            {/* TEXT INPUT (only for text & button) */}
            {(selectedElement.type === "text" ||
              selectedElement.type === "button") && (
              <div>
                <label className="text-sm font-medium">Text</label>
                <input
                  type="text"
                  value={selectedElement.text}
                  onChange={(e) =>
                    updateElement(selectedId, "text", e.target.value)
                  }
                  className="w-full border bg-white rounded p-2 mt-1"
                />
              </div>
            )}

            <div className="">
              <p className="text-sm font-medium mb-2">Layout</p>

              {/* POSITION */}
              <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                  </div>
                  {manualMode ? (
                    <>
                      <div>
                        <input
                          type="number"
                          value={selectedElement.x}
                          onChange={(e) =>
                            updateElement(
                              selectedId,
                              "x",
                              Number(e.target.value),
                            )
                          }
                          className="w-16 border rounded p-1 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={selectedElement.y}
                          onChange={(e) =>
                            updateElement(
                              selectedId,
                              "y",
                              Number(e.target.value),
                            )
                          }
                          className="w-16 border rounded p-1 text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>X: {selectedElement.x}</div>
                      <div>Y: {selectedElement.y}</div>
                    </>
                  )}
                </div>

                {/* SIZE */}
                <div className="flex flex-col gap-1">
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                  </div>

                  {manualMode ? (
                    <>
                      <div>
                        <input
                          type="number"
                          value={selectedElement.width}
                          onChange={(e) =>
                            updateElement(
                              selectedId,
                              "width",
                              Number(e.target.value),
                            )
                          }
                          className="w-16 border rounded p-1 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={selectedElement.height}
                          onChange={(e) =>
                            updateElement(
                              selectedId,
                              "height",
                              Number(e.target.value),
                            )
                          }
                          className="w-16 border rounded p-1 text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>W: {selectedElement.width}</div>
                      <div>H: {selectedElement.height}</div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setManualMode(!manualMode)}
                  className="h-8 text-xs px-2 py-1 border rounded bg-white hover:bg-gray-300"
                >
                  {manualMode ? "Done" : "Change"}
                </button>
              </div>
            </div>

            {/* BACKGROUND (button + rectangle + circle) */}
            {(selectedElement.type === "rectangle" ||
              selectedElement.type === "circle") && (
              <div>
                <p className="text-sm font-medium mb-1">Color</p>
                <input
                  type="color"
                  value={selectedElement.style.backgroundColor}
                  onChange={(e) =>
                    updateElementStyle(
                      selectedId,
                      "backgroundColor",
                      e.target.value,
                    )
                  }
                  className="h-8"
                />
              </div>
            )}

            {/* TYPOGRAPHY (only text + button) */}
            {(selectedElement.type === "text" ||
              selectedElement.type === "button") && (
              <div className="">
                <p className="text-sm font-medium mb-1">Typography</p>
                <div className="flex justify-between">
                  <div className="flex flex-col gap-2">
                    <div>
                      <select
                        value={selectedElement.style.fontFamily}
                        onChange={(e) =>
                          updateElementStyle(
                            selectedId,
                            "fontFamily",
                            e.target.value,
                          )
                        }
                        className="w-full border rounded p-1 text-sm"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={selectedElement.style.fontSize}
                        onChange={(e) =>
                          updateElementStyle(
                            selectedId,
                            "fontSize",
                            Number(e.target.value),
                          )
                        }
                        className="w-16 border rounded p-1 text-sm"
                      />

                      {/* Bold */}
                      <button
                        onClick={() =>
                          updateElementStyle(
                            selectedId,
                            "fontWeight",
                            selectedElement.style.fontWeight === "bold"
                              ? "normal"
                              : "bold",
                          )
                        }
                        className={`px-2 border rounded font-bold ${
                          selectedElement.style.fontWeight === "bold"
                            ? "bg-gray-700 text-white"
                            : "bg-white"
                        }`}
                      >
                        B
                      </button>

                      {/* Italic */}
                      <button
                        onClick={() =>
                          updateElementStyle(
                            selectedId,
                            "fontStyle",
                            selectedElement.style.fontStyle === "italic"
                              ? "normal"
                              : "italic",
                          )
                        }
                        className={`px-2 border rounded italic ${
                          selectedElement.style.fontStyle === "italic"
                            ? "bg-gray-700 text-white"
                            : "bg-white"
                        }`}
                      >
                        I
                      </button>
                    </div>
                  </div>

                  {/* Font Color */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="color"
                      value={selectedElement.style.color}
                      onChange={(e) =>
                        updateElementStyle(selectedId, "color", e.target.value)
                      }
                      className="h-8"
                    />
                    {(selectedElement.type === "button" ||
                      selectedElement.type === "rectangle" ||
                      selectedElement.type === "circle") && (
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor}
                        onChange={(e) =>
                          updateElementStyle(
                            selectedId,
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                        className="h-8"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
            {(selectedElement.type === "button" ||
              selectedElement.type === "rectangle" ||
              selectedElement.type === "circle") && (
              <div>
                <p className="text-sm font-medium mb-1">Border</p>

                <div className="flex justify-between gap-2">
                  <input
                    type="number"
                    value={selectedElement.style.borderWidth}
                    onChange={(e) =>
                      updateElementStyle(
                        selectedId,
                        "borderWidth",
                        Number(e.target.value),
                      )
                    }
                    className="w-16 border rounded p-1 text-sm"
                  />

                  <input
                    type="color"
                    value={selectedElement.style.borderColor}
                    onChange={(e) =>
                      updateElementStyle(
                        selectedId,
                        "borderColor",
                        e.target.value,
                      )
                    }
                    className="h-8"
                  />
                </div>
              </div>
            )}

            {/* CORNER RADIUS (button + rectangle only) */}
            {(selectedElement.type === "button" ||
              selectedElement.type === "rectangle") && (
              <div>
                <p className="text-sm font-medium mb-1">Corner Radius</p>
                <div className="flex justify-between gap-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={selectedElement.style.borderRadius}
                      onChange={(e) =>
                        updateElementStyle(
                          selectedId,
                          "borderRadius",
                          Number(e.target.value),
                        )
                      }
                      className="w-42"
                    />
                  </div>
                  <div className="text-xs">
                    {selectedElement.style.borderRadius}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Shadow</p>

              <select
                value={selectedElement.style.boxShadow}
                onChange={(e) =>
                  updateElementStyle(selectedId, "boxShadow", e.target.value)
                }
                className="border rounded p-1 text-sm w-full"
              >
                <option value="none">None</option>
                <option value="0px 2px 5px rgba(0,0,0,0.2)">Small</option>
                <option value="0px 4px 10px rgba(0,0,0,0.3)">Medium</option>
                <option value="0px 8px 20px rgba(0,0,0,0.4)">Large</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Hover Effect</p>
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={selectedElement.style.enableHover}
                  onChange={(e) =>
                    updateElementStyle(
                      selectedId,
                      "enableHover",
                      e.target.checked,
                    )
                  }
                />
                Enable Hover
              </label>
              {selectedElement.style.enableHover && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedElement.style.hoverBackgroundColor}
                    onChange={(e) =>
                      updateElementStyle(
                        selectedId,
                        "hoverBackgroundColor",
                        e.target.value,
                      )
                    }
                  />

                  {(selectedElement.type === "button" ||
                    selectedElement.type === "text") && (
                    <input
                      type="color"
                      value={selectedElement.style.hoverColor}
                      onChange={(e) =>
                        updateElementStyle(
                          selectedId,
                          "hoverColor",
                          e.target.value,
                        )
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DELETE */}
          <div className="flex items-center justify-end px-4 py-1">
            <button
              onClick={deleteElement}
              className="mt-2 w-20 bg-red-400 text-white py-2 rounded hover:bg-red-500"
            >
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

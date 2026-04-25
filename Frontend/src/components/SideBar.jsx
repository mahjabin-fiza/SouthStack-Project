import LayersPanel from "./LayersPanel";

export default function Sidebar({
  addButton,
  addText,
  addRectangle,
  addCircle,
  elements,
  setElements,
  selectedId,
  setSelectedId,
  setSelectedIds,
  exportJPG,
  exportPNG,
  addContainer,
  updateElement,
  toggleLayout,
}) {
  const containerElement = elements.find((el) => el && el.id === selectedId);

  return (
    <div className="pb-5">
      <div className="h-full flex flex-col p-2 gap-10 relative">
        <div className="p-2">
          <button
            onClick={addButton}
            className="w-full bg-gray-700 text-white py-2 rounded transition ease-in-out duration-200 hover:scale-103"
          >
            Add Button
          </button>
          <button
            onClick={addText}
            className="w-full bg-gray-700 text-white py-2 rounded mt-2 transition ease-in-out duration-200 hover:scale-103"
          >
            Add Text
          </button>
          <button
            onClick={addRectangle}
            className="w-full bg-gray-700 text-white py-2 rounded mt-2 transition ease-in-out duration-200 hover:scale-103"
          >
            Add Rectangle
          </button>

          <button
            onClick={addCircle}
            className="w-full bg-gray-700 text-white py-2 rounded mt-2 transition ease-in-out duration-200 hover:scale-103"
          >
            Add Circle
          </button>
          <button
            onClick={addContainer}
            className="w-full bg-gray-700 text-white py-2 rounded mt-2 transition ease-in-out duration-200 hover:scale-103"
          >
            Add Container
          </button>
          {containerElement?.type === "container" && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Layout</p>

              {/* GAP */}
              <label className="block text-xs mb-1">Gap</label>
              <input
                type="range"
                min="0"
                max="50"
                value={containerElement.gap}
                onChange={(e) =>
                  updateElement(selectedId, "gap", Number(e.target.value))
                }
              />

              {/* PADDING */}
              <label className="block text-xs mt-2 mb-1">Padding</label>
              <input
                type="range"
                min="0"
                max="50"
                value={containerElement.padding}
                onChange={(e) =>
                  updateElement(selectedId, "padding", Number(e.target.value))
                }
              />
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Layout</p>

                {/* TOGGLE BUTTON */}
                <button
                  onClick={() => toggleLayout(selectedId)}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm mb-2"
                >
                  {containerElement.layout === "row"
                    ? "Switch to Column"
                    : "Switch to Row"}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="">
          <LayersPanel
            elements={elements}
            setElements={setElements}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        </div>
        <div className="p-2 flex gap-2">
          <button
            onClick={exportPNG}
            className="bg-white border text-black text-sm px-2 py-1 rounded hover:bg-gray-300 transition ease-in-out duration-200 hover:scale-103"
          >
            Export PNG
          </button>

          <button
            onClick={exportJPG}
            className="bg-white border text-black text-sm px-2 py-1 rounded hover:bg-gray-300 transition ease-in-out duration-200 hover:scale-103"
          >
            Export JPG
          </button>
        </div>
      </div>
    </div>
  );
}

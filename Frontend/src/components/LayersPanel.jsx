export default function LayersPanel({
  elements,
  setElements,
  selectedId,
  setSelectedId,
}) {
  function handleDragStart(e, index) {
    e.dataTransfer.setData("dragIndex", index);
  }

  function handleDrop(e, dropIndex) {
    const dragIndex = e.dataTransfer.getData("dragIndex");

    const updated = [...elements];
    const draggedItem = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setElements(updated);
  }

  return (
    <div className="h-[300px] overflow-y-auto rounded px-4 py-2 bg-gray-200 scroll-smooth">
      <h2 className="font-bold mb-3">Layers</h2>

      {elements.map((el, index) => (
        <div
          key={el.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => setSelectedId(el.id)}
          className={`p-2 mb-2 rounded cursor-pointer text-sm ${
            selectedId === el.id
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-gray-200"
          }`}
        >
          {el.text || el.type}
        </div>
      ))}
    </div>
  );
}

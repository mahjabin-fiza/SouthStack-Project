export function applyOperation(op, setUiTree) {
  setUiTree((prev) => {
    switch (op.type) {
      case "ADD":
        return [...prev, op.element];

      case "MOVE":
        return prev.map((el) =>
          el.id === op.id ? { ...el, x: op.x, y: op.y } : el,
        );

      case "DELETE":
        return prev.filter((el) => el.id !== op.id);

      case "INIT":
        return op.state;

      default:
        return prev;
    }
  });
}

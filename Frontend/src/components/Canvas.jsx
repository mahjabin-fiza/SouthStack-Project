import { useState } from "react";

export default function Canvas({
  elements,
  setElements,
  selectedIds,
  setSelectedIds,
  setDraggingId,
  dragStart,
  setDragStart,
  resizingId,
  setResizingId,
  resizeStart,
  setResizeStart,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [spacingGuides, setSpacingGuides] = useState([]);
  const [lastClickTime, setLastClickTime] = useState(0);

  const [guides, setGuides] = useState({
    vertical: null,
    horizontal: null,
  });

  function startResize(e, el, direction) {
    e.stopPropagation();

    if (!selectedIds.includes(el.id)) return;

    setResizeStart({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: el.width,
      startHeight: el.height,
      startXPos: el.x,
      startYPos: el.y,
      direction,
    });

    setResizingId(el.id);
  }

  // 🔹 Shared wrapper
  function ElementWrapper({ el }) {
    const isSelected = selectedIds.includes(el.id);
    const isInsideContainer = false;

    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();

          if (el.parentId) {
            setSelectedIds([el.id]);
          }
        }}
        onMouseEnter={() => setHoveredId(el.id)}
        onMouseLeave={() => setHoveredId(null)}
        onMouseDown={(e) => {
          document.body.style.userSelect = "none";

          const now = Date.now();
          const DOUBLE_CLICK_DELAY = 250;

          const isDoubleClick = now - lastClickTime < DOUBLE_CLICK_DELAY;
          setLastClickTime(now);

          if (isDoubleClick && el.parentId) {
            e.stopPropagation();
            setSelectedIds([el.id]);
            return;
          }

          if (e.shiftKey) {
            setSelectedIds((prev) => {
              if (prev.includes(el.id)) {
                return prev.filter((id) => id !== el.id);
              } else {
                return [...prev, el.id];
              }
            });
          } else {
            setSelectedIds([el.id]);
          }

          const rect = e.currentTarget.getBoundingClientRect();

          setDragStart({
            id: el.id,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
          });
          setDraggingId(el.id);
        }}
        style={{
          position: "absolute",
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          zIndex: el.zIndex,
        }}
        className={`cursor-move ${isSelected ? "" : ""}`}
      >
        {renderContent(el)}
        {isSelected && (
          <>
            <div
              className="absolute w-2 h-2 bg-white border border-blue-700 rounded-full -bottom-1 -right-1 cursor-se-resize"
              onMouseDown={(e) => startResize(e, el, "br")}
            />
            <div
              className="absolute w-2 h-2 bg-white border border-blue-700 rounded-full -bottom-1 -left-1 cursor-sw-resize"
              onMouseDown={(e) => startResize(e, el, "bl")}
            />
            <div
              className="absolute w-2 h-2 bg-white border border-blue-700 rounded-full -top-1 -right-1 cursor-ne-resize"
              onMouseDown={(e) => startResize(e, el, "tr")}
            />
            <div
              className="absolute w-2 h-2 bg-white border border-blue-700 rounded-full -top-1 -left-1 cursor-nw-resize"
              onMouseDown={(e) => startResize(e, el, "tl")}
            />
          </>
        )}
      </div>
    );
  }

  // 🔹 Render content
  function renderContent(el) {
    const isHovered = hoveredId === el.id;

    switch (el.type) {
      case "button":
        return (
          <button
            style={{
              pointerEvents: "none",
              width: "100%",
              height: "100%",
              backgroundColor:
                el.style.enableHover && isHovered
                  ? el.style.hoverBackgroundColor
                  : el.style.backgroundColor,
              color:
                el.style.enableHover && isHovered
                  ? el.style.hoverColor
                  : el.style.color,
              fontSize: el.style.fontSize,
              fontWeight: el.style.fontWeight,
              fontStyle: el.style.fontStyle,
              fontFamily: el.style.fontFamily,
              borderRadius: el.style.borderRadius,
              border: `${el.style.borderWidth}px solid ${el.style.borderColor}`,
              boxShadow: el.style.boxShadow,
              transition: "all 0.2s ease",
            }}
          >
            {el.text}
          </button>
        );

      case "text":
        return (
          <div
            style={{
              pointerEvents: "none",
              width: "100%",
              height: "100%",
              color:
                el.style.enableHover && isHovered
                  ? el.style.hoverColor
                  : el.style.color,
              fontSize: el.style.fontSize,
              fontWeight: el.style.fontWeight,
              fontStyle: el.style.fontStyle,
              fontFamily: el.style.fontFamily,
              transition: "all 0.2s ease",
            }}
          >
            {el.text}
          </div>
        );

      case "rectangle":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor:
                el.style.enableHover && isHovered
                  ? el.style.hoverBackgroundColor
                  : el.style.backgroundColor,
              borderRadius: el.style.borderRadius,
              border: `${el.style.borderWidth}px solid ${el.style.borderColor}`,
              boxShadow: el.style.boxShadow,
              transition: "all 0.2s ease",
            }}
          />
        );

      case "circle":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: el.style.backgroundColor,
              borderRadius: "50%",
              border: `${el.style.borderWidth}px solid ${el.style.borderColor}`,
              boxShadow: el.style.boxShadow,
            }}
          />
        );
      case "container":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px dashed #aaa",
            }}
          >
            Container
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div
      id="canvas"
      className="relative w-full h-full relative bg-gray-100"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedIds([]);
        }
      }}
      onMouseMove={(e) => {
        const canvasRect = e.currentTarget.getBoundingClientRect();

        // RESIZE
        if (resizingId && resizeStart) {
          const dx = e.clientX - resizeStart.startX;
          const dy = e.clientY - resizeStart.startY;

          const updated = elements.map((item) => {
            if (item.id !== resizingId) return item;

            let newWidth = resizeStart.startWidth;
            let newHeight = resizeStart.startHeight;
            let newX = resizeStart.startXPos;
            let newY = resizeStart.startYPos;

            switch (resizeStart.direction) {
              case "br":
                newWidth += dx;
                newHeight += dy;
                break;
              case "bl":
                newWidth -= dx;
                newHeight += dy;
                newX += dx;
                break;
              case "tr":
                newWidth += dx;
                newHeight -= dy;
                newY += dy;
                break;
              case "tl":
                newWidth -= dx;
                newHeight -= dy;
                newX += dx;
                newY += dy;
                break;
            }

            return {
              ...item,
              x: newX,
              y: newY,
              width: Math.max(50, newWidth),
              height: Math.max(30, newHeight),
            };
          });

          setElements(updated, { saveHistory: false });
          return;
        }

        // DRAG
        if (!dragStart) return;

        const dx = Math.abs(e.clientX - dragStart.startX);
        const dy = Math.abs(e.clientY - dragStart.startY);

        if (dx > 5 || dy > 5) {
          setDraggingId(dragStart.id);

          let newX = e.clientX - canvasRect.left - dragStart.offsetX;
          let newY = e.clientY - canvasRect.top - dragStart.offsetY;

          let showVertical = null;
          let showHorizontal = null;

          const SNAP_THRESHOLD = 6;

          const canvasCenterX = canvasRect.width / 2;
          const canvasCenterY = canvasRect.height / 2;

          const currentEl = elements.find((el) => el.id === dragStart.id);

          const elementCenterX = newX + currentEl.width / 2;
          const elementCenterY = newY + currentEl.height / 2;

          // horizontal center snap
          if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
            newX = canvasCenterX - currentEl.width / 2;
            showVertical = canvasCenterX;
          }

          // vertical center snap
          if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
            newY = canvasCenterY - currentEl.height / 2;
            showHorizontal = canvasCenterY;
          }

          const ELEMENT_SNAP_THRESHOLD = 6;

          // 🧠 Track best snap (ONLY ONE)
          let closestXDiff = Infinity;
          let closestXSnap = null;
          let closestXGuide = null;

          let closestYDiff = Infinity;
          let closestYSnap = null;
          let closestYGuide = null;

          elements.forEach((other) => {
            if (other.id === dragStart.id) return;

            const current = currentEl;

            // --- X AXIS ---
            const currentLeft = newX;
            const currentRight = newX + current.width;
            const currentCenterX = newX + current.width / 2;

            const otherLeft = other.x;
            const otherRight = other.x + other.width;
            const otherCenterX = other.x + other.width / 2;

            // LEFT EDGE
            let diff = Math.abs(currentLeft - otherLeft);
            if (diff < ELEMENT_SNAP_THRESHOLD && diff < closestXDiff) {
              closestXDiff = diff;
              closestXSnap = otherLeft;
              closestXGuide = otherLeft;
            }

            // RIGHT EDGE
            diff = Math.abs(currentRight - otherRight);
            if (diff < ELEMENT_SNAP_THRESHOLD && diff < closestXDiff) {
              closestXDiff = diff;
              closestXSnap = otherRight - current.width;
              closestXGuide = otherRight;
            }

            // CENTER (STRICT 1px)
            diff = Math.abs(currentCenterX - otherCenterX);
            if (diff < 1 && diff < closestXDiff) {
              closestXDiff = diff;
              closestXSnap = otherCenterX - current.width / 2;
              closestXGuide = otherCenterX;
            }

            // --- Y AXIS ---
            const currentTop = newY;
            const currentBottom = newY + current.height;
            const currentCenterY = newY + current.height / 2;

            const otherTop = other.y;
            const otherBottom = other.y + other.height;
            const otherCenterY = other.y + other.height / 2;

            // TOP
            diff = Math.abs(currentTop - otherTop);
            if (diff < ELEMENT_SNAP_THRESHOLD && diff < closestYDiff) {
              closestYDiff = diff;
              closestYSnap = otherTop;
              closestYGuide = otherTop;
            }

            // BOTTOM
            diff = Math.abs(currentBottom - otherBottom);
            if (diff < ELEMENT_SNAP_THRESHOLD && diff < closestYDiff) {
              closestYDiff = diff;
              closestYSnap = otherBottom - current.height;
              closestYGuide = otherBottom;
            }

            // CENTER (STRICT 1px)
            diff = Math.abs(currentCenterY - otherCenterY);
            if (diff < 1 && diff < closestYDiff) {
              closestYDiff = diff;
              closestYSnap = otherCenterY - current.height / 2;
              closestYGuide = otherCenterY;
            }
          });

          // ✅ APPLY SNAP ONCE (IMPORTANT)
          if (closestXSnap !== null) {
            newX = closestXSnap;
            showVertical = closestXGuide;
          }

          if (closestYSnap !== null) {
            newY = closestYSnap;
            showHorizontal = closestYGuide;
          }

          let spacingGuides = [];

          elements.forEach((other) => {
            if (other.id === dragStart.id) return;

            // HORIZONTAL DISTANCE
            const horizontalGap =
              other.x > newX
                ? other.x - (newX + currentEl.width)
                : newX - (other.x + other.width);

            if (horizontalGap > 0 && horizontalGap < 100) {
              spacingGuides.push({
                type: "horizontal",
                x1: Math.min(newX + currentEl.width, other.x + other.width),
                x2: Math.max(newX, other.x),
                y: newY + currentEl.height / 2,
                distance: Math.round(horizontalGap),
              });
            }

            // VERTICAL DISTANCE
            const verticalGap =
              other.y > newY
                ? other.y - (newY + currentEl.height)
                : newY - (other.y + other.height);

            if (verticalGap > 0 && verticalGap < 100) {
              spacingGuides.push({
                type: "vertical",
                y1: Math.min(newY + currentEl.height, other.y + other.height),
                y2: Math.max(newY, other.y),
                x: newX + currentEl.width / 2,
                distance: Math.round(verticalGap),
              });
            }
          });

          // update guide lines
          setGuides({
            vertical: showVertical,
            horizontal: showHorizontal,
          });

          setSpacingGuides(spacingGuides);

          const updated = elements.map((el) => {
            if (el.id === dragStart.id) {
              return { ...el, x: newX, y: newY };
            }
            return el;
          });

          setElements(updated, { saveHistory: false });
        }
      }}
      onMouseUp={() => {
        document.body.style.userSelect = "auto";

        setDraggingId(null);
        setDragStart(null);
        setResizingId(null);
        setResizeStart(null);
        setGuides({ vertical: false, horizontal: false });
        setSpacingGuides([]);
        if (dragStart || resizingId) {
          setElements(elements);
        }
      }}
      onMouseLeave={() => {
        document.body.style.userSelect = "auto";

        setDraggingId(null);
        setDragStart(null);
        setResizingId(null);
        setResizeStart(null);
      }}
    >
      {guides.vertical !== null && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-gray-300 pointer-events-none"
          style={{ left: guides.vertical }}
        />
      )}
      {guides.horizontal !== null && (
        <div
          className="absolute left-0 right-0 h-[1px] bg-gray-300 pointer-events-none"
          style={{ top: guides.horizontal }}
        />
      )}
      {spacingGuides.map((guide, i) => (
        <div key={i}>
          {/* HORIZONTAL */}
          {guide.type === "horizontal" && (
            <>
              <div
                className="absolute h-[1px] bg-green-300 pointer-events-none"
                style={{
                  left: guide.x1,
                  width: guide.x2 - guide.x1,
                  top: guide.y,
                }}
              />
              <div
                className="absolute text-[9px] text-gray-600 px-1 rounded pointer-events-none"
                style={{
                  left: guide.x1 + (guide.x2 - guide.x1) / 2,
                  top: guide.y - 12,
                  transform: "translateX(-50%)",
                }}
              >
                {guide.distance}px
              </div>
            </>
          )}

          {/* VERTICAL */}
          {guide.type === "vertical" && (
            <>
              <div
                className="absolute w-[1px] bg-green-400 pointer-events-none"
                style={{
                  top: guide.y1,
                  height: guide.y2 - guide.y1,
                  left: guide.x,
                }}
              />
              <div
                className="absolute text-[10px] text-gray-600 px-1 rounded pointer-events-none"
                style={{
                  top: guide.y1 + (guide.y2 - guide.y1) / 2,
                  left: guide.x + 4,
                }}
              >
                {guide.distance}px
              </div>
            </>
          )}
        </div>
      ))}
      {elements.map((el) => (
        <ElementWrapper key={el.id} el={el} />
      ))}
    </div>
  );
}

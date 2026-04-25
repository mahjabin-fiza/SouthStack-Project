// /src/builder/Renderer.jsx

import React from "react";

export default function Render({ uiTree, dispatch }) {
  return (
    <div
      style={{
        position: "relative",
        height: "500px",
        border: "1px solid gray",
      }}
    >
      {uiTree.map((el) => (
        <div
          key={el.id}
          style={{
            position: "absolute",
            left: el.x,
            top: el.y,
            padding: "10px",
            background: "lightblue",
            cursor: "move",
          }}
          onClick={() => {
            // simple move demo
            dispatch({
              type: "MOVE",
              id: el.id,
              x: el.x + 20,
              y: el.y + 20,
            });
          }}
        >
          {el.text || el.type}

          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "DELETE", id: el.id });
            }}
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  );
}

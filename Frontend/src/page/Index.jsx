import React from "react";
import { Link } from "react-router-dom";

import CodeLlm from "./CodeLlm";

function Index() {
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="w-100 p-6 text-center">
          <h1 className="text-5xl font-bold mb-6">SouthStack</h1>
          <div className="flex justify-between">
            <Link to="/CodeLlm">
              <button className="px-8 py-3 text-xl bg-gray-800 text-white rounded hover:bg-gray-500 transition ease-in-out duration-200 hover:scale-105">
                Code Maker
              </button>
            </Link>
            <Link to="/UiBuilder">
              <button className="px-8 py-3 text-xl bg-gray-800 text-white rounded hover:bg-gray-500 transition ease-in-out duration-200 hover:scale-105">
                UI builder
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Index;

import React from "react";

// @ts-ignore
const CustomContextMenu = ({ position, onOptionSelected }) => {
  // @ts-ignore
  const handleOptionSelected = (option) => () => onOptionSelected(option);

  return (
    <div
      className="menu"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <ul>
        <li onClick={handleOptionSelected("option1")}>Option1</li>
        <li onClick={handleOptionSelected("option2")}>Option2</li>
      </ul>
    </div>
  );
};

export default CustomContextMenu;

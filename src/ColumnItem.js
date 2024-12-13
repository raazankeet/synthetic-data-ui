import React, { useState } from "react";

const ColumnItem = ({ column, lookupData }) => {
  const [generator, setGenerator] = useState("");  // State to store selected generator

  // Handler for selecting a generator
  const handleGeneratorChange = (event) => {
    setGenerator(event.target.value);
  };

  return (
    <tr>
      <td>{column.COLUMN_NAME}</td>
      <td>{column.DATA_TYPE}</td>
      <td>
        <select
          value={generator}
          onChange={handleGeneratorChange}
        >
          <option value="">Select Generator</option>
          {lookupData && lookupData.map((gen, index) => (
            <option key={index} value={gen}>{gen}</option>
          ))}
        </select>
      </td>
    </tr>
  );
};

export default ColumnItem;

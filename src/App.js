import React, { useState } from "react";
import "./App.css";

function App() {
  const [tableName, setTableName] = useState(""); // Table name input
  const [metadata, setMetadata] = useState(null); // Metadata response from API
  const [selectedGenerators, setSelectedGenerators] = useState({}); // Track selected generators for each column
  const [generatorsList, setGeneratorsList] = useState([
    "RandomGenerator",
    "SequentialGenerator",
    "CustomGenerator",
  ]);

  // Handle fetching metadata
  const handleFetchMetadata = () => {
    if (tableName.trim() === "") {
      alert("Please enter a table name!");
      return;
    }

    fetch(`http://127.0.0.1:5000/get_metadata?table_name=${tableName}`)
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);
      })
      .catch((error) => console.error("Error fetching metadata:", error));
  };

  // Utility: Check if a generator is invalid for a given column
  const checkIfGeneratorIsInvalid = (tableName, columnName, generator) => {
    const constraints = metadata?.constraint_details || [];

    for (const constraint of constraints) {
      if (constraint.ChildTable === tableName && constraint.ChildColumn === columnName) {
        // This column is a child -> Ensure it matches the referenced column's generator
        const referencedGenerator =
          selectedGenerators[constraint.ReferencedTable]?.[constraint.ReferencedColumn];
        if (referencedGenerator && referencedGenerator !== generator) {
          return true; // Invalid generator
        }
      }

      if (constraint.ReferencedTable === tableName && constraint.ReferencedColumn === columnName) {
        // This column is a parent -> Ensure all child columns match
        const childGenerator =
          selectedGenerators[constraint.ChildTable]?.[constraint.ChildColumn];
        if (childGenerator && childGenerator !== generator) {
          return true; // Invalid generator
        }
      }
    }
    return false; // Valid generator
  };

  // Handle generator change for a column
  const handleGeneratorChange = (tableName, columnName, generator) => {
    const constraints = metadata?.constraint_details || [];

    // Check for FK constraints and enforce generator consistency
    for (const constraint of constraints) {
      if (constraint.ChildTable === tableName && constraint.ChildColumn === columnName) {
        const referencedGenerator =
          selectedGenerators[constraint.ReferencedTable]?.[constraint.ReferencedColumn];

        if (referencedGenerator && referencedGenerator !== generator) {
          alert(
            `Generator mismatch! ${columnName} in ${tableName} must use the same generator as ${constraint.ReferencedTable}.${constraint.ReferencedColumn}.`
          );
          return;
        }
      }

      if (constraint.ReferencedTable === tableName && constraint.ReferencedColumn === columnName) {
        const childGenerator =
          selectedGenerators[constraint.ChildTable]?.[constraint.ChildColumn];

        if (childGenerator && childGenerator !== generator) {
          alert(
            `Generator mismatch! ${columnName} in ${tableName} must use the same generator as ${constraint.ChildTable}.${constraint.ChildColumn}.`
          );
          return;
        }
      }
    }

    // Update the selected generator for the current column
    setSelectedGenerators((prevState) => ({
      ...prevState,
      [tableName]: {
        ...prevState[tableName],
        [columnName]: generator,
      },
    }));

    // Propagate the change to related columns (if any)
    constraints.forEach((constraint) => {
      if (constraint.ChildTable === tableName && constraint.ChildColumn === columnName) {
        setSelectedGenerators((prevState) => ({
          ...prevState,
          [constraint.ReferencedTable]: {
            ...prevState[constraint.ReferencedTable],
            [constraint.ReferencedColumn]: generator,
          },
        }));
      }

      if (constraint.ReferencedTable === tableName && constraint.ReferencedColumn === columnName) {
        setSelectedGenerators((prevState) => ({
          ...prevState,
          [constraint.ChildTable]: {
            ...prevState[constraint.ChildTable],
            [constraint.ChildColumn]: generator,
          },
        }));
      }
    });
  };

  // Render the table UI with dropdowns for generator selection
  const renderTable = (tableName, tableData) => {
    return (
      <div key={tableName} className="table-container">
        <h2>{tableName.charAt(0).toUpperCase() + tableName.slice(1)}</h2>
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Generator</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((column) => (
              <tr key={column.COLUMN_NAME}>
                <td>{column.COLUMN_NAME}</td>
                <td>{column.DATA_TYPE}</td>
                <td>
                  <select
                    value={selectedGenerators[tableName]?.[column.COLUMN_NAME] || ""}
                    onChange={(e) =>
                      handleGeneratorChange(
                        tableName,
                        column.COLUMN_NAME,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select Generator</option>
                    {generatorsList.map((gen) => {
                      const isDisabled = checkIfGeneratorIsInvalid(
                        tableName,
                        column.COLUMN_NAME,
                        gen
                      );
                      return (
                        <option key={gen} value={gen} disabled={isDisabled}>
                          {gen}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Metadata Table Viewer</h1>

      {/* Input Field for Table Name */}
      <div className="input-container">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter table name"
        />
        <button onClick={handleFetchMetadata}>Fetch Metadata</button>
      </div>

      {metadata ? (
        <div>
          <h3>Parent Tables Metadata:</h3>
          {Object.keys(metadata.parent_tables_metadata).length > 0 ? (
            Object.keys(metadata.parent_tables_metadata).map((tableName) =>
              renderTable(
                tableName,
                metadata.parent_tables_metadata[tableName]
              )
            )
          ) : (
            <p>No parent tables available.</p>
          )}
          <h3>Central Table Metadata:</h3>
          {Object.keys(metadata.central_table_metadata).map((tableName) =>
            renderTable(tableName, metadata.central_table_metadata[tableName])
          )}
          <h3>Child Tables Metadata:</h3>
          {Object.keys(metadata.child_tables_metadata).map((tableName) =>
            renderTable(tableName, metadata.child_tables_metadata[tableName])
          )}
        </div>
      ) : (
        <p>Loading table data...</p>
      )}
    </div>
  );
}

export default App;

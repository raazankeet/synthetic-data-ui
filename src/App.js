import React, { useState } from "react";
import { FaKey } from "react-icons/fa"; // Import the key icon from react-icons
import { FaCircleChevronUp ,FaCircleChevronDown } from "react-icons/fa6";
import { TfiKey } from "react-icons/tfi";

import "./App.css";

function App() {
  const [tableName, setTableName] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [selectedGenerators, setSelectedGenerators] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [generateDataState, setGenerateDataState] = useState({});
  const [recordCounts, setRecordCounts] = useState({});
  const [truncateTableState, setTruncateTableState] = useState({}); // New state for truncate table

  // Fetch metadata from API
  const handleFetchMetadata = () => {
    if (tableName.trim() === "") {
      alert("Please enter a table name!");
      return;
    }

    fetch(`http://127.0.0.1:5000/get_metadata?table_name=${tableName}`)
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);

        setExpandedTables({
          central: true,
          ...data.central_table_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
          ...data.parent_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
          ...data.child_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
        });

        setGenerateDataState({
          ...data.central_table_metadata.reduce((acc, table) => {
            acc[table.table_name] = true;
            return acc;
          }, {}),
          ...data.parent_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
          ...data.child_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
        });

        setRecordCounts({
          ...data.central_table_metadata.reduce((acc, table) => {
            acc[table.table_name] = 10;
            return acc;
          }, {}),
          ...data.parent_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = 10;
            return acc;
          }, {}),
          ...data.child_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = 10;
            return acc;
          }, {}),
        });

        setTruncateTableState({
          ...data.central_table_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
          ...data.parent_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
          ...data.child_tables_metadata.reduce((acc, table) => {
            acc[table.table_name] = false;
            return acc;
          }, {}),
        });
      })
      .catch((error) => console.error("Error fetching metadata:", error));
  };

  const toggleTable = (tableName) => {
    setExpandedTables((prevState) => ({
      ...prevState,
      [tableName]: !prevState[tableName],
    }));
  };

  const handleGeneratorChange = (tableName, columnName, generator) => {
    setSelectedGenerators((prevState) => ({
      ...prevState,
      [tableName]: {
        ...prevState[tableName],
        [columnName]: generator,
      },
    }));
  };

  const handleGenerateDataToggle = (tableName) => {
    setGenerateDataState((prevState) => {
      const newState = { ...prevState, [tableName]: !prevState[tableName] };
      if (!newState[tableName]) {
        setSelectedGenerators((prevGenerators) => ({
          ...prevGenerators,
          [tableName]: {},
        }));
      }
      return newState;
    });
  };

  const handleRecordCountChange = (tableName, value) => {
    setRecordCounts((prevState) => ({
      ...prevState,
      [tableName]: value,
    }));
  };

  const handleTruncateTableToggle = (tableName) => {
    setTruncateTableState((prevState) => ({
      ...prevState,
      [tableName]: !prevState[tableName],
    }));
  };

  const renderTable = (tableName, tableData) => {
    const isGenerateDataEnabled = generateDataState[tableName];
  
    return (
      <div key={tableName} className="table-container">
        <div className="table-header">
          <h2>{capitalizeFirstLetter(tableName)}</h2>
          <div className="header-controls">
            <div className="total-rows-container">
              <span className="current-rows-label">Current Rows:</span>
              <div className="current-rows-badge">{tableData.total_rows || 0}</div>
            </div>
            <div className="records-count-container">
              <span>Records to Generate:</span>
              <input
                type="number"
                value={recordCounts[tableName] || 10}
                onChange={(e) => handleRecordCountChange(tableName, e.target.value)}
                disabled={!isGenerateDataEnabled}
              />
            </div>
            <div className="truncate-table-container">
              <label>
                <input
                  type="checkbox"
                  className="truncate-checkbox"
                  checked={truncateTableState[tableName] || false}
                  onChange={() => handleTruncateTableToggle(tableName)}
                />
                Truncate Load
              </label>
            </div>
            <span className="generate-data-text">Generate Data</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isGenerateDataEnabled || false}
                onChange={() => handleGenerateDataToggle(tableName)}
              />
              <span className="slider round"></span>
            </label>
            <button
                  className="collapse-button"
                  onClick={() => toggleTable(tableName)}
            >
  {expandedTables[tableName] ? (
    <FaCircleChevronUp size={20} />
  ) : (
    <FaCircleChevronDown size={20} />
  )}
</button>
          </div>
        </div>
        <div
          className={`table-content ${expandedTables[tableName] ? "expanded" : "collapsed"}`}
        >
          <table>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
                <th>Max Length</th>
                <th>Generator</th>
              </tr>
            </thead>
            <tbody>
  {tableData.columns.map((column) => (
    <tr key={column.COLUMN_NAME}>
      <td style={{ position: "relative" }}>
        {/* Badges container */}
        <div className="badges-container">
          {column.PRIMARY_KEY && (
            <span className="badge primary-key-badge">
              <TfiKey  size={17}/>
            </span>
          )}
          {column.NULLABLE === false && (
            <span className="badge nullable-badge">NOT NULL</span>
          )}
        </div>
        {/* Column Name */}
        <span>{column.COLUMN_NAME}</span>
      </td>
      <td>{column.DATA_TYPE}</td>
      <td>{column.CHARACTER_MAXIMUM_LENGTH || "N/A"}</td>
      <td>
        <select
          disabled={!isGenerateDataEnabled}
          value={selectedGenerators[tableName]?.[column.COLUMN_NAME] || ""}
          onChange={(e) =>
            handleGeneratorChange(tableName, column.COLUMN_NAME, e.target.value)
          }
        >
          <option value="">Select Generator</option>
          {/* Add other generator options here */}
        </select>
      </td>
    </tr>
  ))}
</tbody>


          </table>
        </div>
      </div>
    );
  };
  
  

  const generateJsonOutput = () => {
    const output = {
      central_table_metadata: {},
      parent_tables_metadata: {},
      child_tables_metadata: {},
      constraints: [],
    };

    const processTable = (tableType, tableMetadata) => {
      tableMetadata.forEach((table) => {
        const tableName = table.table_name;
        const tableData = {
          generate_data: generateDataState[tableName] || false,
          truncate_table: truncateTableState[tableName] || false,
          record_count: recordCounts[tableName] || 10,
          columns: table.columns.map((column) => ({
            COLUMN_NAME: column.COLUMN_NAME,
            DATA_TYPE: column.DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH: column.CHARACTER_MAXIMUM_LENGTH,
            selected_generator: selectedGenerators[tableName]?.[column.COLUMN_NAME] || "",
          })),
        };
        output[tableType][tableName] = tableData;
      });
    };

    processTable("central_table_metadata", metadata.central_table_metadata);
    processTable("parent_tables_metadata", metadata.parent_tables_metadata);
    processTable("child_tables_metadata", metadata.child_tables_metadata);

    if (metadata.constraint_details) {
      output.constraints = metadata.constraint_details.map((constraint) => ({
        child_table: constraint.ChildTable,
        child_column: constraint.ChildColumn,
        parent_table: constraint.ReferencedTable,
        parent_column: constraint.ReferencedColumn,
        constraint_name: constraint.ConstraintName,
      }));
    }

    console.log("Generated JSON Output:", JSON.stringify(output, null, 2));
    return JSON.stringify(output, null, 2);
  };

  return (
    <div className="App">
      <h1>Synthetic Data Generator</h1>
      <div className="input-container">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter table name"
        />
        <button onClick={handleFetchMetadata}>Fetch Metadata</button>
        <button onClick={generateJsonOutput}>Generate JSON</button>
      </div>
      {metadata && (
        <div>
          {metadata.central_table_metadata.length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Central Table</h3>
                {metadata.central_table_metadata.map((table) =>
                  renderTable(table.table_name, table)
                )}
              </div>
            </div>
          )}
          {metadata.parent_tables_metadata.length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Parent Tables</h3>
                {metadata.parent_tables_metadata.map((table) =>
                  renderTable(table.table_name, table)
                )}
              </div>
            </div>
          )}
          {metadata.child_tables_metadata.length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Child Tables</h3>
                {metadata.child_tables_metadata.map((table) =>
                  renderTable(table.table_name, table)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default App;

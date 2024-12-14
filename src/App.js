import React, { useState } from "react";
import "./App.css";

function App() {
  const [tableName, setTableName] = useState(""); // Table name input
  const [metadata, setMetadata] = useState(null); // Metadata response from API
  const [selectedGenerators, setSelectedGenerators] = useState({}); // Track selected generators
  const [expandedTables, setExpandedTables] = useState({}); // Track table collapsible state
  const [updatePermissions, setUpdatePermissions] = useState({}); // Track update permissions for each table

  const handleFetchMetadata = () => {
    if (tableName.trim() === "") {
      alert("Please enter a table name!");
      return;
    }

    fetch(`http://127.0.0.1:5000/get_metadata?table_name=${tableName}`)
      .then((response) => response.json())
      .then((data) => {
        setMetadata(data);
        // Initialize all tables as collapsed except central
        setExpandedTables({
          central: true,
          ...Object.keys(data.parent_tables_metadata).reduce((acc, table) => {
            acc[table] = false;
            return acc;
          }, {}),
          ...Object.keys(data.child_tables_metadata).reduce((acc, table) => {
            acc[table] = false;
            return acc;
          }, {}),
        });

        // Initialize update permissions (disabled by default for all tables)
        setUpdatePermissions({
          ...Object.keys(data.parent_tables_metadata).reduce((acc, table) => {
            acc[table] = false;
            return acc;
          }, {}),
          ...Object.keys(data.central_table_metadata).reduce((acc, table) => {
            acc[table] = true; // Central table editable by default
            return acc;
          }, {}),
          ...Object.keys(data.child_tables_metadata).reduce((acc, table) => {
            acc[table] = false;
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

  const toggleUpdatePermission = (tableName) => {
    setUpdatePermissions((prevState) => ({
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

  const renderTable = (tableName, tableData) => {
    const isEditable = updatePermissions[tableName];

    return (
      <div key={tableName} className="table-container">
        <div className="table-header">
        <h2>{capitalizeFirstLetter(tableName)}</h2>
          <div className="header-controls">
            {/* Constant Text "Generate Data" */}
            <span className="generate-data-text">Generate Data</span>

            {/* Toggle slider */}
            <label className="switch">
              <input
                type="checkbox"
                checked={updatePermissions[tableName]}
                onChange={() => toggleUpdatePermission(tableName)}
              />
              <span className="slider round"></span>
            </label>

            {/* Expansion Arrow */}
            <button
              className="collapse-button"
              onClick={() => toggleTable(tableName)}
            >
              {expandedTables[tableName] ? "▲" : "▼"}
            </button>
          </div>
        </div>
        <div
          className={`table-content ${
            expandedTables[tableName] ? "expanded" : "collapsed"
          }`}
        >
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
  disabled={!isEditable}
  value={selectedGenerators[tableName]?.[column.COLUMN_NAME] || ""}
  onChange={(e) =>
    handleGeneratorChange(tableName, column.COLUMN_NAME, e.target.value)
  }
  className={expandedTables[tableName] ? "select-visible" : ""}
>
  <option value="">Select Generator</option>
  {[
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "fullName", label: "Full Name" },
    { value: "phoneNumber", label: "Phone Number" },
    { value: "city", label: "City" },
    { value: "state", label: "State" },
    { value: "zipcode", label: "Zip Code" },
    { value: "streetAddress", label: "Street Address" },
    { value: "fullAddress", label: "Full Address" },
    { value: "ssn", label: "SSN" },
    { value: "emailID", label: "Email" },
    { value: "bookName", label: "Book Name" },
    { value: "bookAuthor", label: "Book Author" },
    { value: "weather", label: "Weather" },
    { value: "temperature", label: "Temperature" },
    { value: "creditCardNumber", label: "Credit Card Number" },
    { value: "randomNumber", label: "Random Number" },
    { value: "artistName", label: "Artist Name" },
    { value: "regex", label: "Regular Expression (Regex)" },
    { value: "quotes", label: "Movie Quotes" },
    { value: "sentences", label: "Sentences" },
    { value: "ancientGod", label: "Ancient God" },
    { value: "animalName", label: "Animal Name" },
    { value: "productName", label: "Product Name" },
    { value: "catchPhrase", label: "Catchphrase" },
    { value: "hospitalName", label: "Hospital Name" },
    { value: "diseaseName", label: "Disease Name" },
    { value: "medicineName", label: "Medicine Name" },
    { value: "sha256", label: "SHA 256" },
    { value: "futureDate", label: "Future Date" },
    { value: "pastDate", label: "Past Date" },
  ].map((gen) => (
    <option key={gen.value} value={gen.value}>
      {gen.label}
    </option>
  ))}
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
      </div>

      {metadata && (
        <div>
          {/* Central Table Metadata Section */}
          {Object.keys(metadata.central_table_metadata).length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Central Table Metadata:</h3>
                {Object.keys(metadata.central_table_metadata).map((tableName) =>
                  renderTable(tableName, metadata.central_table_metadata[tableName])
                )}
              </div>
            </div>
          )}

          {/* Parent Tables Metadata Section */}
          {Object.keys(metadata.parent_tables_metadata).length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Parent Tables Metadata:</h3>
                {Object.keys(metadata.parent_tables_metadata).map((tableName) =>
                  renderTable(tableName, metadata.parent_tables_metadata[tableName])
                )}
              </div>
            </div>
          )}

          {/* Child Tables Metadata Section */}
          {Object.keys(metadata.child_tables_metadata).length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Child Tables Metadata:</h3>
                {Object.keys(metadata.child_tables_metadata).map((tableName) =>
                  renderTable(tableName, metadata.child_tables_metadata[tableName])
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

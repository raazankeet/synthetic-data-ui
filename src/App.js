import React, { useState } from "react";
import "./App.css";

function App() {
  const [tableName, setTableName] = useState(""); // Table name input
  const [metadata, setMetadata] = useState(null); // Metadata response from API
  const [selectedGenerators, setSelectedGenerators] = useState({}); // Track selected generators
  const [expandedTables, setExpandedTables] = useState({}); // Track table collapsible state
  const [generateDataState, setGenerateDataState] = useState({}); // Track generate data state for each table
  const [recordCounts, setRecordCounts] = useState({}); // Track record counts for each table

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

        // Initialize tables and set their states
        setExpandedTables({
          central: true, // Always expanded
          ...Object.keys(data.parent_tables_metadata).reduce((acc, table) => {
            acc[table] = false; // Parent tables collapsed by default
            return acc;
          }, {}),
          ...Object.keys(data.child_tables_metadata).reduce((acc, table) => {
            acc[table] = false; // Child tables collapsed by default
            return acc;
          }, {}),
        });

        // Initialize generate data state: All tables start as disabled except central
        setGenerateDataState({
          ...Object.keys(data.parent_tables_metadata).reduce((acc, table) => {
            acc[table] = false; // Default: disabled
            return acc;
          }, {}),
          ...Object.keys(data.central_table_metadata).reduce((acc, table) => {
            acc[table] = true; // Central table is enabled
            return acc;
          }, {}),
          ...Object.keys(data.child_tables_metadata).reduce((acc, table) => {
            acc[table] = false; // Default: disabled
            return acc;
          }, {}),
        });

        // Initialize record counts: Default 10 records for all tables
        setRecordCounts({
          ...Object.keys(data.parent_tables_metadata).reduce((acc, table) => {
            acc[table] = 10; // Default: 10 records
            return acc;
          }, {}),
          ...Object.keys(data.central_table_metadata).reduce((acc, table) => {
            acc[table] = 10; // Default: 10 records
            return acc;
          }, {}),
          ...Object.keys(data.child_tables_metadata).reduce((acc, table) => {
            acc[table] = 10; // Default: 10 records
            return acc;
          }, {}),
        });
      })
      .catch((error) => console.error("Error fetching metadata:", error));
  };

  // Toggle the collapse/expand state of a table
  const toggleTable = (tableName) => {
    setExpandedTables((prevState) => ({
      ...prevState,
      [tableName]: !prevState[tableName],
    }));
  };

  // Handle change in selected generator for a specific table and column
  const handleGeneratorChange = (tableName, columnName, generator) => {
    setSelectedGenerators((prevState) => ({
      ...prevState,
      [tableName]: {
        ...prevState[tableName],
        [columnName]: generator,
      },
    }));
  };

  // Toggle the "Generate Data" switch for a specific table
  const handleGenerateDataToggle = (tableName) => {
    setGenerateDataState((prevState) => {
      const newState = { ...prevState, [tableName]: !prevState[tableName] };
      // If generating data is disabled, clear the selected generators for that table
      if (!newState[tableName]) {
        setSelectedGenerators((prevGenerators) => ({
          ...prevGenerators,
          [tableName]: {}, // Clear generators for that table
        }));
      }
      return newState;
    });
  };

  // Handle change in the number of records for a specific table
  const handleRecordCountChange = (tableName, value) => {
    // Ensure the value is a non-negative number
    const newValue = Math.max(0, parseInt(value, 10)); // If value is less than 0, it will set to 0

    setRecordCounts((prevState) => ({
      ...prevState,
      [tableName]: newValue,
    }));
  };

  // Render the table with columns, generators, and other options
  const renderTable = (tableName, tableData) => {
    const isGenerateDataEnabled = generateDataState[tableName]; // Track whether generate data is enabled for this table

    return (
      <div key={tableName} className="table-container">
        <div className="table-header">
          <h2>{capitalizeFirstLetter(tableName)}</h2>
          <div className="header-controls">
            {/* Number of Records Input */}
            <div className="records-count-container">
              <span>Records to generate</span>
              <input
                type="number"
                value={recordCounts[tableName] || 10}
                onChange={(e) => handleRecordCountChange(tableName, e.target.value)}
                disabled={!isGenerateDataEnabled} // Disable based on table's generate data state
              />
            </div>

            {/* Generate Data Toggle */}
            <span className="generate-data-text">Generate Data</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isGenerateDataEnabled || false}
                onChange={() => handleGenerateDataToggle(tableName)} // Handle toggle for specific table
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
                      disabled={!isGenerateDataEnabled} // Disable if Generate Data is off
                      value={selectedGenerators[tableName]?.[column.COLUMN_NAME] || ""}
                      onChange={(e) =>
                        handleGeneratorChange(tableName, column.COLUMN_NAME, e.target.value)
                      }
                    >
                      <option value="">Select Generator</option>
                      <option value="firstName">First Name</option>
                      <option value="lastName">Last Name</option>
                      <option value="fullName">Full Name</option>
                      <option value="phoneNumber">Phone Number</option>
                      <option value="city">City</option>
                      <option value="state">State</option>
                      <option value="zipcode">Zip Code</option>
                      <option value="streetAddress">Street Address</option>
                      <option value="fullAddress">Full Address</option>
                      <option value="ssn">SSN</option>
                      <option value="emailID">Email</option>
                      <option value="bookName">Book Name</option>
                      <option value="bookAuthor">Book Author</option>
                      <option value="weather">Weather</option>
                      <option value="temperature">Temperature</option>
                      <option value="creditCardNumber">Credit Card Number</option>
                      <option value="randomNumber">Random Number</option>
                      <option value="artistName">Artist Name</option>
                      <option value="regex">Regular Expression (Regex)</option>
                      <option value="quotes">Movie Quotes</option>
                      <option value="sentences">Sentences</option>
                      <option value="ancientGod">Ancient God</option>
                      <option value="animalName">Animal Name</option>
                      <option value="productName">Product Name</option>
                      <option value="catchPhrase">Catchphrase</option>
                      <option value="hospitalName">Hospital Name</option>
                      <option value="diseaseName">Disease Name</option>
                      <option value="medicineName">Medicine Name</option>
                      <option value="sha256">SHA 256</option>
                      <option value="futureDate">Future Date</option>
                      <option value="pastDate">Past Date</option>
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

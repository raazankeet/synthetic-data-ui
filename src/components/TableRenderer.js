// TableRenderer.js
import React from "react";
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import { TfiKey } from "react-icons/tfi";
import { MaterialReactTable } from 'material-react-table';

const TableRenderer = ({
  tableName,
  tableData,
  generateDataState,
  selectedGenerators,
  recordCounts,
  truncateTableState,
  expandedTables,
  handleGenerateDataToggle,
  handleGeneratorChange,
  handleRecordCountChange,
  handleTruncateTableToggle,
  toggleTable,
}) => {
  const isGenerateDataEnabled = generateDataState[tableName];

  const columns = [
    {
      accessorKey: 'COLUMN_NAME',
      header: 'Column Name',
      Cell: ({ cell }) => (
        <div style={{ position: 'relative' }}>
          <div className="badges-container">
            {cell.row.original.PRIMARY_KEY && (
              <span className="badge primary-key-badge">
                <TfiKey size={17} />
              </span>
            )}
            {cell.row.original.NULLABLE === false && (
              <span className="badge nullable-badge">NOT NULL</span>
            )}
          </div>
          <span>{cell.getValue()}</span>
        </div>
      ),
    },
    { accessorKey: 'DATA_TYPE', header: 'Data Type' },
    {
      accessorKey: 'CHARACTER_MAXIMUM_LENGTH',
      header: 'Max Length',
      Cell: ({ cell }) => cell.getValue() || 'N/A',
    },
    {
      accessorKey: 'GENERATOR',
      header: 'Generator',
      Cell: ({ cell }) => (
        <select
          disabled={!isGenerateDataEnabled}
          value={selectedGenerators[tableName]?.[cell.row.original.COLUMN_NAME] || ''}
          onChange={(e) =>
            handleGeneratorChange(tableName, cell.row.original.COLUMN_NAME, e.target.value)
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
      ),
    },
  ];

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
          <button className="collapse-button" onClick={() => toggleTable(tableName)}>
            {expandedTables[tableName] ? (
              <FaCircleChevronUp size={20} />
            ) : (
              <FaCircleChevronDown size={20} />
            )}
          </button>
        </div>
      </div>
      <div
        className={`table-content ${expandedTables[tableName] ? 'expanded' : 'collapsed'}`}
      >
        <MaterialReactTable
          columns={columns}
          data={tableData.columns}
          enableColumnPinning={true}
          enableStickyHeader={true}
          enableFullScreenToggle={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 5 },
            density: 'compact',
          }}
        />
      </div>
    </div>
  );
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default TableRenderer;

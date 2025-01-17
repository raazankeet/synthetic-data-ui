// React imports
import React, { useState } from "react";

// External libraries and icons
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import { TfiKey } from "react-icons/tfi";
import { TbDatabaseSearch, TbDatabaseImport } from "react-icons/tb";
import { GrSettingsOption } from "react-icons/gr";
import { MdOutlineHelpCenter } from "react-icons/md";

// Material UI imports
import { MaterialReactTable } from "material-react-table";



// Custom Components
import FinalResponse from "./components/FinalResponse";
import ConfirmationDialog from "./components/ConfirmationDialog";
import CustomAppBar from "./components/CustomAppBar";
import SnackbarComponent from "./components/SnackbarComponent";
import MyTextField from "./components/MyTextField";
import GeneratorSelect from "./components/GeneratorSelect"
import CustomBadge from "./components/CustomBadge"
import CustomSlider from "./components/CustomSlider";
import CustomLoadingButton from "./components/CustomLoadingButton";
import CustomSwitch from "./components/CustomSwitch";
import CustomCheckbox from "./components/CustomCheckbox";
import CustomConfidenceBar from "./components/CustomConfidenceBar";




import "./App.css";

function App() {

const [showModal, setShowModal] = useState(false);
const [dialogOpen, setDialogOpen] = useState(false);
const [currentAction, setCurrentAction] = useState(null);
const [dialogTitle, setDialogTitle] = useState("");
const [dialogMessage, setDialogMessage] = useState("");

const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState("info");
const [snackbarTransition, setSnackbarTransition] = useState(undefined);

const [tableName, setTableName] = useState("");
const [metadata, setMetadata] = useState(null);
const [selectedGenerators, setSelectedGenerators] = useState({});
const [expandedTables, setExpandedTables] = useState({});
const [generateDataState, setGenerateDataState] = useState({});
const [recordCounts, setRecordCounts] = useState({});
const [truncateTableState, setTruncateTableState] = useState({});
const [reusabilityPct, setReusabilityPct] = useState({});

const [loadingFetch, setLoadingFetch] = useState(false);
const [loadingGenerateSyntheticData, setloadingGenerateSyntheticData] = useState(false);
const [apiResponse, setApiResponse] = useState(null);

const [isNightMode, setIsNightMode] = useState(false);


  // Toggle day/night mode
  const toggleNightMode = () => {
    setIsNightMode((prevMode) => !prevMode);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity, transition = undefined) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarTransition(() => transition || undefined);
    setSnackbarOpen(true);
  };

  const handleOpenDialog = (action, title, message) => {
    setCurrentAction(() => action); // Set the function to execute
    setDialogTitle(title); // Set the title for the dialog
    setDialogMessage(message); // Set the message for the dialog
    setDialogOpen(true); // Open the confirmation dialog
  };

  const handleCloseDialog = () => {
    setDialogOpen(false); // Close the dialog
    setCurrentAction(null); // Clear the action
  };

  const handleConfirm = () => {
    if (currentAction) {
      currentAction(); // Execute the function
    }
    setDialogOpen(false); // Close the dialog
  };

  const handleMenuClick = () => {
    console.log("Menu icon clicked!");
  };

  const handleButtonClick = (buttonName) => {
    console.log(`${buttonName} button clicked!`);
  };

  const closeModal = () => {
    setShowModal(false);
  };

// Helper function to create a state object for table-related states with custom values
const createTableState = (data, centralValue, parentValue, childValue) => {
  return [
    ...data.central_table_metadata.map((table) => ({
      [table.table_name]: centralValue,
    })),
    ...data.parent_tables_metadata.map((table) => ({
      [table.table_name]: parentValue,
    })),
    ...data.child_tables_metadata.map((table) => ({
      [table.table_name]: childValue,
    })),
  ].reduce((acc, current) => {
    return { ...acc, ...current };
  }, {});
};

  // Fetch metadata from API
  const handleFetchMetadata = () => {
    setLoadingFetch(true);
  
    if (tableName.trim() === "") {
      showSnackbar("Please enter a table name!", "warning");
      setLoadingFetch(false);
      return;
    }
  
    // Function to check if the error is network-related (connection refused, timeout, etc.)
    const isNetworkError = (error) => {
      return (
        error.message &&
        (
          error.message.includes('ERR_CONNECTION_REFUSED') ||  // Connection refused
          error instanceof TypeError ||  // Other network-related issues
          error.message.toLowerCase().includes('network') ||  // Generic network issues
          error.message.toLowerCase().includes('timeout')  // Timeout errors
        )
      );
    };
  
    const maxRetries = 3; // Max number of retries
    const retryDelay = 1000; // Initial delay in milliseconds
  
    const fetchWithRetry = (retriesLeft) => {
      fetch(`http://127.0.0.1:5000/get_metadata?table_name=${tableName}`)
        .then((response) => {
          if (!response.ok) {
            if (response.status === 404) {
              showSnackbar(`Table ${tableName} doesn't exist in catalog!`, "error");
              setLoadingFetch(false);
              throw new Error("404 Not Found");
            }
            // Handle other non-200 errors
            return response.json().then((errorData) => {
              const errorMessage = errorData.error || `Error: ${response.statusText}`;
              showSnackbar(errorMessage, "error");
              setLoadingFetch(false);
              throw new Error(errorMessage);
            });
          }
          return response.json();
        })
        .then((metadata) => {
          setMetadata(metadata);
          setLoadingFetch(false);
  
          setExpandedTables(createTableState(metadata, false, false, false));  // All tables collapsed initially
          setGenerateDataState(createTableState(metadata, true, false, false));  // Central tables set to true, others false
          setRecordCounts(createTableState(metadata, 10, 10, 10));  // All tables have 10 records
          setTruncateTableState(createTableState(metadata, false, false, false));  // No truncation enabled
  
        })
        .catch((error) => {
          if (isNetworkError(error) && retriesLeft > 0) {
            // Retry logic with exponential backoff for network errors
            setTimeout(() => {
              fetchWithRetry(retriesLeft - 1);
            }, retryDelay * Math.pow(2, maxRetries - retriesLeft)); // Exponential backoff
          } else {
            // Handle non-network errors or retries exhausted
            console.error("Error fetching metadata:", error);
            if (isNetworkError(error)) {
              showSnackbar("The scanner service is down, please try again later.", "error");
            } else {
              const errorMessage = error.message || "An error occurred while fetching metadata.";
            showSnackbar(errorMessage, "error");
            }
            setLoadingFetch(false);
          }
        });
    };
  
    fetchWithRetry(maxRetries); // Start the fetch with max retries
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

    // Define columns for Material React Table
    const columns = [
      {
        accessorKey: "COLUMN_NAME",
        header: "Column Name",
        Cell: ({ cell }) => (
          <div style={{ position: "relative" }}>
            {/* Badges container */}
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
            {/* Column Name */}
            <span>{cell.getValue()}</span>
          </div>
        ),
      },
      { accessorKey: "DATA_TYPE", header: "Data Type" },
      {
        accessorKey: "CHARACTER_MAXIMUM_LENGTH",
        header: "Max Length",
        Cell: ({ cell }) => cell.getValue() || "N/A",
      },
      {
        accessorKey: "GENERATOR",
        header: "Generator",

        Cell: ({ cell }) => (
          <GeneratorSelect
          isGenerateDataEnabled={isGenerateDataEnabled}
          selectedGenerators={selectedGenerators}
          tableName={tableName}
          columnName={cell.row.original.COLUMN_NAME}
          handleGeneratorChange={handleGeneratorChange}
        />
    
        ),
        
      },

      {
        accessorKey: "Confidence", 
        header: "Generator Confidence", 
        Cell: ({ row }) => (
          // <div>{selectedGenerators[tableName]?.[row.original.COLUMN_NAME]?.confidence || '-'}%</div> 
          //  <CustomConfidenceBar percentage={selectedGenerators[tableName]?.[row.original.COLUMN_NAME]?.confidence || 0} />
          <CustomConfidenceBar percentage={Math.floor(Math.random() * 101)}/>
        )
      },

    ];

    return (
      <div key={tableName} className="table-container">
        <div className="table-header">
          <h2>
            {capitalizeFirstLetter(tableName)}
            <span style={{ marginRight: "2px" }}></span> {/* Add space here */}
            <div className="record-count-badge">
            <CustomBadge totalRows={tableData.total_rows} />
            </div>
          </h2>

          <div className="header-controls">
            <div className="records-count-container">
              <span>Records to Generate:</span>
              <input
                type="number"
                value={recordCounts[tableName] || 10}
                onChange={(e) =>
                  handleRecordCountChange(tableName, e.target.value)
                }
                disabled={!isGenerateDataEnabled}
              />
            </div>
            <div className="reusability-text-container">
              <span>New Keys Reuse % </span>
            </div>

            <div className="reusability-slider-container">
            <CustomSlider
        disabled={tableData.isCentralTable || !isGenerateDataEnabled}
        onChange={(e) =>
          setReusabilityPct({
            ...reusabilityPct,
            [tableName]: Number(e.target.value),
          })
        }
      />
            </div>

            <div className="truncate-table-container">
              <label>Truncate Load</label>
            </div>

          <CustomCheckbox
              checked={truncateTableState[tableName] || false}
              onChange={() => handleTruncateTableToggle(tableName)}
            />

            <span className="generate-data-text">Generate Data</span>
            <CustomSwitch
        checked={isGenerateDataEnabled || false}
        onChange={() => handleGenerateDataToggle(tableName)}
            />

            <button className="collapse-button" onClick={() => toggleTable(tableName)} >
              {expandedTables[tableName] ? ( <FaCircleChevronUp size={20} /> ) : ( <FaCircleChevronDown size={20} /> )}
            </button>

          </div>
        </div>
        <div
          className={`table-content ${
            expandedTables[tableName] ? "expanded" : "collapsed"
          }`}
        >
          <MaterialReactTable
            columns={columns}
            data={tableData.columns}
            //enableClickToCopy={true}
            enableColumnPinning={true}
            enableStickyHeader={true}
            enableFullScreenToggle={true} // Enable full-screen toggle
            initialState={{
              pagination: { pageIndex: 0, pageSize: pageSize }, // Set default page size to 5
              density: "compact", // Set default density to 'comfortable'
            }}
            onFullScreenChange={handleFullScreenChange}
            muiTableBodyRowProps={getRowProps}
          />
        </div>
      </div>
    );
  };

  const getRowProps = ({ row }) => ({
    sx: {
      backgroundColor: row.index % 2 === 0 ? "#f2f2f2" : "#ffffff",
      tableLayout: "fixed",
    },
  });
  const [pageSize, setPageSize] = useState(5); // Default page size is 5

  // Callback for full-screen toggle
  const handleFullScreenChange = (isFullScreen) => {
    if (isFullScreen) {
      setPageSize(50); // Set page size to 50 when in full-screen
    } else {
      setPageSize(5); // Revert to default page size when exiting full-screen
    }
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
          existing_record_count: table.total_rows || 0,
          records_to_generate: Number(recordCounts[tableName]) || 10,
          reusability_pct: reusabilityPct[tableName],
          columns: table.columns.map((column) => ({
            COLUMN_NAME: column.COLUMN_NAME,
            DATA_TYPE: column.DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH: column.CHARACTER_MAXIMUM_LENGTH,
            PRIMARY_KEY: column.PRIMARY_KEY,
            NULLABLE: column.NULLABLE,
            IDENTITY: column.IDENTITY,
            selected_generator:
              selectedGenerators[tableName]?.[column.COLUMN_NAME] || "",
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

  const generateSyntheticData = async () => {
    try {
      setloadingGenerateSyntheticData(true);
      const jsonOutput = generateJsonOutput(); // Call the function that generates your JSON output

      // alert('The Json Data is'+JSON.stringify(jsonOutput, null, 2));
      const response = await fetch("http://127.0.0.1:5001/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: jsonOutput,
      });

      if (!response.ok) {
        throw new Error("Failed to post JSON data");
      }

      // Handle the response
      const data = await response.json();
      console.log("Post successful", data);

      setApiResponse(data);
      setShowModal(true); // Show modal with the response data
      setloadingGenerateSyntheticData(false);
    } catch (error) {
      console.error("Error posting JSON:", error);
      alert("Error posting JSON data");
      setloadingGenerateSyntheticData(false);
    }
  };

  return (
    <div className="App">
      <div>
        <CustomAppBar
          title="Synthetic Data Generator"
          onMenuClick={handleMenuClick}
          isNightMode={isNightMode}
          toggleMode={toggleNightMode}
          actionButtons={[
            {
              icon: <GrSettingsOption size={22} />,
              onClick: () => handleButtonClick("Settings"),
              tooltip: "Settings",
            },
            {
              icon: <MdOutlineHelpCenter size={28} />,
              onClick: () => handleButtonClick("Help"),
              tooltip: "Help",
            },
            {
              label: "Login",
              onClick: () => handleButtonClick("Login"),
              tooltip: "Login",
            },
          ]}
        />
        <div style={{ padding: "16px" }}></div>
      </div>

      <div className="input-container">
        <MyTextField
          tableName={tableName}
          setTableName={setTableName}
          isNightMode={isNightMode}
          placeholder="Enter table name" // Custom placeholder
          label="Table Name" // Custom label
        />
        {/* Button for Scanning Metadata */}
        <CustomLoadingButton
                isNightMode={isNightMode}
                loading={loadingFetch}
                handleOpenDialog={handleOpenDialog}
                actionFunction={handleFetchMetadata} 
                dialogTitle="Scan Metadata?"
                dialogMessage="Are you sure you want to scan the database to fetch metadata? This action may take a few moments."
                text="Scan Metadata"
                icon={<TbDatabaseSearch />}
              />

        {/* <button onClick={generateJsonOutput}>Generate JSON</button> */}
        {/* Button for Generating Synthetic Data */}
      <CustomLoadingButton
        isNightMode={isNightMode}
        loading={loadingGenerateSyntheticData}
        handleOpenDialog={handleOpenDialog}
        actionFunction={generateSyntheticData} 
        dialogTitle="Generate Synthetic Data?"
        dialogMessage="Are you sure you want to generate synthetic data? This action may take a few moments."
        text="Generate Synthetic Data"
        icon={<TbDatabaseImport />}
      />

        <SnackbarComponent
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
          TransitionComponent={snackbarTransition}
        />

        <ConfirmationDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirm}
          title={dialogTitle}
          message={dialogMessage}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
      {metadata && (
        <div>
          {metadata.central_table_metadata.length > 0 && (
            <div>
              <div className="metadata-card">
                <h3 className="metadata-title">Central Table</h3>
                {metadata.central_table_metadata.map((table) =>
                  renderTable(table.table_name, {
                    ...table,
                    isCentralTable: true,
                  })
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
      {showModal && (
        <FinalResponse
          message="Data generation successful!"
          data={apiResponse}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default App;
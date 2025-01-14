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
import Switch from "@mui/material/Switch";
import Badge from '@mui/material/Badge';
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import { grey, red } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for checked state
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; // Icon for unchecked state
import LoadingButton from "@mui/lab/LoadingButton";

// Custom Components
import FinalResponse from "./components/FinalResponse";
import ConfirmationDialog from "./components/ConfirmationDialog";
import CustomAppBar from "./components/CustomAppBar";
import SnackbarComponent from "./components/SnackbarComponent";
import MyTextField from "./components/MyTextField";


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
      showSnackbar("Please enter a table name!", "error");
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
        .then((data) => {
          setMetadata(data);
          setLoadingFetch(false);
  
          setExpandedTables(createTableState(data, false, false, false));  // All tables collapsed initially
          setGenerateDataState(createTableState(data, true, false, false));  // Central tables set to true, others false
          setRecordCounts(createTableState(data, 10, 10, 10));  // All tables have 10 records
          setTruncateTableState(createTableState(data, false, false, false));  // No truncation enabled
  
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
          <select
            disabled={!isGenerateDataEnabled}
            value={
              selectedGenerators[tableName]?.[cell.row.original.COLUMN_NAME] ||
              ""
            }
            onChange={(e) =>
              handleGeneratorChange(
                tableName,
                cell.row.original.COLUMN_NAME,
                e.target.value
              )
            }
          >
            <option value="">Select Generator</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="fullName">Full Name</option>
            <option value="gender">Gender</option>
            <option value="phoneNumber">Phone Number</option>
            <option value="city">City</option>
            <option value="state">State</option>
            <option value="zipcode">Zip Code</option>
            <option value="addressline1">Address Line 1</option>
            <option value="addressline2">Address Line 2</option>
            <option value="fullAddress">Full Address</option>
            <option value="ssn">SSN</option>
            <option value="emailID">Email</option>
            <option value="bookName">Book Name</option>
            <option value="bookAuthor">Book Author</option>
            <option value="weather">Weather</option>
            <option value="temperature">Temperature</option>
            <option value="creditCardNumber">Credit Card Number</option>
            <option value="dollarAmount">Dollar Amount</option>
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
            <option value="hospitalType">Hospital Type</option>
            <option value="diseaseName">Disease Name</option>
            <option value="medicineName">Medicine Name</option>
            <option value="sha256">SHA 256</option>
            <option value="futureDate">Future Date</option>
            <option value="pastDate">Past Date</option>
            <option value="boolean">Boolean (1/0)</option>
          </select>
        ),
      },
    ];

    return (
      <div key={tableName} className="table-container">
        <div className="table-header">
          <h2>
            {capitalizeFirstLetter(tableName)}
            <span style={{ marginRight: "2px" }}></span> {/* Add space here */}
            <div className="record-count-badge">
              <Badge
                badgeContent={tableData.total_rows || 0} // Number to display inside the badge
                color="secondary" // Badge color, can be "default", "primary", "secondary", etc.
                overlap="circular" // Badge will be circular (default behavior)
                max={1000000}
                showZero={true}
                style={{
                  width: "12px",
                  height: "12px",
                  minWidth: "22px",
                  minHeight: "12px",
                }}
              />
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
              <Slider
                defaultValue={30}
                valueLabelDisplay="auto"
                aria-label="Percentage Reusage"
                size="small"
                disabled={tableData.isCentralTable || !isGenerateDataEnabled}
                onChange={(e) =>
                  setReusabilityPct({
                    ...reusabilityPct,
                    [tableName]: Number(e.target.value),
                  })
                }
                sx={{
                  width: 70,
                  color: "secondary",
                  "& .MuiSlider-thumb": {
                    borderRadius: "3px",
                  },
                }}
              />
            </div>

            <div className="truncate-table-container">
              <label>Truncate Load</label>
            </div>

            <Checkbox
              checked={truncateTableState[tableName] || false}
              onChange={() => handleTruncateTableToggle(tableName)}
              icon={<DeleteOutlineIcon />} // Icon for unchecked state
              checkedIcon={<DeleteIcon />} // Icon for checked state
              sx={{
                color: grey[600],
                "&.Mui-checked": {
                  color: red[800],
                },
              }}
            />

            <span className="generate-data-text">Generate Data</span>
            <Switch
              checked={isGenerateDataEnabled || false}
              onChange={() => handleGenerateDataToggle(tableName)}
              color="default"
              sx={{
                "& .MuiSwitch-track": {
                  backgroundColor: isGenerateDataEnabled ? "green" : "red", // Track color based on state
                  borderRadius: 20, // Rounded corners for the track
                  opacity: 0.51, // Slight opacity for the track when unchecked
                  transition: "background-color 0.2s ease", // Smooth transition for color change
                },
                "& .MuiSwitch-thumb": {
                  backgroundColor: isGenerateDataEnabled ? "green" : "red", // Optional: make the thumb color consistent
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)", // Larger shadow on hover
                },
              }}
            />

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

        <LoadingButton
          sx={{
            borderRadius: "15px",
            backgroundColor: isNightMode ? "#333" : "#6200ea", // Dark background for night mode, purple for day mode
            color: "#fff", // Ensure text is always white for contrast
            "&:hover": {
              backgroundColor: isNightMode ? "#444" : "#3700b3", // Lighter shade for hover in night mode
            },
            // Adjust spinner color for better visibility
            "& .MuiCircularProgress-root": {
              color: "#fff", // Set spinner color to white in both modes
            },
            // Make sure the button has proper contrast in night mode
            boxShadow: isNightMode ? "0px 4px 6px rgba(0, 0, 0, 0.3)" : "none", // Optional shadow to lift the button
          }}
          size="small"
          color="secondary"
          endIcon={<TbDatabaseSearch />}
          loadingPosition="end"
          loading={loadingFetch}
          variant="contained"
          onClick={() => {
            if (tableName.trim() === "") {
              // Show snackbar or alert about empty table name
              showSnackbar("Table name cannot be empty!", "warning");
              return;
            }
            // Show confirmation dialog if table name is provided
            handleOpenDialog(
              handleFetchMetadata,
              "Scan Metadata?",
              "Are you sure you want to scan the database to fetch metadata? This action may take a few moments."
            );
          }}
        >
          Scan Metadata
        </LoadingButton>

        {/* <button onClick={generateJsonOutput}>Generate JSON</button> */}
        <LoadingButton
          sx={{
            borderRadius: "15px",
            backgroundColor: isNightMode ? "#333" : "#6200ea", // Dark background for night mode, purple for day mode
            color: "#fff", // Ensure text is always white for contrast
            "&:hover": {
              backgroundColor: isNightMode ? "#444" : "#3700b3", // Lighter shade for hover in night mode
            },
            // Adjust spinner color for better visibility
            "& .MuiCircularProgress-root": {
              color: "#fff", // Set spinner color to white in both modes
            },
            // Make sure the button has proper contrast in night mode
            boxShadow: isNightMode ? "0px 4px 6px rgba(0, 0, 0, 0.3)" : "none", // Optional shadow to lift the button
          }}
          size="small"
          color="secondary"
          endIcon={<TbDatabaseImport />}
          loadingPosition="end"
          loading={loadingGenerateSyntheticData}
          variant="contained"
          onClick={() =>
            handleOpenDialog(
              generateSyntheticData,
              "Generate Synthetic Data?",
              "Are you sure you want to generate synthetic data? This action may take a few moments."
            )
          }
        >
          Generate Synthetic Data
        </LoadingButton>

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

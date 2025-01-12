import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

const MyTextField = ({ tableName, setTableName, isNightMode, placeholder, label }) => {

  const handleClear = () => {
    setTableName(''); // Clear the tableName
  };

  return (
    <TextField
      value={tableName}
      required
      onChange={(e) => setTableName(e.target.value)} // Update tableName from parent
      placeholder={placeholder} // Use placeholder prop
      label={label} // Use label prop
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                width: "36px", // Reserve space for the icon
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {tableName && (
                <IconButton
                  onClick={handleClear}
                  edge="end"
                  size="small"
                  sx={{
                    padding: 0, // Ensure minimal padding
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: "50px", // Consistent height for the input box
          borderRadius: 15, // Rounded corners
          backgroundColor: isNightMode ? '#333' : '#fff', // Dark/Light background based on mode
          color: isNightMode ? '#fff' : '#000', // Dark/Light text color based on mode
        },
        "& .MuiInputLabel-root": {
          color: isNightMode ? '#bbdefb' : '#1976d2', // Light blue color for label in both modes
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: isNightMode ? '#bbdefb' : '#1976d2', // Keep label color focused in both modes
        },
      }}
    />
  );
};

export default MyTextField;

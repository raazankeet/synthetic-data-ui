import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";

const CustomLoadingButton = ({
  isNightMode = false,
  loading = false,
  handleOpenDialog, // Function to open the confirmation dialog
  actionFunction, // The dynamic function to execute (e.g., fetch or generate)
  dialogTitle = "Confirm Action", // Dialog title
  dialogMessage = "Are you sure you want to perform this action?", // Dialog message
  text = "Perform Action", // Button text
  icon, // Icon to display
}) => (
  <LoadingButton
    sx={{
      borderRadius: "15px",
      backgroundColor: isNightMode ? "#333" : "#6200ea",
      color: "#fff",
      "&:hover": { backgroundColor: isNightMode ? "#444" : "#3700b3" },
      "& .MuiCircularProgress-root": { color: "#fff" },
      boxShadow: isNightMode ? "0px 4px 6px rgba(0, 0, 0, 0.3)" : "none",
      
    }}
    size="medium"
    color="secondary"
    endIcon={icon}
    loadingPosition="end"
    loading={loading}
    variant="contained"
    onClick={() => handleOpenDialog(actionFunction, dialogTitle, dialogMessage)}
  >
    {text}
  </LoadingButton>
);

export default CustomLoadingButton;

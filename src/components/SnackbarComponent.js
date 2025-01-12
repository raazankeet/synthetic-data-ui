import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import PropTypes from "prop-types";
import Slide from "@mui/material/Slide";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Default Transition Component
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const SnackbarComponent = ({
  open,
  message,
  severity = "info", // Default severity
  onClose,
  autoHideDuration = 3000, // Default duration
  TransitionComponent = SlideTransition, // Default transition
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={TransitionComponent}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

SnackbarComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
  onClose: PropTypes.func.isRequired,
  autoHideDuration: PropTypes.number,
  TransitionComponent: PropTypes.elementType, // Accepts a transition component
};

export default SnackbarComponent;

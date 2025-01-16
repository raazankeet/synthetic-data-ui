import React from "react";
import Badge from '@mui/material/Badge';

const CustomBadge = ({ totalRows }) => {
  return (
    <Badge
      badgeContent={totalRows || 0} // Number to display inside the badge
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
  );
};

export default CustomBadge;

import React from "react";
import Slider from "@mui/material/Slider";

const CustomSlider = ({
  defaultValue = 30,
  disabled = false,
  onChange,
  styleOverrides = {},
}) => (
  <Slider
    defaultValue={defaultValue}
    valueLabelDisplay="auto"
    aria-label="Custom Slider"
    size="small"
    disabled={disabled}
    onChange={onChange}
    sx={{
      width: 70,
      color: "secondary",
      "& .MuiSlider-thumb": { borderRadius: "3px" },
      ...styleOverrides, // Allow additional style overrides
    }}
  />
);

export default CustomSlider;

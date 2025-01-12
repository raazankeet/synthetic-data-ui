import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Example of a menu icon
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip component

import { TbTableSpark } from "react-icons/tb";
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Day icon
import Brightness3Icon from '@mui/icons-material/Brightness3'; // Night icon

const CustomAppBar = ({
  title = "App Title", // Default title
  onMenuClick, // Function for menu icon click
  actionButtons = [], // Array of buttons with { label, icon, onClick, tooltip }
  appBarColor = "#2c3e50", // Default custom color
  icon = <TbTableSpark size={28} /> // Default icon (can be customized)
}) => {
  // State to toggle day/night mode
  const [isNightMode, setIsNightMode] = useState(false);

  // Toggle day/night mode
  const toggleMode = () => {
    setIsNightMode(prevMode => !prevMode);
  };

  // UseEffect to update body background color when mode changes
  useEffect(() => {
    if (isNightMode) {
      document.body.style.backgroundColor = "#121212"; // Dark background for night mode
    } else {
      document.body.style.backgroundColor = "#f5f5f5"; // Light background for day mode
    }
  }, [isNightMode]);

  return (
    <Box sx={{ }}>
      {/* AppBar remains unchanged */}
      <AppBar position="static" sx={{ backgroundColor: appBarColor }}>
        <Toolbar>
          {/* Menu Icon */}
          {onMenuClick && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Custom Icon */}
          <IconButton color="inherit" sx={{ mr: 2 }}>
            {icon}
          </IconButton>

          {/* Title aligned to the left */}
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Action Buttons */}
          <Box>
            {actionButtons.map((button, index) => (
              <Tooltip key={index} title={button.tooltip || ''} arrow>
                <Button
                  color="inherit"
                  onClick={button.onClick}
                  sx={{ ml: 1 }}
                >
                  {/* Render either icon or label */}
                  {button.icon ? button.icon : button.label}
                </Button>
              </Tooltip>
            ))}
          </Box>

          {/* Day/Night Mode Toggle */}
          <Tooltip title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode"} arrow>
  <IconButton color="inherit" onClick={toggleMode}>
    {isNightMode ? <Brightness3Icon /> : <Brightness7Icon />}
  </IconButton>
</Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main content area */}

    </Box>
  );
};

export default CustomAppBar;

import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { TbTableSpark } from "react-icons/tb";

import Brightness3Icon from '@mui/icons-material/Brightness3';
import LightModeIcon from '@mui/icons-material/LightMode';



const CustomAppBar = ({
  title = "App Title", // Default title
  onMenuClick, // Function for menu icon click
  actionButtons = [], // Array of buttons with { label, icon, onClick, tooltip }
  appBarColor = "#2c3e50", // Default custom color
  icon = <TbTableSpark size={28} />, // Default icon (can be customized)
  isNightMode, // Receive the night mode state as a prop
  toggleMode, // Receive the toggleMode function as a prop
}) => {

  // UseEffect to update body background color when mode changes
  useEffect(() => {
    // Apply transition effect to the background color
    document.body.style.transition = 'background-color 0.5s ease-in-out';
    if (isNightMode) {
      document.body.style.backgroundColor = "#121212"; // Dark background for night mode
    } else {
      document.body.style.backgroundColor = "#f5f5f5"; // Light background for day mode
    }
  }, [isNightMode]);

  return (
    <Box>
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
                  {button.icon ? button.icon : button.label}
                </Button>
              </Tooltip>
            ))}
          </Box>

          {/* Day/Night Mode Toggle with animation */}
          <Tooltip title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode"} arrow>
            <IconButton
              color="inherit"
              onClick={toggleMode}
              sx={{
                transition: 'transform 0.5s ease-in-out, scale 0.5s ease-in-out, box-shadow 0.5s ease-in-out', // Smooth transition for scaling and shadow
                transform: isNightMode ? 'scale(0.7) rotate(-180deg)' : 'scale(1) rotate(0deg)', // Scale and rotate simultaneously
                boxShadow: isNightMode ? '0px 0px 10px 5px rgba(0, 0, 0, 0.8)' : '0px 0px 15px 5px rgba(255, 204, 0, 0.6)', // Glowing effect for the sun in day mode
              }}
            >
              {isNightMode ? <Brightness3Icon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomAppBar;

import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

// Function to calculate the color based on the percentage (from red to green)
const getConfidenceBarColor = (percentage) => {
  const red = Math.min(255, Math.floor((100 - percentage) * 2.55));  // Red decreases as percentage increases
  const green = Math.min(255, Math.floor(percentage * 2.55));  // Green increases as percentage increases
  return `rgb(${red}, ${green}, 0)`;  // Returns an RGB color value
};

// Reusable CustomLinearProgressWithLabel component
const CustomLinearProgressWithLabel = ({ percentage }) => {
  // Handle the "not known" case
  if (percentage === "not known") {
    return (
      <Box sx={{ width: '30%', padding: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 0 }}>
          Not Known
        </Typography>
        <LinearProgress
          variant="determinate"
          value={0}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0', // background color of the progress bar
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#b0b0b0', // gray color for "not known"
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '30%', padding: 0 }}>
      <Typography variant="body2" color="text.primary" sx={{ marginBottom: 0 }}>
        {`${percentage}%`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e0e0e0', // background color of the progress bar
          '& .MuiLinearProgress-bar': {
            backgroundColor: getConfidenceBarColor(percentage), // dynamic color based on percentage
          },
        }}
      />
    </Box>
  );
};

export default CustomLinearProgressWithLabel;

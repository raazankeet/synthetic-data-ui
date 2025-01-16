import React from 'react';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';

const CustomSwitch = ({ checked, onChange }) => {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      color="default"
      sx={{
        '& .MuiSwitch-track': {
          backgroundColor: checked ? 'green' : 'red', // Track color based on state
          borderRadius: 20, // Rounded corners for the track
          opacity: 0.51, // Slight opacity for the track when unchecked
          transition: 'background-color 0.2s ease', // Smooth transition for color change
        },
        '& .MuiSwitch-thumb': {
          backgroundColor: checked ? 'green' : 'red', // Thumb color based on state
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', // Larger shadow on hover
        },
      }}
    />
  );
};

CustomSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CustomSwitch;

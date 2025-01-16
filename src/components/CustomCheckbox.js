import React from 'react';
import { Checkbox } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { grey, red } from '@mui/material/colors';

const CustomCheckbox = ({ checked, onChange }) => {
  return (
    <Checkbox
      checked={checked || false}
      onChange={onChange}
      icon={<DeleteOutlineIcon />} // Icon for unchecked state
      checkedIcon={<DeleteIcon />} // Icon for checked state
      sx={{
        color: grey[600],
        "&.Mui-checked": {
          color: red[800],
        },
      }}
    />
  );
};

export default CustomCheckbox;

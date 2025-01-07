import React, { useState } from 'react';
import { Modal, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const FinalResponse = ({ message, data, closeModal }) => {
  const [openSuccessModal, setOpenSuccessModal] = useState(true);
  const [openStatsModal, setOpenStatsModal] = useState(false);

  // Function to close success modal and open stats modal
  const handleCloseSuccessModal = () => {
    setOpenSuccessModal(false);
    setOpenStatsModal(true);
  };

  // Function to close stats modal and call closeModal from parent
  const handleCloseStatsModal = () => {
    setOpenStatsModal(false);
    closeModal();  // Call the parent function to close the modal
  };

  const renderTable = (results) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Table Name</TableCell>
              <TableCell>Inserted</TableCell>
              <TableCell>Duplicates</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.table_name}</TableCell>
                <TableCell>{result.inserted}</TableCell>
                <TableCell>{result.duplicates}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const parentResults = data?.details?.parent_results || [];
  const childResults = data?.details?.child_results || [];

  return (
    <>
      {/* Success Modal */}
      <Modal open={openSuccessModal} onClose={closeModal}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" component="h2">
            {message}
          </Typography>
          <Button onClick={handleCloseSuccessModal} sx={{ position: 'absolute', top: 10, right: 10 }}>Close</Button>
          <Button onClick={handleCloseSuccessModal}>View Stats</Button>
        </Box>
      </Modal>

      {/* Stats Modal */}
      <Modal open={openStatsModal} onClose={handleCloseStatsModal}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" component="h2">
            Parent Results
          </Typography>
          {renderTable(parentResults)}

          <Typography variant="h6" component="h2" sx={{ marginTop: 2 }}>
            Child Results
          </Typography>
          {renderTable(childResults)}
          <Button onClick={handleCloseStatsModal} sx={{ position: 'absolute', top: 10, right: 10 }}>Close</Button>
        </Box>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default FinalResponse;

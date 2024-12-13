import React, { useState, useEffect } from "react";

function TableList() {
  const [tableData, setTableData] = useState(null);
  const [lookupData, setLookupData] = useState([
    "Generator1", "Generator2", "Generator3", "Generator4"
  ]);
  
  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_metadata?table_name=member")
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log to see if data is coming from API
        setTableData(data.member);  // Assuming response has the 'member' key
      })
      .catch(error => console.error('Error fetching metadata:', error));
  }, []);

  return (
    <div>
      <h1>Metadata Table Viewer</h1>
      <h2>Tables</h2>
      {tableData ? (
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Generator</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((column, index) => (
              <tr key={index}>
                <td>{column.COLUMN_NAME}</td>
                <td>{column.DATA_TYPE}</td>
                <td>
                  <select>
                    {lookupData.map((generator, idx) => (
                      <option key={idx} value={generator}>{generator}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading table data...</p>
      )}
    </div>
  );
}

export default TableList;

import React, { useState, useEffect } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Devices from "@mui/icons-material/Devices";
import Header from "../../components/Header";

const Support = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/support/get_ticket.php");
        const data = await response.json();
        setTicketData(data); // Assuming the tickets data is returned as an array
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  const columns = [
    { field: "id", headerName: "Ticket ID", width: 120 },
    {
      field: "EmpId",
      headerName: "Employee ID",
      width: 150,
    },
    {
      field: "Category",
      headerName: "Category",
      flex: 1,
    },
   
   
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "DateTime",
      headerName: "Date Created",
      flex: 1,
    },
    {
      field: "UpdateDateTime",
      headerName: "Last Updated",
      flex: 1,
    },
  ];

  const handleRowClick = (params) => {
    navigate(`/support/${params.row.id}`); // Navigating to the detail page with Ticket ID
  };

  const handleCreateTicket = () => {
    navigate("/raise-ticket"); // Redirect to the form route for adding a new support ticket
  };

  return (
    <Box m="20px">
      {/* Header and Add New button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Support Tickets" subtitle="Managing Support Tickets" />
        <Box
          width="20%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer" }}
          onClick={handleCreateTicket}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Raise Ticket
          </Typography>
          <Devices sx={{ color: colors.grey[100] }} />
        </Box>
      </Box>

      <Box
        m="10px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={ticketData} // Use the actual ticket data
          columns={columns}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default Support;

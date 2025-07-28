import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, TextField, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import { useLocation } from "react-router-dom";

const Support = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [ticketData, setTicketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvedByMap, setResolvedByMap] = useState({});
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get("status");

  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const isErpAdmin = userDetails?.Role === 'ERPADMIN';
  const isL2 = userDetails?.Role === 'L2';
  const isAdmin = userDetails?.Role === 'Admin';
  const empId = userDetails?.EmpId;

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        let url = "https://namami-infotech.com/NiveshanBackend/api/support/get_ticket.php";
        if (isErpAdmin) {
          url += `?Role=ERPADMIN`;
        } else if (isL2) {
          url += `?Role=L2`;
        } else if (!isAdmin) {
          url += `?EmpId=${empId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Format dates to be consistent
        const formattedData = data.map(ticket => ({
          ...ticket,
          DateTime: formatDateForDisplay(ticket.DateTime),
          formattedDateTime: formatDateForFilter(ticket.DateTime),
          UpdateDateTime: formatDateForDisplay(ticket.UpdateDateTime),
        }));

        const statusFilteredData = statusFilter
          ? formattedData.filter((ticket) => ticket.Status === statusFilter)
          : formattedData;

        setTicketData(statusFilteredData);
        setFilteredData(statusFilteredData);

        // Fetch last resolver for Reopen tickets
        const reopenTickets = statusFilteredData.filter(t => t.Status === "Reopen");
        const resolverMap = {};

        await Promise.all(
          reopenTickets.map(async (ticket) => {
            const updateRes = await fetch(`https://namami-infotech.com/NiveshanBackend/api/support/get_updates.php?ticketId=${ticket.id}`);
            const updates = await updateRes.json();
            const lastResolved = updates.reverse().find(u => u.Status === "Resolved");
            if (lastResolved) {
              resolverMap[ticket.id] = lastResolved.UpdateBy;
            }
          })
        );

        setResolvedByMap(resolverMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [isAdmin, empId, statusFilter]);

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to format date for filtering (YYYY-MM-DD)
  const formatDateForFilter = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (fromDate || toDate) {
      const filtered = ticketData.filter(ticket => {
        const ticketDate = ticket.formattedDateTime;
        
        // If both dates are set
        if (fromDate && toDate) {
          return ticketDate >= fromDate && ticketDate <= toDate;
        }
        // If only fromDate is set
        else if (fromDate) {
          return ticketDate >= fromDate;
        }
        // If only toDate is set
        else {
          return ticketDate <= toDate;
        }
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(ticketData);
    }
  }, [fromDate, toDate, ticketData]);

  const columns = [
    { field: "id", headerName: "Ticket ID", width: 120 },
    {
      field: "EmpId",
      headerName: "Employee ID",
      width: 150,
    },
    {
      field: "Name",
      headerName: "Employee Name",
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
    navigate(`/support/${params.row.id}`);
  };

  const handleCreateTicket = () => {
    navigate("/raise-ticket");
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setFilteredData(ticketData);
  };

  const exportCSV = () => {
    // Apply the same date filtering to CSV export
    let dataToExport = ticketData;
    
    if (fromDate || toDate) {
      dataToExport = ticketData.filter(ticket => {
        const ticketDate = ticket.formattedDateTime;
        
        if (fromDate && toDate) {
          return ticketDate >= fromDate && ticketDate <= toDate;
        }
        else if (fromDate) {
          return ticketDate >= fromDate;
        }
        else {
          return ticketDate <= toDate;
        }
      });
    }

    const csvData = dataToExport.map(ticket => ({
      "Ticket ID": ticket.id,
      "Employee ID": ticket.EmpId,
      "Employee Name": ticket.Name,
      "Category": ticket.Category,
      "Status": ticket.Status,
      "Date Created": ticket.DateTime,
      "Last Updated": ticket.UpdateDateTime,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'support_tickets_report.csv');
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Support Tickets" subtitle="Managing Support Tickets" />
           <Box>
          <Typography variant="h6" mb="5px">From Date</Typography>
          <TextField
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 220 }}
          />
        </Box>
        <Box>
          <Typography variant="h6" mb="5px">To Date</Typography>
          <TextField
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 220 }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleResetFilters}
          sx={{
            mt: '25px',
            backgroundColor: colors.redAccent[500],
            '&:hover': {
              backgroundColor: colors.redAccent[600],
            }
          }}
        >
          Reset Filters
        </Button>
        <Box display="flex" gap="10px">
          <Box
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
            <LiveHelpIcon sx={{ color: colors.grey[100] }} />
          </Box>

          <Box
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.greenAccent[600]}
            borderRadius="4px"
            sx={{ cursor: "pointer" }}
            onClick={exportCSV}
          >
            <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
              Export CSV
            </Typography>
            <SummarizeIcon sx={{ color: colors.grey[100] }} />
          </Box>
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
          rows={filteredData}
          columns={columns}
          loading={loading}
          onRowClick={handleRowClick}
          sx={{cursor:"pointer"}}
        />
      </Box>
    </Box>
  );
};

export default Support;
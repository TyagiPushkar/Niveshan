import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import { useLocation } from "react-router-dom";
import he from 'he'; 
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
const [categoryFilter, setCategoryFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
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
    if (fromDate || toDate || categoryFilter) {
      const filtered = ticketData.filter(ticket => {
        const ticketDate = ticket.formattedDateTime;
        let dateCondition = true;
        let categoryCondition = true;
        
        // Date conditions
        if (fromDate && toDate) {
          dateCondition = ticketDate >= fromDate && ticketDate <= toDate;
        } else if (fromDate) {
          dateCondition = ticketDate >= fromDate;
        } else if (toDate) {
          dateCondition = ticketDate <= toDate;
        }
        
        // Category condition
        if (categoryFilter) {
          categoryCondition = ticket.Category === categoryFilter;
        }
        
        return dateCondition && categoryCondition;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(ticketData);
    }
  }, [fromDate, toDate, categoryFilter, ticketData]);

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
    setCategoryFilter('');
    setFilteredData(ticketData);
  };


  const exportTicketWithUpdates = async () => {
  try {
    setLoading(true);
    
    // 1. Get all filtered tickets
    const ticketsToExport = [...filteredData];
    
    // 2. Fetch updates for each ticket
    const ticketsWithUpdates = await Promise.all(
      ticketsToExport.map(async (ticket) => {
        try {
          const response = await fetch(
            `https://namami-infotech.com/NiveshanBackend/api/support/get_updates.php?ticketId=${ticket.id}`
          );
          const updates = await response.json();
          return {
            ...ticket,
            updates: Array.isArray(updates) ? updates : []
          };
        } catch (error) {
          console.error(`Error fetching updates for ticket ${ticket.id}:`, error);
          return {
            ...ticket,
            updates: []
          };
        }
      })
    );

    // 3. Prepare CSV data in the requested format
    const csvData = [
      // Header row
      [
        "Type", "ID", "Employee ID", "Employee Name", "Category", 
        "Status", "Remark", "Update Remark", "Date Created", 
        "Last Updated", "Effort", "Updated By"
      ]
    ];

    ticketsWithUpdates.forEach(ticket => {
      // Add ticket row
      csvData.push([
        "Ticket",
        ticket.id,
        ticket.EmpId || '',
        ticket.Name || '',
        ticket.Category || '',
        ticket.Status || '',
        cleanHtmlContent(ticket.Remark),
        cleanHtmlContent(ticket.Update_remark),
        ticket.DateTime || '',
        ticket.UpdateDateTime || '',
        '', // Empty Effort for ticket row
        ''  // Empty Updated By for ticket row
      ]);

      // Add update rows
      if (Array.isArray(ticket.updates)) {
        ticket.updates.forEach((update, index) => {
          csvData.push([
            "Update",
            `${ticket.id}_${index + 1}`, // Format: ticketId_updateIndex
            '', // Empty Employee ID
            '', // Empty Employee Name
            '', // Empty Category
            update.Status || '',
            cleanHtmlContent(update.Remark),
            '', // Empty Update Remark for updates
            update.DateTime || '',
            '', // Empty Last Updated
            update.Effort || '',
            update.UpdateBy || ''
          ]);
        });
      }
    });

    // 4. Generate and download CSV
    const csv = Papa.unparse({
      fields: csvData[0], // Header row
      data: csvData.slice(1) // Data rows
    });

    const blob = new Blob(["\uFEFF" + csv], { 
      type: 'text/csv;charset=utf-8;' 
    });
    saveAs(blob, `tickets_report_${new Date().toISOString().split('T')[0]}.csv`);

  } catch (error) {
    console.error("Export failed:", error);
    alert(`Export failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// HTML cleaning function
const cleanHtmlContent = (html) => {
  if (!html) return '';
  try {
    return he.decode(html).replace(/<[^>]*>/g, '');
  } catch (e) {
    console.error("Error cleaning HTML:", e);
    return html;
  }
};

const exportCombinedReport = async () => {
  try {
    setLoading(true);
    
    // 1. Get all filtered tickets with their updates
    const ticketsWithUpdates = await Promise.all(
      filteredData.map(async (ticket) => {
        try {
          const response = await fetch(
            `https://namami-infotech.com/NiveshanBackend/api/support/get_updates.php?ticketId=${ticket.id}`
          );
          const updates = await response.json();
          return {
            ...ticket,
            updates: Array.isArray(updates) ? updates : []
          };
        } catch (error) {
          console.error(`Error fetching updates for ticket ${ticket.id}:`, error);
          return {
            ...ticket,
            updates: []
          };
        }
      })
    );

    // 2. Prepare data for reports
    const summaryData = [];
    let totalEffort = { days: 0, hours: 0, minutes: 0 };

    ticketsWithUpdates.forEach(ticket => {
      // Calculate effort for this ticket
      let ticketEffort = { days: 0, hours: 0, minutes: 0 };
      let endDateTime = ticket.UpdateDateTime || '';
      
      // Process updates to calculate effort and find end date
      ticket.updates.forEach(update => {
        // Track effort if this update has effort data
        if (update.Effort) {
          const effortMatch = update.Effort.match(/(\d+)d\s(\d+)h\s(\d+)m/);
          if (effortMatch) {
            ticketEffort.days += parseInt(effortMatch[1]);
            ticketEffort.hours += parseInt(effortMatch[2]);
            ticketEffort.minutes += parseInt(effortMatch[3]);
          }
        }

        // If this is a resolved update, consider it as potential end date
        if (update.Status === "Resolved") {
          endDateTime = update.DateTime || endDateTime;
        }
      });

      // Normalize the effort for this ticket
      ticketEffort.hours += Math.floor(ticketEffort.minutes / 60);
      ticketEffort.minutes = ticketEffort.minutes % 60;
      ticketEffort.days += Math.floor(ticketEffort.hours / 24);
      ticketEffort.hours = ticketEffort.hours % 24;

      // Format the effort string
      const effortString = `${ticketEffort.days}d ${ticketEffort.hours}h ${ticketEffort.minutes}m`;

      // Add to summary data - all fields in one row
      summaryData.push([
        ticket.id || '',
        ticket.Category || '',
        ticket.Name || '',
        ticket.Status || '',
        cleanHtmlContent(ticket.Remark || ''),
        effortString,
        ticket.DateTime || '',
        endDateTime
      ]);

      // Add to total effort
      totalEffort.days += ticketEffort.days;
      totalEffort.hours += ticketEffort.hours;
      totalEffort.minutes += ticketEffort.minutes;
    });

    // Normalize total effort
    totalEffort.hours += Math.floor(totalEffort.minutes / 60);
    totalEffort.minutes = totalEffort.minutes % 60;
    totalEffort.days += Math.floor(totalEffort.hours / 24);
    totalEffort.hours = totalEffort.hours % 24;

    // 3. Generate the report with headers
    const reportData = [
      ["SUPPORT TICKETS SUMMARY REPORT", "", "", "", "", "", "", ""],
      ["Generated On", new Date().toLocaleString(), "", "", "", "", "", ""],
      ["Date Range", fromDate || "Start", "to", toDate || "End", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["Ticket ID", "Ticket Type", "Employee Name", "Last Status", "Opening Comment", "Total Effort", "Start Date & Time", "End Date & Time"],
      ...summaryData,
      ["", "", "", "", "", "", "", ""],
      ["TOTAL EFFORT ACROSS ALL TICKETS", "", "", "", "", `${totalEffort.days}d ${totalEffort.hours}h ${totalEffort.minutes}m`, "", ""]
    ];

    // 4. Create and download the report
    const csv = Papa.unparse({ data: reportData });
    const blob = new Blob(["\uFEFF" + csv], { 
      type: 'text/csv;charset=utf-8;' 
    });
    saveAs(blob, `tickets_summary_report_${new Date().toISOString().split('T')[0]}.csv`);

  } catch (error) {
    console.error("Export failed:", error);
    alert(`Export failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
    if (ticketData.length > 0) {
      const categories = [...new Set(ticketData.map(ticket => ticket.Category))];
      setAvailableCategories(categories);
    }
  }, [ticketData]);
  return (
    <Box m="20px">
       <Box display="flex" justifyContent="space-between" alignItems="center" mb={0}>
      <Header title="Support Tickets" subtitle="Managing Support Tickets" />
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
          onClick={exportTicketWithUpdates}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Detail Report
          </Typography>
          <SummarizeIcon sx={{ color: colors.grey[100] }} />
        </Box>
        <Box
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.blueAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer", ml: 1 }}
          onClick={exportCombinedReport}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Summary Report
          </Typography>
          <SummarizeIcon sx={{ color: colors.grey[100] }} />
        </Box>
      </Box>
    </Box>

    {/* Second Row - Filters */}
    <Box 
      display="flex" 
      flexWrap="wrap" 
      gap={2} 
      mb={3}
      sx={{
        '& > *': {
          flex: '1 1 200px',
          minWidth: '200px'
        }
      }}
    >
      <Box>
        <Typography variant="subtitle2" mb="5px">From Date</Typography>
        <TextField
          type="date"
          size="small"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>
      
      <Box>
        <Typography variant="subtitle2" mb="5px">To Date</Typography>
        <TextField
          type="date"
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Box>
      
      <Box>
        <Typography variant="subtitle2" mb="5px">Category</Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {availableCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box display="flex" alignItems="flex-end">
        <Button
          variant="contained"
          size="medium"
          onClick={handleResetFilters}
          sx={{
            backgroundColor: colors.redAccent[500],
            '&:hover': {
              backgroundColor: colors.redAccent[600],
            }
          }}
        >
          Reset Filters
        </Button>
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
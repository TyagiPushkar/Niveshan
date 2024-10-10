import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel, TextField, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import SummarizeIcon from '@mui/icons-material/Summarize';

const Report = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetIssues, setAssetIssues] = useState([]);
  const [selectedTable, setSelectedTable] = useState("users");
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/users/get_users.php");
      const data = await response.json();
      setUsers(data.records);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch Assets Data
  const fetchAssets = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/assets/get_assets.php");
      const data = await response.json();
      setAssets(data.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Fetch Asset Issues Data
  const fetchAssetIssues = async () => {
    try {
      const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_issue.php");
      const data = await response.json();
      setAssetIssues(data.records);
    } catch (error) {
      console.error("Error fetching asset issues:", error);
    }
  };

  // Fetch all data when component mounts
  useEffect(() => {
    setLoading(true);
    fetchUsers();
    fetchAssets();
    fetchAssetIssues();
    setLoading(false);
  }, []);

  // Function to filter data based on date range
  const filterByDateRange = (data, dateField) => {
    if (!fromDate && !toDate) return data;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
  };

  // Export the selected table as CSV
  const exportCSV = () => {
    let csvData = [];
    let fileName = '';

    if (selectedTable === "users") {
      csvData = users.map(user => ({
        EmpId: user.EmpId,
        Name: user.Name,
        Mobile: user.Mobile,
        Email: user.Email,
        Role: user.Role,
        Status: user.Status,
        DateOfJoining: user.DateOfJoining
      }));
      fileName = 'users_report.csv';
    } else if (selectedTable === "assets") {
      csvData = assets.map(asset => ({
        AssetId: asset.AssetId,
        AssetName: asset.AssetName,
        AssetType: asset.AssetType,
        AssetCondition: asset.AssetCondition,
        Status: asset.Status,
        AddDateTime: asset.AddDateTime
      }));
      fileName = 'assets_report.csv';
    } else if (selectedTable === "assetIssues") {
      csvData = assetIssues.map(issue => ({
        EmpId: issue.EmpId,
        AssetID: issue.AssetID,
        Status: issue.Status,
        Remark: issue.Remark,
        IssueDate: issue.IssueDate,
        AcceptedDate: issue.AcceptedDate
      }));
      fileName = 'asset_issues_report.csv';
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  };

  // DataGrid Columns for each table
  const userColumns = [
    { field: "EmpId", headerName: "Emp ID", width: 120 },
    { field: "Name", headerName: "Name", flex: 1 },
    { field: "Mobile", headerName: "Mobile", flex: 1 },
    { field: "Email", headerName: "Email", flex: 1 },
    { field: "Role", headerName: "Role", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
    { field: "DateOfJoining", headerName: "Joining Date", flex: 1 },
  ];

  const assetColumns = [
    { field: "AssetId", headerName: "Asset ID", width: 120 },
    { field: "AssetType", headerName: "Type", flex: 1 },
    { field: "AssetName", headerName: "Name", flex: 1 },
    { field: "AssetCondition", headerName: "Condition", flex: 1 },
    { field: "Make", headerName: "Make", flex: 1 },
    { field: "Model", headerName: "Model", flex: 1 },
    { field: "SerialNo", headerName: "S/No.", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
  ];

  const assetIssueColumns = [
    { field: "EmpId", headerName: "Emp ID", width: 120 },
    { field: "AssetID", headerName: "Asset ID", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
    { field: "Remark", headerName: "Remark", flex: 1 },
    { field: "IssueDate", headerName: "Issue Date", flex: 1 },
    { field: "AcceptedDate", headerName: "Accepted Date", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Reports" subtitle="Download Reports" />
   <FormControl sx={{ minWidth: 200, marginBottom: "20px" }}>
        <InputLabel id="table-select-label">Select Table</InputLabel>
        <Select
          labelId="table-select-label"
          value={selectedTable}
          label="Select Table"
          onChange={(event) => setSelectedTable(event.target.value)}
        >
          <MenuItem value="users">Users</MenuItem>
          <MenuItem value="assets">Assets</MenuItem>
          <MenuItem value="assetIssues">Asset Issues</MenuItem>
        </Select>
      </FormControl>
        {/* Date Filters */}
        <Box display="flex" gap="10px">
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Export Button */}
        <Box
          width="20%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer" }}
          onClick={exportCSV}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Export Report as CSV
          </Typography>
          <SummarizeIcon sx={{ color: colors.grey[100] }} />
        </Box>
      </Box>

      {/* Dropdown for selecting which table to export */}
   

      {/* Data Grid */}
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
        {selectedTable === "users" && (
          <DataGrid
            rows={users.map((item, index) => ({ ...item, id: index + 1 }))}
            columns={userColumns}
            loading={loading}
          />
        )}
        {selectedTable === "assets" && (
          <DataGrid
            rows={assets.map((item, index) => ({ ...item, id: index + 1 }))}
            columns={assetColumns}
            loading={loading}
          />
        )}
        {selectedTable === "assetIssues" && (
          <DataGrid
            rows={assetIssues.map((item, index) => ({ ...item, id: index + 1 }))}
            columns={assetIssueColumns}
            loading={loading}
          />
        )}
      </Box>
    </Box>
  );
};

export default Report;

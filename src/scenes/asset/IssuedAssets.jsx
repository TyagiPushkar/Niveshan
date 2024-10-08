import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Devices } from "@mui/icons-material";

const IssuedAssets = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  // Fetch data from the API
  useEffect(() => {
    const fetchIssuedAssets = async () => {
      try {
        const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_issue.php");
        const data = await response.json();
        setIssuedAssets(data.records); // Assuming the issued assets data is under "records"
        setLoading(false);
      } catch (error) {
        console.error("Error fetching issued assets:", error);
        setLoading(false);
      }
    };

    fetchIssuedAssets();
  }, []);

  const columns = [
    { field: "EmpId", headerName: "Employee ID", width: 150 },
    { field: "AssetID", headerName: "Asset ID", width: 150 },
    {
      field: "Status",
      headerName: "Status",
      width: 120,
    },
    {
      field: "Remark",
      headerName: "Remark",
      flex: 1,
    },
    {
      field: "IssueDate",
      headerName: "Issue Date",
      width: 180,
    },
    {
      field: "AcceptedDate",
      headerName: "Accepted Date",
      width: 180,
    },
  ];
const handleRedirect = () => {
    navigate("/issue-new-asset"); // Redirect to the /form route for adding new assets
  };
  return (
    <Box m="20px">
      {/* Header */}
       <Box display="flex" justifyContent="space-between" alignItems="center">
      <Header title="ISSUED ASSETS" subtitle="List of Issued Assets" />
        <Box
          width="20%"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
          sx={{ cursor: "pointer" }}
          onClick={handleRedirect}
        >
          <Typography color={colors.grey[100]} sx={{ mr: "5px" }}>
            Issue Asset
          </Typography>
          <Devices sx={{ color: colors.grey[100] }} />
        </Box>
        </Box>
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
        <DataGrid
          rows={issuedAssets.map((item, index) => ({ ...item, id: index + 1 }))}
          columns={columns}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default IssuedAssets;

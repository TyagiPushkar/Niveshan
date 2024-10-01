import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Devices from "@mui/icons-material/Devices";
import Header from "../../components/Header";

const Asset = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/assets/get_assets.php");
        const data = await response.json();
        setAssetData(data.data); // Assuming the assets data is under "data"
        setLoading(false);
      } catch (error) {
        console.error("Error fetching asset data:", error);
        setLoading(false);
      }
    };

    fetchAssetData();
  }, []);

  const columns = [
    { field: "AssetId", headerName: "Asset ID", width: 120 },
    {
      field: "AssetType",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "AssetName",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "AssetCondition",
      headerName: "Condition",
      flex: 1,
    },
    {
      field: "Make",
      headerName: "Make",
      flex: 1,
    },
    {
      field: "Model",
      headerName: "Model",
      flex: 1,
    },
    {
      field: "SerialNo",
      headerName: "S/No.",
      flex: 1,
    },
    
    {
      field: "Quantity",
      headerName: "Qty",
      type: "number",
      width: 100,
    },
    
    {
      field: "VendorName",
      headerName: "Vendor",
      flex: 1,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
    },
  ];
 const handleRowClick = (params) => {
    navigate(`/asset/${params.row.AssetId}`); // Navigating to the detail page with AssetId
  };
  const handleRedirect = () => {
    navigate("/add-asset"); // Redirect to the /form route for adding new assets
  };

  return (
    <Box m="20px">
      {/* Header and Add New button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ASSETS" subtitle="Managing the Assets" />
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
            Add New
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
          checkboxSelection
          rows={assetData.map((item, index) => ({ ...item, id: index + 1 }))}
          columns={columns}
                  loading={loading}
                  onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default Asset;

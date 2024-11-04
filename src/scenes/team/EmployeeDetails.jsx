import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, useTheme, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const EmployeeDetails = () => {
  const { EmpId } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [employeeData, setEmployeeData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [assetDetail, setAssetDetail] = useState(null); // State to store asset detail
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch employee data by EmpId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/users/get_users.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setEmployeeData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      }
    };

    const fetchAssetsData = async () => {
      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_issue.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        const filteredAssets = data.records?.filter(
          (asset) => asset.Status === "Accepted" || asset.Status === "Issued"
        ) || [];
        setAssetsData(filteredAssets);
        setAssetsLoading(false);
      } catch (error) {
        console.error("Error fetching asset data:", error);
        setAssetsLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAssetsData();
  }, [EmpId]);

  // Fetch asset detail by assetId
  const fetchAssetDetail = async (assetId) => {
    try {
      const response = await fetch(
        `https://namami-infotech.com/NiveshanBackend/api/assets/get_assets.php?AssetId=${assetId}`
      );
      const data = await response.json();
      setAssetDetail(data.data[0]); // Assuming asset detail is under "data"
    } catch (error) {
      console.error("Error fetching asset detail:", error);
    }
  };

  // Function to open menu for asset
  const handleMenuOpen = (event, assetId) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssetId(assetId);
    fetchAssetDetail(assetId); // Fetch asset detail when menu opens
  };

  // Function to close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssetId(null);
  };

  // Update asset status to "In stock"
  const updateStatusToInStock = async () => {
    setUpdateLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/NiveshanBackend/api/assets/update_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AssetID: selectedAssetId,
            Status: "In stock",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setAssetsData((prevAssets) =>
          prevAssets.map((asset) =>
            asset.AssetID === selectedAssetId ? { ...asset, Status: "In stock" } : asset
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status.");
    } finally {
      setUpdateLoading(false);
      handleMenuClose();
    }
  };

  if (loading) {
    return <Typography>Loading employee data...</Typography>;
  }

  if (!employeeData) {
    return <Typography>No data found for EmpId: {EmpId}</Typography>;
  }

  return (
    <Box m="20px">
      <Header title="Employee Details" subtitle={`Details for EmpId: ${EmpId}`} />
      <Box mt="20px" p="20px" backgroundColor={colors.primary[400]} borderRadius="8px">
        <Typography variant="h6">Name: {employeeData.Name}</Typography>
        <Typography variant="h6">Mobile: {employeeData.Mobile}</Typography>
        <Typography variant="h6">Email: {employeeData.Email}</Typography>
        <Typography variant="h6">Designation: {employeeData.Role}</Typography>
        <Typography variant="h6">Status: {employeeData.Status}</Typography>
        <Typography variant="h6">Date of Joining: {employeeData.DateOfJoining}</Typography>
      </Box>

      <Box mt="20px">
        <Typography variant="h6" mb="10px">
          Issued Assets
        </Typography>

        {assetsLoading ? (
          <Typography>Loading assets data...</Typography>
        ) : assetsData.length > 0 ? (
          <Box p="20px" backgroundColor={colors.primary[400]} borderRadius="8px">
            <Grid container spacing={3}>
              {assetsData.map((asset) => (
                <Grid item xs={12} sm={6} md={4} key={asset.AssetID}>
                  <Box mb="15px" p="10px" backgroundColor={colors.blueAccent[700]} borderRadius="8px" sx={{display:'flex', justifyContent:'space-between'}}>
                    <div>
                      <Typography variant="subtitle1">
                        Asset ID:{" "}
                        <Link style={{ textDecoration: "none", color: "white" }} to={`/asset/${asset.AssetID}`}>
                          {asset.AssetID}
                        </Link>
                      </Typography>
                      <Typography variant="subtitle1">Asset Name: {assetDetail?.AssetName || asset.AssetName}</Typography>
                      <Typography variant="subtitle1">Status: {asset.Status}</Typography>
                      <Typography variant="subtitle1">Issue Date: {asset.IssueDate}</Typography>
                      <Typography variant="subtitle1">Accepted Date: {asset.AcceptedDate}</Typography>
                      <Typography variant="subtitle1">Remark: {asset.Remark}</Typography>
                    </div>
                    <IconButton
                      aria-controls="asset-menu"
                      aria-haspopup="true"
                      onClick={(e) => handleMenuOpen(e, asset.AssetID)}
                    >
                      <MoreVertIcon style={{ color: "white" }} />
                    </IconButton>
                    <Menu
                      id="asset-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl && selectedAssetId === asset.AssetID)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={updateStatusToInStock} disabled={updateLoading}>
                        Return Asset
                      </MenuItem>
                    </Menu>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography>No assets issued to this employee.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeDetails;

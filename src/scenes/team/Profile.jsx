import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [employeeData, setEmployeeData] = useState(null);
  const [assetsData, setAssetsData] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);

  // Fetch EmpId from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const EmpId = userDetails ? userDetails.EmpId : ""; // Fallback to empty if not found

  // Fetch employee data by EmpId
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!EmpId) {
        setLoading(false);
        return; // Exit if EmpId is not found
      }

      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/users/get_users.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setEmployeeData(data); // Assuming the API returns the employee data directly
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssetsData = async () => {
      if (!EmpId) {
        setAssetsLoading(false);
        return; // Exit if EmpId is not found
      }

      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_issue.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setAssetsData(data.records || []); // Ensure it's an array or empty
      } catch (error) {
        console.error("Error fetching asset data:", error);
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAssetsData();
  }, [EmpId]);

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
        <Typography variant="h6">Role: {employeeData.Role}</Typography>
        <Typography variant="h6">Status: {employeeData.Status}</Typography>
        <Typography variant="h6">Date of Joining: {employeeData.DateOfJoining}</Typography>
      </Box>

      {/* Issued Assets Section */}
      <Box mt="20px">
        <Typography variant="h6" mb="10px">
          Issued Assets
        </Typography>

        {assetsLoading ? (
          <Typography>Loading assets data...</Typography>
        ) : assetsData.length > 0 ? ( // Check if assetsData exists and has length
          <Box p="20px" backgroundColor={colors.primary[400]} borderRadius="8px">
            {assetsData.map((asset, index) => (
              <Box key={index} mb="15px" p="10px" backgroundColor={colors.blueAccent[700]} borderRadius="8px">
                <Typography variant="subtitle1">Asset ID: {asset.AssetID}</Typography>
                <Typography variant="subtitle1">Asset Name: {asset.AssetName}</Typography>
                <Typography variant="subtitle1">Status: {asset.Status}</Typography>
                <Typography variant="subtitle1">Issue Date: {asset.IssueDate}</Typography>
                <Typography variant="subtitle1">Accepted Date: {asset.AcceptedDate}</Typography>
                <Typography variant="subtitle1">Remark: {asset.Remark}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No assets issued to this employee.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Profile;

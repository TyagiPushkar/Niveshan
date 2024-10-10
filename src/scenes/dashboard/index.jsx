import { Box, Button, IconButton, Typography, useTheme, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import PieChart from "../../components/PieChart";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [dashboardData, setDashboardData] = useState({
    assetStats: {},
    ticketStats: {},
    assetDetails: [],
    ticketDetails: [],
  });
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [pieChartData, setPieChartData] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://namami-infotech.com/NiveshanBackend/api/Dashboard/dashboard.php");
        const data = await response.json();
        setDashboardData(data);

        // Set default selected asset name to "Laptop"
        const defaultAssetName = "Laptop";
        setSelectedAssetName(defaultAssetName);

        // Filter assets for default selection
        const filteredAssets = data.assetDetails.filter(
          (asset) => asset.AssetName === defaultAssetName
        );

        const statusCounts = {
          Live: 0,
          Faulty: 0,
          "In Stock": 0,
        };

        filteredAssets.forEach((asset) => {
          statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
        });

        const pieData = Object.entries(statusCounts).map(([key, value]) => ({
          id: key,
          label: `${key} (${value})`, // Update label to include count
          value,
        }));

        setPieChartData(pieData);
      } catch (error) {
        console.error("Error fetching the dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAssetNameChange = (event) => {
    const selectedName = event.target.value;
    setSelectedAssetName(selectedName);

    const filteredAssets = dashboardData.assetDetails.filter(
      (asset) => asset.AssetName === selectedName
    );

    const statusCounts = {
      Live: 0,
      Faulty: 0,
      "In Stock": 0,
    };

    filteredAssets.forEach((asset) => {
      statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
    });

    const pieData = Object.entries(statusCounts).map(([key, value]) => ({
      id: key,
      label: `${key} (${value})`, // Update label to include count
      value,
    }));

    setPieChartData(pieData);
  };

  const assetNames = [...new Set(dashboardData.assetDetails.map(asset => asset.AssetName))];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        {/* <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box> */}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px">
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dashboardData.ticketStats.totalTickets || 0}
            subtitle="Total Tickets"
            icon={<EmailIcon sx={{ color: colors.greenAccent[600] }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dashboardData.assetStats.liveAssets || 0}
            subtitle="Live Assets"
            icon={<PointOfSaleIcon sx={{ color: colors.greenAccent[600] }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dashboardData.assetStats.retiredAssets || 0}
            subtitle="Retired Assets"
            icon={<PersonAddIcon sx={{ color: colors.greenAccent[600] }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dashboardData.assetStats.inStockAssets || 0}
            subtitle="In-Stock Assets"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600] }} />}
          />
        </Box>

        <Box gridColumn="span 8" gridRow="span 3" backgroundColor={colors.primary[400]}>
          <Box mt="25px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                Asset Distribution
              </Typography>
              <Select
                value={selectedAssetName}
                onChange={handleAssetNameChange}
                displayEmpty
                // sx={{
                //   color: colors.grey[100],
                //   bgcolor: colors.primary[500]
                // }}
              >
                <MenuItem value="" disabled>Select Asset Name</MenuItem>
                {assetNames.length > 0 ? (
                  assetNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Asset Names Available</MenuItem>
                )}
              </Select>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon sx={{ fontSize: "26px", color: colors.greenAccent[500] }} />
              </IconButton>
            </Box>
          </Box>
          <Box height="300px" m="-20px 0 0 0">
            <PieChart pieData={pieChartData} />
          </Box>
        </Box>

        <Box gridColumn="span 4" gridRow="span 3" backgroundColor={colors.primary[400]} overflow="auto">
          <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} colors={colors.grey[100]} p="15px">
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Open Tickets
            </Typography>
          </Box>
          {dashboardData.ticketDetails.map((transaction, i) => (
            <Box
              key={`${transaction.id}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                  {transaction.id}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.Category}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.DateTime}</Box>
              <Box 
                backgroundColor={colors.greenAccent[500]} 
                p="5px 10px" 
                borderRadius="4px"
                onClick={() => navigate(`/support/${transaction.id}`)} // Navigate to the ticket details
                sx={{ cursor: 'pointer' }} // Change cursor to pointer
              >
                {transaction.Status}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

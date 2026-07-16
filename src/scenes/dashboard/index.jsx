import {
  Box,
  Typography,
  useTheme,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import EmailIcon from "@mui/icons-material/Email";
import DevicesIcon from "@mui/icons-material/Devices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    assetStats: {},
    ticketStats: {},
    assetDetails: [],
    ticketDetails: [],
  });
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/NiveshanBackend/api/Dashboard/dashboard.php"
        );
        const data = await response.json();
        setDashboardData(data);

        const defaultAssetName = "Laptop";
        setSelectedAssetName(defaultAssetName);

        const filteredAssets = data.assetDetails.filter(
          (asset) => asset.AssetName === defaultAssetName
        );

        const statusCounts = {
          Live: 0,
          Faulty: 0,
        };

        filteredAssets.forEach((asset) => {
          statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
        });

        const pieData = Object.entries(statusCounts).map(([key, value]) => ({
          id: key,
          label: `${key} (${value})`,
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
    };

    filteredAssets.forEach((asset) => {
      statusCounts[asset.Status] = (statusCounts[asset.Status] || 0) + 1;
    });

    const pieData = Object.entries(statusCounts).map(([key, value]) => ({
      id: key,
      label: `${key} (${value})`,
      value,
    }));

    setPieChartData(pieData);
  };

  const assetNames = [
    ...new Set(dashboardData.assetDetails.map((asset) => asset.AssetName)),
  ];

  const openTickets = dashboardData.ticketDetails.filter(
    (ticket) => ticket.Status === "Open"
  );

  return (
    <Box
      m="0 0 0 20px"
      height="calc(100vh - 75px)"
      display="flex"
      flexDirection="column"
      sx={{ overflowY: "auto", pr: "20px" }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* Summary Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
        gap="20px"
        mt="10px"
      >
        {/* Total Assets */}
        <Box
          onClick={() => navigate("/asset")}
          sx={{
            cursor: "pointer",
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `5px solid ${colors.blueAccent[500]}`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
            }
          }}
        >
          <Box>
            <Typography variant="h6" color={colors.grey[300]} fontWeight="500">
              Total Assets
            </Typography>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mt="5px">
              {dashboardData.assetStats.totalAssets || 0}
            </Typography>
          </Box>
          <DevicesIcon sx={{ color: colors.blueAccent[500], fontSize: "40px" }} />
        </Box>

        {/* Live Assets */}
        <Box
          onClick={() => navigate("/asset?status=Live")}
          sx={{
            cursor: "pointer",
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `5px solid ${colors.greenAccent[500]}`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
            }
          }}
        >
          <Box>
            <Typography variant="h6" color={colors.grey[300]} fontWeight="500">
              Live Assets
            </Typography>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mt="5px">
              {dashboardData.assetStats.liveAssets || 0}
            </Typography>
          </Box>
          <CheckCircleIcon sx={{ color: colors.greenAccent[500], fontSize: "40px" }} />
        </Box>

        {/* In Stock Assets */}
        <Box
          onClick={() => navigate("/asset?status=In Stock")}
          sx={{
            cursor: "pointer",
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `5px solid #e2b13c`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
            }
          }}
        >
          <Box>
            <Typography variant="h6" color={colors.grey[300]} fontWeight="500">
              In Stock Assets
            </Typography>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mt="5px">
              {dashboardData.assetStats.inStockAssets || 0}
            </Typography>
          </Box>
          <InventoryIcon sx={{ color: "#e2b13c", fontSize: "40px" }} />
        </Box>

        {/* Faulty Assets */}
        <Box
          onClick={() => navigate("/asset?status=Faulty")}
          sx={{
            cursor: "pointer",
            backgroundColor: colors.primary[400],
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `5px solid ${colors.redAccent[500]}`,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
            }
          }}
        >
          <Box>
            <Typography variant="h6" color={colors.grey[300]} fontWeight="500">
              Faulty Assets
            </Typography>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mt="5px">
              {dashboardData.assetStats.faultyAssets || 0}
            </Typography>
          </Box>
          <WarningIcon sx={{ color: colors.redAccent[500], fontSize: "40px" }} />
        </Box>
      </Box>

      {/* Visualizations and Tickets */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
        mt="20px"
        mb="20px"
      >
        {/* Pie Chart */}
        <Box
          gridColumn={{ xs: "span 12", md: "span 8" }}
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          p="20px"
          display="flex"
          flexDirection="column"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px">
            <Box>
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                Asset Distribution
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                Breakdown of asset statuses
              </Typography>
            </Box>
            <Select
              value={selectedAssetName}
              onChange={handleAssetNameChange}
              displayEmpty
              size="small"
              sx={{
                color: colors.grey[100],
                bgcolor: colors.primary[500],
                borderRadius: "4px",
                minWidth: "150px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Asset Name
              </MenuItem>
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
          <Box height="300px" m="-20px 0 0 0">
            <PieChart
              pieData={pieChartData}
              assetDetails={dashboardData.assetDetails}
            />
          </Box>
        </Box>

        {/* Support Tickets */}
        <Box
          gridColumn={{ xs: "span 12", md: "span 4" }}
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          p="20px"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="15px"
            borderBottom={`1px solid ${colors.primary[500]}`}
            pb="10px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Support Tickets Summary
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap="15px" flexGrow={1} justifyContent="center">
            {/* Total Tickets */}
            <Box
              onClick={() => navigate("/support-ticket")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderRadius: "6px",
                backgroundColor: colors.primary[500],
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: colors.primary[300],
                }
              }}
            >
              <Box display="flex" alignItems="center" gap="15px">
                <EmailIcon sx={{ color: colors.blueAccent[500], fontSize: "28px" }} />
                <Typography variant="h6" color={colors.grey[100]} fontWeight="500">
                  Total Tickets
                </Typography>
              </Box>
              <Typography variant="h4" color={colors.blueAccent[500]} fontWeight="bold">
                {dashboardData.ticketStats.totalTickets || 0}
              </Typography>
            </Box>

            {/* Open Tickets */}
            <Box
              onClick={() => navigate("/support-ticket?status=Open")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderRadius: "6px",
                backgroundColor: colors.primary[500],
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: colors.primary[300],
                }
              }}
            >
              <Box display="flex" alignItems="center" gap="15px">
                <EmailIcon sx={{ color: colors.redAccent[500], fontSize: "28px" }} />
                <Typography variant="h6" color={colors.grey[100]} fontWeight="500">
                  Open Tickets
                </Typography>
              </Box>
              <Typography variant="h4" color={colors.redAccent[500]} fontWeight="bold">
                {dashboardData.ticketStats.openTickets || 0}
              </Typography>
            </Box>

            {/* Resolved Tickets */}
            <Box
              onClick={() => navigate("/support-ticket?status=Resolved")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 20px",
                borderRadius: "6px",
                backgroundColor: colors.primary[500],
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: colors.primary[300],
                }
              }}
            >
              <Box display="flex" alignItems="center" gap="15px">
                <EmailIcon sx={{ color: colors.greenAccent[500], fontSize: "28px" }} />
                <Typography variant="h6" color={colors.grey[100]} fontWeight="500">
                  Resolved Tickets
                </Typography>
              </Box>
              <Typography variant="h4" color={colors.greenAccent[500]} fontWeight="bold">
                {dashboardData.ticketStats.resolvedTickets || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

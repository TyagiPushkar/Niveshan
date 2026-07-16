import { Box, IconButton, useTheme, Menu, MenuItem, Modal, TextField, Button, Typography, Divider } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown menu
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [newPassword, setNewPassword] = useState(""); // New password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};
  const EmpId = userDetails.EmpId; // Get EmpId from localStorage
  const { Name, Role } = userDetails;

  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!EmpId) return;
      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/users/get_users.php?EmpId=${EmpId}`
        );
        const data = await response.json();
        setEmployeeData(data);
      } catch (error) {
        console.error("Error fetching employee data in Topbar:", error);
      }
    };
    fetchEmployeeData();
  }, [EmpId]);

  // Function to handle menu opening
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.clear(); // Clear local storage
    navigate("/login"); // Redirect to login
  };


  const handleChangePassword = () => {
    // Ensure passwords match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Prepare data for API call
    const data = {
      EmpId,
      Password: newPassword,
    };

    // API call to update password
    fetch("https://namami-infotech.com/NiveshanBackend/api/users/update_password.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message === "Password updated successfully.") {
          alert("Password updated successfully.");
          setOpenModal(false); // Close modal on success
        } else {
          alert("Failed to update password.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      p="10px 20px" 
      backgroundColor={colors.primary[400]}
      boxShadow="0px 4px 8px rgba(0, 0, 0, 0.15)"
      position="relative"
      zIndex={10}
      borderRadius="0px"
      mb="15px"
    >
      <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
        {/* <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>

      {/* ICONS */}
      <Box display="flex">
        {/* <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton> */}

        <IconButton onClick={handleMenuClick}>
          <PersonOutlinedIcon />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              width: "300px",
              padding: "15px",
              backgroundColor: colors.primary[400],
              backgroundImage: "none",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
            }
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb="15px">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="60px"
              height="60px"
              borderRadius="50%"
              bgcolor={colors.blueAccent[500]}
              color={colors.grey[100]}
              mb="10px"
            >
              <PersonOutlinedIcon style={{ fontSize: "35px" }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} textAlign="center">
              {employeeData?.Name || Name || "User"}
            </Typography>
            <Typography variant="subtitle2" color={colors.greenAccent[500]}>
              {employeeData?.Role || Role || "Role"}
            </Typography>
          </Box>

          <Divider sx={{ my: "10px", borderColor: colors.grey[700] }} />

          <Box display="flex" flexDirection="column" gap="10px" py="5px">
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color={colors.grey[300]}>Emp ID:</Typography>
              <Typography variant="body2" fontWeight="bold" color={colors.grey[100]}>{EmpId || "N/A"}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color={colors.grey[300]}>Email:</Typography>
              <Typography variant="body2" fontWeight="bold" color={colors.grey[100]} sx={{ wordBreak: "break-all" }}>
                {employeeData?.Email || "N/A"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color={colors.grey[300]}>Mobile:</Typography>
              <Typography variant="body2" fontWeight="bold" color={colors.grey[100]}>{employeeData?.Mobile || "N/A"}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color={colors.grey[300]}>Joining Date:</Typography>
              <Typography variant="body2" fontWeight="bold" color={colors.grey[100]}>
                {employeeData?.DateOfJoining || "N/A"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color={colors.grey[300]}>Status:</Typography>
              <Typography variant="body2" fontWeight="bold" color={colors.grey[100]}>{employeeData?.Status || "N/A"}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: "10px", borderColor: colors.grey[700] }} />

          <Box display="flex" flexDirection="column" gap="8px" mt="5px">
            <MenuItem 
              onClick={() => {
                setOpenModal(true);
                handleMenuClose();
              }}
              sx={{ 
                borderRadius: "4px",
                justifyContent: "center",
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.blueAccent[600]
                }
              }}
            >
              Change Password
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleLogout();
                handleMenuClose();
              }}
              sx={{ 
                borderRadius: "4px",
                justifyContent: "center",
                backgroundColor: colors.redAccent[600],
                color: "white",
                "&:hover": {
                  backgroundColor: colors.redAccent[500]
                }
              }}
            >
              Logout
            </MenuItem>
          </Box>
        </Menu>
        {/* <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton> */}
      </Box>

      {/* Modal for Change Password */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="change-password-modal"
        aria-describedby="modal-to-change-password"
      >
        <Box
          sx={{
            width: 400,
            backgroundColor: "black",
            padding: 4,
            borderRadius: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h2>Change Password</h2>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Topbar;

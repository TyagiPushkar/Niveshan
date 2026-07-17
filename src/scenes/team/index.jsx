import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { DataGrid, useGridApiContext } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Header from "../../components/Header";

const ResizableHeader = ({ params, columnWidths, setColumnWidths, colors }) => {
  const apiRef = useGridApiContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 2) return; // Allow both left click (0) and right click (2)
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = params.colDef.computedWidth || params.colDef.width || 100;

    const preventContextMenu = (contextEvent) => {
      contextEvent.preventDefault();
      contextEvent.stopPropagation();
    };

    const handleMouseMove = (moveEvent) => {
      const currentWidth = startWidth + (moveEvent.clientX - startX);
      const newWidth = Math.max(50, currentWidth);

      if (apiRef && apiRef.current && apiRef.current.setColumnWidth) {
        apiRef.current.setColumnWidth(params.field, newWidth);
      }
    };

    const handleMouseUp = (moveEvent) => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Temporarily keep preventContextMenu active until this event cycle finishes
      setTimeout(() => {
        document.removeEventListener("contextmenu", preventContextMenu, true);
      }, 50);

      // Prevent the next click event from triggering sorting if dragging actually occurred
      const preventClick = (clickEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        document.removeEventListener("click", preventClick, true);
      };

      if (Math.abs(moveEvent.clientX - startX) > 2) {
        document.addEventListener("click", preventClick, true);
      }

      const finalWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      setColumnWidths((prev) => ({
        ...prev,
        [params.field]: finalWidth,
      }));
    };

    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      height="100%"
      sx={{
        pr: "12px",
      }}
    >
      <Typography fontWeight="bold" sx={{ color: colors.grey[100] }}>
        {params.colDef.headerName}
      </Typography>
      <Box
        className="resize-handle"
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "12px",
          cursor: "col-resize",
          zIndex: 100,
          height: "100%",
          backgroundColor: "transparent",
          borderRight: "2px solid transparent",
          borderColor: isDragging ? colors.greenAccent[500] : "transparent",
          transition: "border-color 0.2s ease",
        }}
      />
    </Box>
  );
};

const Team = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    EmpId: "",
    Name: "",
    Mobile: "",
    Email: "",
    Role: "",
    Functions: "",
    Status: "",
  });

  const [columnWidths, setColumnWidths] = useState({
    EmpId: 80,
    Name: 160,
    Mobile: 100,
    Email: 220,
    Role: 150,
    RM_Name: 150,
  //  RM_Mail: 200,
    Status: 100,
    DateOfJoining: 100,
    Actions: 180,
  });

  // Fetch data from the API
  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/NiveshanBackend/api/users/get_users.php"
      );
      const data = await response.json();

      // Standardize DateOfJoining format to dd-mm-yyyy
      const formattedData = data.records.map((item) => ({
        ...item,
        DateOfJoining: formatDate(item.DateOfJoining),
      }));

      setTeamData(formattedData); // Use formatted data
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const normalizedDateString = dateString.replace(/\//g, "-");
    const dateParts = normalizedDateString.split("-");
    if (dateParts[0].length === 4) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    return normalizedDateString;
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleEditClick = (rowData) => {
    setEditData(rowData);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        "https://namami-infotech.com/NiveshanBackend/api/users/edit_user.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );
      const result = await response.json();
      if (result.message.includes("User details were updated")) {
        alert("Employee updated successfully.");
        fetchTeamData();
        setOpenEditDialog(false);
      } else {
        alert("Failed to update employee.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleRowClick = (params) => {
    navigate(`/employee/${params.row.EmpId}`);
  };

  const handleToggleUserStatus = (empId, isCurrentlyActive) => {
    const data = { EmpId: empId };
    fetch(
      "https://namami-infotech.com/NiveshanBackend/api/users/deactivate_user.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.message.includes("User status updated")) {
          alert(result.message);
          fetchTeamData();
        } else {
          alert("Failed to update user status.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  };

  const filteredTeamData = teamData.filter((item) => {
    const name = item.Name || ""; // Default to an empty string if null
    const mobile = item.Mobile || ""; // Default to an empty string if null
    const email = item.Email || ""; // Default to an empty string if null
    const role = item.Role || ""; // Default to an empty string if null
    const functions = item.Functions || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      functions.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      field: "EmpId",
      headerName: "EmpId",
      width: columnWidths.EmpId,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "Name",
      headerName: "Name",
      width: columnWidths.Name,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "Mobile",
      headerName: "Mobile",
      width: columnWidths.Mobile,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "Email",
      headerName: "Email",
      width: columnWidths.Email,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "Role",
      headerName: "Designation",
      width: columnWidths.Role,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "RM_Name",
      headerName: "RM Name",
      width: columnWidths.RM_Name,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    // {
    //   field: "RM_Mail",
    //   headerName: "RM Mail",
    //   width: columnWidths.RM_Mail,
    //   renderHeader: (params) => (
    //     <ResizableHeader
    //       params={params}
    //       columnWidths={columnWidths}
    //       setColumnWidths={setColumnWidths}
    //       colors={colors}
    //     />
    //   ),
    // },
    {
      field: "Status",
      headerName: "Status",
      width: columnWidths.Status,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "DateOfJoining",
      headerName: "Date of Joining",
      width: columnWidths.DateOfJoining,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: columnWidths.Actions,
      renderHeader: (params) => (
        <ResizableHeader
          params={params}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          colors={colors}
        />
      ),
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleRowClick(params)}>
            <VisibilityOutlinedIcon style={{ color: colors.blueAccent[500] }} />
          </IconButton>
          <IconButton onClick={() => handleEditClick(params.row)}>
            <EditOutlinedIcon style={{ color: colors.greenAccent[500] }} />
          </IconButton>
          <Switch
            checked={params.row.Status === "Active"}
            onChange={() =>
              handleToggleUserStatus(
                params.row.EmpId,
                params.row.Status === "Active",
              )
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: colors.greenAccent[500],
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: colors.greenAccent[500],
              },
            }}
          />
        </>
      ),
    },
  ];

  return (
    <Box m="0 0 0 20px" height="calc(100vh - 75px)" display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px">
        <Header title="TEAM" subtitle="Managing the Team Members" />
        <Box display="flex" alignItems="center" gap="15px">
          <TextField
            label="Search team..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
            sx={{ width: "250px" }}
          />
          <Button
            variant="contained"
            onClick={() => navigate("/add-employee")}
            startIcon={<PersonOutlinedIcon />}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "8px 16px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
              },
            }}
          >
            Add New
          </Button>
        </Box>
      </Box>
      <Box
        flexGrow={1}
        minHeight={0}
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
          "& .MuiDataGrid-columnHeader": {
            borderRight: `1px solid ${colors.primary[500]}`,
            position: "relative",
          },
          "& .MuiDataGrid-columnHeader:last-child": {
            borderRight: "none",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none !important",
          },
          "& .MuiDataGrid-columnSeparatorContainer": {
            display: "none !important",
            pointerEvents: "none !important",
          },
          "& .MuiDataGrid-columnHeaderDraggableContainer": {
            width: "100%",
            position: "static !important",
          },
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            width: "100%",
            maxWidth: "100%",
            position: "static !important",
          },
          "& .MuiDataGrid-columnHeaderTitleContainerContent": {
            width: "100%",
            position: "static !important",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            width: "100%",
            display: "block",
            position: "static !important",
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
          rows={filteredTeamData.map((item, index) => ({
            ...item,
            id: index + 1,
          }))}
          columns={columns}
          loading={loading}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[500],
            backgroundImage: "none",
            color: colors.grey[100],
          },
        }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>Edit Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editData.Name}
            onChange={(e) => setEditData({ ...editData, Name: e.target.value })}
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          />
          <TextField
            label="Mobile"
            fullWidth
            margin="dense"
            value={editData.Mobile}
            onChange={(e) =>
              setEditData({ ...editData, Mobile: e.target.value })
            }
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={editData.Email}
            onChange={(e) =>
              setEditData({ ...editData, Email: e.target.value })
            }
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          />
          <TextField
            label="Designation"
            fullWidth
            margin="dense"
            value={editData.Role}
            onChange={(e) => setEditData({ ...editData, Role: e.target.value })}
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          />
          <TextField
            label="Department"
            fullWidth
            margin="dense"
            value={editData.Functions}
            onChange={(e) =>
              setEditData({ ...editData, Functions: e.target.value })
            }
            InputLabelProps={{
              style: { color: colors.grey[100] },
            }}
            InputProps={{
              style: {
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
              },
            }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: colors.greenAccent[700],
                },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Team;

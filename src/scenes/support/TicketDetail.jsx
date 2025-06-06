"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Header from "../../components/Header";

// Define color constants
const COLORS = {
  primary: {
    400: "#1F2A40",
    500: "#141b2d",
    600: "#101624",
    700: "#0c101b",
  },
  greenAccent: {
    400: "#70d8bd",
    500: "#4cceac",
    600: "#3da58a",
  },
  redAccent: {
    500: "#db4f4a",
    600: "#d32f2f",
    700: "#c62828",
  },
  blueAccent: {
    200: "#c3c6fd",
    500: "#6870fa",
    600: "#535ac8",
    700: "#3f4396",
    800: "#2a2d64",
  },
  orangeAccent: {
    500: "#ff9800",
    600: "#fb8c00",
    700: "#f57c00",
  },
  grey: {
    100: "#e0e0e0",
    300: "#a3a3a3",
    400: "#858585",
    500: "#666666",
    700: "#3d3d3d",
  },
  white: "#ffffff",
};

const TicketDetail = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [updateLogs, setUpdateLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [forwardImage, setForwardImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get user details from local storage
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  // Define status options based on role and category
  const getStatusOptions = () => {
    const { Role, EmpId } = userDetails;
    const category = ticket?.Category;
    const status = ticket?.Status;

    let options = [];

    // Allow the user who raised the ticket to reopen it if it's resolved
    if (status === "Resolved" && ticket.EmpId === EmpId) {
      options.push("Reopen");
    }

    // Allow the user who raised the ticket to accept or reject UAT if L2 offered it
    if (status === "Offer UAT" && ticket.EmpId === EmpId) {
      options.push("Accept UAT", "Reject UAT");
    }

    if (
      Role === "Admin" &&
      (category === "Hardware" || category === "Software")
    ) {
      // Admin can resolve tickets that are Open or Reopen
      if (status === "Open" || status === "Reopen") {
        options = ["Resolved"];
      }
    } else if (Role === "ERPADMIN" && category === "ERP365") {
      // ERPADMIN can resolve or forward to L2 when status is Open or Reopen
      if (status === "Open" || status === "Reopen") {
        options = ["Resolved", "Forward to L2"];
      }
      // ERPADMIN can take actions after UAT acceptance or rejection
      else if (status === "Accept UAT" || status === "Reject UAT") {
        options = ["Resolved", "Forward to L2", "Offer UAT"];
      }
    } else if (Role === "L2") {
      options = ["Resolved"];
      if (status !== "Assign To OEM") {
        options.push("Assign To OEM");
      }
      options.push("Offer UAT");

      // Allow L2 to mark as Deployed UAT after user accepts UAT
      if (status === "Accept UAT") {
        options.push("Deployed UAT");
      }
    }

    return options;
  };

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/support/get_ticket.php?id=${id}`
        );
        const data = await response.json();

        if (response.ok) {
          if (
            userDetails.Role !== "Admin" &&
            userDetails.Role !== "ERPADMIN" &&
            userDetails.Role !== "L2" &&
            data.EmpId !== userDetails.EmpId
          ) {
            setError("You are not authorized to view this ticket.");
          } else {
            setTicket(data);
          }
        } else {
          setError(data.message || "Error fetching ticket details");
        }
      } catch (error) {
        setError("Failed to fetch ticket details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id, userDetails.EmpId, userDetails.Role]);

  // Fetch update logs
  useEffect(() => {
    const fetchUpdateLogs = async () => {
      if (!ticket) return;

      try {
        const response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/support/get_updates.php?ticketId=${ticket.id}`
        );
        const data = await response.json();

        if (response.ok) {
          setUpdateLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch update logs:", error);
      }
    };

    fetchUpdateLogs();
  }, [ticket]);

  const handleImageOpen = () => {
    if (ticket.Image) {
      window.open(ticket.Image, "_blank");
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !remark.trim()) {
      alert("Please select a status and provide a remark.");
      return;
    }

    setIsUpdating(true);

    try {
      let response;

      if (selectedStatus === "Forward to L2") {
        const formData = new FormData();
        formData.append("id", ticket.id);
        formData.append("Status", selectedStatus);
        formData.append("Update_remark", remark);
        formData.append("UpdateBy", userDetails.EmpId);
        if (forwardImage) {
          formData.append("image", forwardImage);
        }

        response = await fetch(
          "https://namami-infotech.com/NiveshanBackend/api/support/update_status_with_subticket.php",
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/support/update_ticket.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: ticket.id,
              Status: selectedStatus,
              Update_remark: remark,
              UpdateBy: userDetails.EmpId,
            }),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        setTicket((prevTicket) => ({
          ...prevTicket,
          Status: selectedStatus,
          UpdateDateTime: new Date().toISOString(),
          Update_remark: remark,
        }));

        // Refresh update logs
        const logsResponse = await fetch(
          `https://namami-infotech.com/NiveshanBackend/api/support/get_updates.php?ticketId=${ticket.id}`
        );
        const logsData = await logsResponse.json();
        if (logsResponse.ok) {
          setUpdateLogs(logsData);
        }

        alert(`Ticket ${selectedStatus.toLowerCase()} successfully.`);
        setSelectedStatus("");
        setRemark("");
        setForwardImage(null);
      } else {
        alert(data.message || "Failed to update the ticket.");
      }
    } catch (error) {
      alert("Failed to update the ticket. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
        <Typography ml={2}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const statusOptions = getStatusOptions();
  const canUpdateTicket = statusOptions.length > 0;

  return (
    <Box m="20px">
      <Header title={`Ticket ID: ${ticket.id}`} subtitle="Ticket Details" />

      <Box display="flex" gap="20px" flexWrap="wrap">
        {/* Ticket Details */}
        <Box flex="1" minWidth="400px">
          <Card sx={{ backgroundColor: COLORS.primary[400] }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                color={COLORS.greenAccent[500]}
              >
                Ticket Information
              </Typography>

              <Box
                display="grid"
                gridTemplateColumns="150px 1fr"
                rowGap={2}
                columnGap={2}
              >
                <Typography variant="h6" fontWeight="bold">
                  Employee ID:
                </Typography>
                <Typography variant="h6">{ticket.EmpId}</Typography>

                <Typography variant="h6" fontWeight="bold">
                  Category:
                </Typography>
                <Typography variant="h6">{ticket.Category}</Typography>

                <Typography variant="h6" fontWeight="bold">
                  Status:
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    ticket.Status === "Resolved"
                      ? COLORS.greenAccent[500]
                      : ticket.Status === "Offer UAT"
                      ? COLORS.blueAccent[500]
                      : ticket.Status === "Accept UAT"
                      ? COLORS.orangeAccent[500]
                      : ticket.Status === "Reject UAT"
                      ? COLORS.redAccent[500]
                      : ticket.Status === "Deployed UAT"
                      ? COLORS.greenAccent[400]
                      : ticket.Status === "Reopen"
                      ? COLORS.orangeAccent[600]
                      : COLORS.redAccent[500]
                  }
                >
                  {ticket.Status}
                </Typography>

                <Typography variant="h6" fontWeight="bold">
                  Date Created:
                </Typography>
                <Typography variant="h6">
                  {new Date(ticket.DateTime).toLocaleString()}
                </Typography>

                <Typography variant="h6" fontWeight="bold">
                  Last Updated:
                </Typography>
                <Typography variant="h6">
                  {new Date(ticket.UpdateDateTime).toLocaleString()}
                </Typography>
              </Box>

              <Box mt="20px">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Original Remark:
                </Typography>
                <Box
                  sx={{
                    backgroundColor: COLORS.primary[500],
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${COLORS.grey[700]}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: ticket.Remark }}
                />
              </Box>

              {ticket.Update_remark && (
                <Box mt="20px">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Latest Update Remark:
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: COLORS.primary[500],
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.grey[700]}`,
                    }}
                    dangerouslySetInnerHTML={{ __html: ticket.Update_remark }}
                  />
                </Box>
              )}

              {ticket.Image && (
                <Box mt="20px">
                  <Button
                    variant="contained"
                    onClick={handleImageOpen}
                    sx={{ backgroundColor: COLORS.greenAccent[600] }}
                  >
                    View Attachment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Update Logs */}
        <Box flex="1" minWidth="400px">
          <Card sx={{ backgroundColor: COLORS.primary[400] }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                color={COLORS.greenAccent[500]}
              >
                Update History
              </Typography>

              {updateLogs.length > 0 ? (
                <Box maxHeight="400px" overflow="auto">
                  {updateLogs.map((log, index) => (
                    <Box key={log.Id} mb={2}>
                      <Box
                        sx={{
                          backgroundColor: COLORS.primary[500],
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.grey[700]}`,
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color={
                              log.Status === "Resolved"
                                ? COLORS.greenAccent[500]
                                : log.Status === "Offer UAT"
                                ? COLORS.blueAccent[500]
                                : log.Status === "Accept UAT"
                                ? COLORS.orangeAccent[500]
                                : log.Status === "Reject UAT"
                                ? COLORS.redAccent[500]
                                : log.Status === "Deployed UAT"
                                ? COLORS.greenAccent[400]
                                : log.Status === "Reopen"
                                ? COLORS.orangeAccent[600]
                                : COLORS.redAccent[500]
                            }
                          >
                            {log.Status}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={COLORS.grey[300]}
                          >
                            {new Date(log.DateTime).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box dangerouslySetInnerHTML={{ __html: log.Remark }} />

                        {log.Image && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(log.Image, "_blank")}
                            sx={{ mt: 1, borderColor: COLORS.greenAccent[500] }}
                          >
                            View Image
                          </Button>
                        )}
                      </Box>
                      {index < updateLogs.length - 1 && (
                        <Divider
                          sx={{ mt: 2, backgroundColor: COLORS.grey[700] }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color={COLORS.grey[300]}>
                  No update history available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Update Ticket Section */}
      {canUpdateTicket && (
        <Box mt="20px">
          <Card sx={{ backgroundColor: COLORS.primary[400] }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                color={COLORS.greenAccent[500]}
              >
                Update Ticket
              </Typography>

              {/* Reopen Status Information */}
              {ticket.Status === "Reopen" && userDetails.Role === "Admin" && (
                <Box
                  mb="20px"
                  p="15px"
                  sx={{
                    backgroundColor: COLORS.orangeAccent[700],
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" color={COLORS.white} gutterBottom>
                    Ticket Reopened
                  </Typography>
                  <Typography variant="body2" color={COLORS.grey[100]}>
                    This ticket has been reopened by the user. You can now
                    resolve it again after addressing the concerns.
                  </Typography>
                </Box>
              )}

              {/* UAT Status Information */}
              {(ticket.Status === "Offer UAT" ||
                ticket.Status === "Accept UAT" ||
                ticket.Status === "Reject UAT") && (
                <Box
                  mb="20px"
                  p="15px"
                  sx={{
                    backgroundColor: COLORS.blueAccent[800],
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    color={COLORS.blueAccent[200]}
                    gutterBottom
                  >
                    UAT Workflow Status
                  </Typography>
                  <Typography variant="body2" color={COLORS.grey[300]}>
                    {ticket.Status === "Offer UAT" &&
                      ticket.EmpId === userDetails.EmpId &&
                      "L2 has offered UAT for this ticket. You can accept or reject it based on your testing requirements."}
                    {ticket.Status === "Accept UAT" &&
                      userDetails.Role === "L2" &&
                      "User has accepted UAT. You can mark it as deployed once testing is complete."}
                    {ticket.Status === "Accept UAT" &&
                      userDetails.Role === "ERPADMIN" &&
                      "User has accepted UAT. You can resolve the ticket, forward to L2, or offer UAT again if needed."}
                    {ticket.Status === "Reject UAT" &&
                      userDetails.Role === "ERPADMIN" &&
                      "User has rejected UAT. You can resolve the ticket, forward to L2, or offer UAT again after addressing concerns."}
                  </Typography>
                </Box>
              )}

              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap="20px"
                alignItems="start"
              >
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.white }}>
                    Select Status
                  </InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isUpdating}
                    sx={{
                      color: COLORS.white,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.white,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.greenAccent[500],
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.greenAccent[600],
                      },
                      "& .MuiSvgIcon-root": {
                        color: COLORS.white,
                      },
                    }}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedStatus === "Forward to L2" && (
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={isUpdating}
                    sx={{
                      border: "1px solid",
                      borderColor: COLORS.grey[400],
                      color: COLORS.grey[100],
                      backgroundColor: COLORS.primary[700],
                      "&:hover": {
                        backgroundColor: COLORS.primary[600],
                      },
                    }}
                  >
                    Upload Image (Optional)
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setForwardImage(e.target.files[0])}
                    />
                  </Button>
                )}
              </Box>

              {forwardImage && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: COLORS.greenAccent[500] }}
                >
                  Selected File: {forwardImage.name}
                </Typography>
              )}

              <Box mt="20px">
                <Typography variant="h6" gutterBottom>
                  Remark
                </Typography>
                <Box
                  sx={{
                    "& .ql-toolbar": {
                      borderColor: COLORS.grey[700],
                      backgroundColor: COLORS.primary[500],
                    },
                    "& .ql-container": {
                      borderColor: COLORS.grey[700],
                      backgroundColor: COLORS.primary[500],
                      color: COLORS.white,
                    },
                    "& .ql-editor": {
                      color: COLORS.white,
                      minHeight: "150px",
                    },
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={remark}
                    onChange={setRemark}
                    readOnly={isUpdating}
                    placeholder={
                      selectedStatus === "Accept UAT"
                        ? "Confirm UAT acceptance and provide any testing notes..."
                        : selectedStatus === "Reject UAT"
                        ? "Explain the reasons for UAT rejection and what needs to be addressed..."
                        : selectedStatus === "Deployed UAT"
                        ? "Confirm deployment and provide deployment details..."
                        : selectedStatus === "Resolved" &&
                          ticket.Status === "Reopen"
                        ? "Provide details on how the reopened issue has been resolved..."
                        : "Enter your remark here..."
                    }
                  />
                </Box>
              </Box>

              <Box mt="20px">
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || !remark.trim() || isUpdating}
                  startIcon={
                    isUpdating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    backgroundColor:
                      selectedStatus === "Accept UAT"
                        ? COLORS.orangeAccent[600]
                        : selectedStatus === "Reject UAT"
                        ? COLORS.redAccent[600]
                        : selectedStatus === "Deployed UAT"
                        ? COLORS.greenAccent[600]
                        : COLORS.blueAccent[600],
                    "&:hover": {
                      backgroundColor:
                        selectedStatus === "Accept UAT"
                          ? COLORS.orangeAccent[700]
                          : selectedStatus === "Reject UAT"
                          ? COLORS.redAccent[700]
                          : selectedStatus === "Deployed UAT"
                          ? COLORS.greenAccent[700]
                          : COLORS.blueAccent[700],
                    },
                    "&:disabled": {
                      backgroundColor: COLORS.grey[700],
                    },
                    minWidth: "140px",
                  }}
                >
                  {isUpdating
                    ? "Updating..."
                    : selectedStatus === "Accept UAT"
                    ? "Accept UAT"
                    : selectedStatus === "Reject UAT"
                    ? "Reject UAT"
                    : selectedStatus === "Deployed UAT"
                    ? "Mark as Deployed"
                    : "Update Ticket"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default TicketDetail;

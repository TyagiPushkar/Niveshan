import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const IssueAsset = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetType, setAssetType] = useState(""); // Store selected asset type
  const [filteredAssets, setFilteredAssets] = useState([]); // Filtered assets based on asset type
  const [formData, setFormData] = useState({
    EmpId: "",
    AssetID: "",
    Status: "Issued",
    Remark: "",
    IssueDate: new Date().toISOString().split('T')[0], // Automatically set to today's date
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch employee and asset data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/NiveshanBackend/api/users/get_users.php"
        );
        const data = await response.json();
        setEmployees(data.records || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

   

    fetchEmployees();
    fetchAssets();
    setLoading(false);
  }, []);
 const fetchAssets = async () => {
      try {
        const response = await fetch(
          "https://namami-infotech.com/NiveshanBackend/api/assets/get_assets.php"
        );
        const data = await response.json();
        setAssets(data.data || []);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };
  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle asset type change
  const handleAssetTypeChange = (e) => {
    const selectedType = e.target.value;
    setAssetType(selectedType);

    // Filter assets based on the selected asset type and 'In Stock' status
    const filtered = assets.filter(
      (asset) =>
        asset.AssetType === selectedType && asset.Status === "In stock"
    );
    setFilteredAssets(filtered);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const response = await fetch(
        "https://namami-infotech.com/NiveshanBackend/api/assets/asset_issue.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      console.log(result);
      alert(result.message || "Asset issued successfully");

      // Clear the form after submission
      setFormData({
        EmpId: "",
        AssetID: "",
        Status: "Issued",
        Remark: "",
        IssueDate: new Date().toISOString().split('T')[0], // Reset IssueDate to today's date
      });
      setAssetType(""); // Reset asset type
      setFilteredAssets([]); // Clear the filtered assets
       fetchAssets();
    } catch (error) {
      console.error("Error issuing asset:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" mb="20px">
        Issue Asset to Employee
      </Typography>

      {loading ? (
        <Typography>Loading data...</Typography>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: "20px", gridTemplateColumns: "auto auto" }}
        >
          {/* Employee Dropdown */}
          <FormControl sx={{ width: "400px" }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={formData.EmpId}
              name="EmpId"
              onChange={handleChange}
              required
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "400px",
                  },
                },
              }}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.EmpId} value={employee.EmpId}>
                  {employee.Name} ({employee.EmpId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Asset Type Dropdown */}
          <FormControl sx={{ width: "400px" }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={assetType}
              onChange={handleAssetTypeChange}
              required
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "400px",
                  },
                },
              }}
            >
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
            </Select>
          </FormControl>

          {/* Asset Dropdown (filtered based on type) */}
          <FormControl sx={{ width: "400px" }}>
            <InputLabel>Asset</InputLabel>
            <Select
              value={formData.AssetID}
              name="AssetID"
              onChange={handleChange}
              required
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "400px",
                  },
                },
              }}
            >
              {filteredAssets.map((asset) => (
                <MenuItem key={asset.Id} value={asset.AssetId}>
                  {asset.AssetName} ({asset.AssetId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Remark */}
          <TextField
            label="Remark"
            name="Remark"
            value={formData.Remark}
            onChange={handleChange}
            required
            multiline
            rows={3}
            sx={{ width: "400px" }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitLoading}
          >
            {submitLoading ? "Issuing..." : "Issue Asset"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IssueAsset;

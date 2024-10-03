import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

const AddAsset = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [assetNames, setAssetNames] = useState([]);
  const [filteredAssetNames, setFilteredAssetNames] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formValues, setFormValues] = useState({
  assetType: "",  // Ensure this is initialized correctly
  assetName: "",
  assetCondition: "New",
  make: "",
  model: "",
  serialNo: "",
  harddisk: "",
  ram: "",
  quantity: "",
  invoiceNo: "",
  invoiceDate: "",
  vendorName: "",
  invoiceAttach: null,
  status: "In stock",
});


  useEffect(() => {
    const fetchAssetNames = async () => {
      try {
        const response = await axios.get("https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_names.php");
        if (response.data.data && Array.isArray(response.data.data)) {
          setAssetNames(response.data.data);
          setFilteredAssetNames(response.data.data); // Initially set all asset names
        }
      } catch (error) {
        console.error("Error fetching asset names:", error);
      }
    };
    fetchAssetNames();
  }, []);

  const fetchFieldNames = async (checkpoints) => {
    try {
      const response = await axios.get(`https://namami-infotech.com/NiveshanBackend/api/assets/get_checkpoints.php?checkpoints=${checkpoints.join(',')}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        setFieldNames(response.data.data);
      } else {
        setFieldNames([]);
      }
    } catch (error) {
      console.error("Error fetching field names:", error);
      setFieldNames([]);
    }
  };

 const handleAssetTypeChange = (event) => {
  const assetType = event.target.value;  // Get the selected value
  setFormValues((prevValues) => ({
    ...prevValues,
    assetType,  // Update only assetType in state
  }));

  // Filter asset names based on the selected asset type
  const filteredAssets = assetNames.filter(asset => asset.type === assetType);
  setFilteredAssetNames(filteredAssets);
  setFormValues((prevValues) => ({
    ...prevValues,
    assetName: "", // Reset asset name when type changes
  }));
  setFieldNames([]); // Reset field names
};



  const handleAssetNameChange = async (event) => {
    const selectedAsset = assetNames.find(asset => asset.name === event.target.value);
    setSelectedAssetId(selectedAsset.id);
    if (selectedAsset.checkpoints) {
      const checkpoints = selectedAsset.checkpoints.split(',').map(id => parseInt(id, 10));
      await fetchFieldNames(checkpoints);
    } else {
      setFieldNames([]);
    }
    setFormValues({ ...formValues, assetName: event.target.value });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (event) => {
    setFormValues({ ...formValues, invoiceAttach: event.target.files[0] });
  };

 const handleFormSubmit = async () => {
 
  // Log the current form values for debugging
  console.log("Current Form Values: ", formValues);

  try {
    setLoading(true);

    // Prepare JSON payload, including assetType
    const jsonData = {
      AssetType: formValues.assetType,  // Ensure assetType is included
      AssetName: formValues.assetName,
      AssetCondition: formValues.assetCondition || "New",
      Make: formValues.make || "",
      Model: formValues.model || "",
      SerialNo: formValues.serialNo || "",
      Harddisk: formValues.harddisk || "",
      RAM: formValues.ram || "",
      Quantity: formValues.quantity || "",
      InvoiceNo: formValues.invoiceNo || "",
      InvoiceDate: formValues.invoiceDate || "",
      VendorName: formValues.vendorName || "",
      InvoiceAttach: null,
      Status: formValues.status || "In stock",
    };

    // Log the JSON payload to the console
    console.log("Submitting JSON Payload:", jsonData);

    // Send the payload as JSON
    const response = await axios.post("https://namami-infotech.com/NiveshanBackend/api/assets/add_asset.php", jsonData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API Response:", response.data);
    if (response.data) {
      alert(response.data.message);
      setFormValues({
        assetType: "",
        assetName: "",
        assetCondition: "New",
        make: "",
        model: "",
        serialNo: "",
        harddisk: "",
        ram: "",
        quantity: "",
        invoiceNo: "",
        invoiceDate: "",
        vendorName: "",
        invoiceAttach: null,
        status: "In stock",
      });
    }
  } catch (error) {
    console.error("Error adding asset:", error);
    alert("Failed to add asset");
  } finally {
    setLoading(false);
  }
};



  return (
    <Box m="20px">
      <Header title="ADD NEW ASSET" subtitle="Add a New Asset" />

      <Box
        display="grid"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
        }}
      >
      <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
  <InputLabel id="asset-type-label">Asset Type</InputLabel>
  <Select
    labelId="asset-type-label"
    name="assetType"
    value={formValues.assetType} // This should correctly reflect the state
    onChange={handleAssetTypeChange} // Ensure this is the correct handler
  >
    <MenuItem value="Hardware">Hardware</MenuItem>
    <MenuItem value="Software">Software</MenuItem>
  </Select>
</FormControl>



        <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
          <InputLabel id="asset-name-label">Asset Name</InputLabel>
          <Select
            labelId="asset-name-label"
            name="assetName"
            value={formValues.assetName}
            onChange={handleAssetNameChange}
          >
            {filteredAssetNames.map((asset) => (
              <MenuItem key={asset.id} value={asset.name}>
                {asset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Conditional Fields */}
        {fieldNames.length > 0 && fieldNames.map(field => (
          <TextField
            key={field.id}
            fullWidth
            variant="filled"
            label={field.field_name}
            name={field.field_name}
            type={field.field_type || "text"}
            value={formValues[field.field_name] || ""}
            onChange={handleInputChange}
            sx={{ gridColumn: "span 2" }}
          />
        ))}

        <Box mt="20px" sx={{ gridColumn: "span 2" }}>
          <Button
            disabled={loading}
            onClick={handleFormSubmit}
            variant="contained"
            color="primary"
            sx={{ width: "100%" }}
          >
            {loading ? "Adding..." : "Add Asset"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAsset;

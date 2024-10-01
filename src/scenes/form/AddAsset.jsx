import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

const AddAsset = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [assetNames, setAssetNames] = useState([]);
  const [filteredAssetNames, setFilteredAssetNames] = useState([]); // State for filtered asset names
  const [loading, setLoading] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState(""); // State for selected asset type

  // Fetch asset names from API
  useEffect(() => {
    const fetchAssetNames = async () => {
      try {
        const response = await axios.get("https://namami-infotech.com/NiveshanBackend/api/assets/get_asset_names.php");
        if (response.data.data && Array.isArray(response.data.data)) {
          setAssetNames(response.data.data);
          setFilteredAssetNames(response.data.data); // Initialize filtered names with all names
        } else {
          console.error("Asset names data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching asset names:", error);
      }
    };

    fetchAssetNames();
  }, []);

  // Handle asset type selection
  const handleAssetTypeChange = (event) => {
    const value = event.target.value;
    setSelectedAssetType(value);
    const filteredNames = assetNames.filter(asset => asset.type === value);
    setFilteredAssetNames(filteredNames); // Set the filtered asset names based on the selected type
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const formattedValues = {
        AssetId: values.assetId,
        AssetType: values.assetType,
        AssetName: values.assetName,
        AssetCondition: values.assetCondition, // New field
        Make: values.make,
        Model: values.model, // New field
        SerialNo: values.serialNo,
        Harddisk: values.harddisk,
        RAM: values.ram,
        Quantity: values.quantity,
        InvoiceNo: values.invoiceNo,
        InvoiceDate: values.invoiceDate,
        VendorName: values.vendorName,
        InvoiceAttach: values.invoiceAttach, // Assuming the path is coming from user input
      };

      const response = await axios.post(
        "https://namami-infotech.com/NiveshanBackend/api/assets/add_asset.php",
        formattedValues
      );

      if (response.data) {
        alert("Asset added successfully");
        console.log(response.data);
        resetForm();
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

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={assetSchema} // You may want to remove this if no validation is needed
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Asset ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.assetId}
                name="assetId"
                error={!!touched.assetId && !!errors.assetId}
                helperText={touched.assetId && errors.assetId}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Dropdown for Asset Type */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel id="asset-type-label">Asset Type</InputLabel>
                <Select
                  labelId="asset-type-label"
                  name="assetType"
                  value={values.assetType}
                  onChange={(event) => {
                    handleChange(event);
                    handleAssetTypeChange(event); // Update selected asset type
                  }}
                  onBlur={handleBlur}
                  error={!!touched.assetType && !!errors.assetType}
                >
                  <MenuItem value="Hardware">Hardware</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                </Select>
                {touched.assetType && errors.assetType && <div>{errors.assetType}</div>}
              </FormControl>

              {/* Dropdown for Asset Name */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel id="asset-name-label">Asset Name</InputLabel>
                <Select
                  labelId="asset-name-label"
                  name="assetName"
                  value={values.assetName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.assetName && !!errors.assetName}
                >
                  {filteredAssetNames.map((asset) => (
                    <MenuItem key={asset.id} value={asset.name}>
                      {asset.name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.assetName && errors.assetName && <div>{errors.assetName}</div>}
              </FormControl>

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Make"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.make}
                name="make"
                error={!!touched.make && !!errors.make}
                helperText={touched.make && errors.make}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Model" // New field
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.model}
                name="model"
                error={!!touched.model && !!errors.model}
                helperText={touched.model && errors.model}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Serial No."
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.serialNo}
                name="serialNo"
                error={!!touched.serialNo && !!errors.serialNo}
                helperText={touched.serialNo && errors.serialNo}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Hard Disk"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.harddisk}
                name="harddisk"
                error={!!touched.harddisk && !!errors.harddisk}
                helperText={touched.harddisk && errors.harddisk}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="RAM"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.ram}
                name="ram"
                error={!!touched.ram && !!errors.ram}
                helperText={touched.ram && errors.ram}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Quantity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.quantity}
                name="quantity"
                error={!!touched.quantity && !!errors.quantity}
                helperText={touched.quantity && errors.quantity}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Invoice No."
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.invoiceNo}
                name="invoiceNo"
                error={!!touched.invoiceNo && !!errors.invoiceNo}
                helperText={touched.invoiceNo && errors.invoiceNo}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Invoice Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.invoiceDate}
                name="invoiceDate"
                error={!!touched.invoiceDate && !!errors.invoiceDate}
                helperText={touched.invoiceDate && errors.invoiceDate}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Vendor Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.vendorName}
                name="vendorName"
                error={!!touched.vendorName && !!errors.vendorName}
                helperText={touched.vendorName && errors.vendorName}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Invoice Attachment"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.invoiceAttach}
                name="invoiceAttach"
                error={!!touched.invoiceAttach && !!errors.invoiceAttach}
                helperText={touched.invoiceAttach && errors.invoiceAttach}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            <Box mt="20px">
              <Button disabled={loading} type="submit" color="primary" variant="contained">
                {loading ? "Loading..." : "Add Asset"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Validation schema
const assetSchema = yup.object().shape({
  assetId: yup.string().required("Required"),
  assetType: yup.string().required("Required"),
  assetName: yup.string().required("Required"),
  make: yup.string().required("Required"),
  model: yup.string().required("Required"),
  serialNo: yup.string().required("Required"),
  harddisk: yup.string().required("Required"),
  ram: yup.string().required("Required"),
  quantity: yup.number().required("Required"),
  invoiceNo: yup.string().required("Required"),
  invoiceDate: yup.date().required("Required"),
  vendorName: yup.string().required("Required"),
  invoiceAttach: yup.string().required("Required"),
});

const initialValues = {
  assetId: "",
  assetType: "",
  assetName: "",
  make: "",
  model: "", // New field
  serialNo: "",
  harddisk: "",
  ram: "",
  quantity: "",
  invoiceNo: "",
  invoiceDate: "",
  vendorName: "",
  invoiceAttach: "",
};

export default AddAsset;

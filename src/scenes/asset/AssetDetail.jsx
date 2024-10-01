import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress,Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";

const AssetDetail = () => {
  const { assetId } = useParams(); // Get assetId from the URL
  const [assetDetail, setAssetDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetDetail = async () => {
      try {
        const response = await fetch(`https://namami-infotech.com/NiveshanBackend/api/assets/get_assets.php?AssetId=${assetId}`);
        const data = await response.json();
          setAssetDetail(data.data[0]); // Assuming the detail data is under "data"
          console.log(data.data[0])
        setLoading(false);
      } catch (error) {
        console.error("Error fetching asset detail:", error);
        setLoading(false);
      }
    };

    fetchAssetDetail();
  }, [assetId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!assetDetail) {
    return <Typography variant="h4">Asset not found</Typography>;
  }

  return (
    <Box m="20px">
      <Header title={`${assetDetail.AssetType} - ${assetDetail.AssetName}`} subtitle="Detailed Information" />

      <Box mt="10px">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Asset Type: {assetDetail.AssetType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Asset Name: {assetDetail.AssetName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Condition: {assetDetail.AssetCondition}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Make: {assetDetail.Make}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Model: {assetDetail.Model || "N/A"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Serial No.: {assetDetail.SerialNo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Hard Disk: {assetDetail.Harddisk}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">RAM: {assetDetail.RAM}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Quantity: {assetDetail.Quantity}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Status: {assetDetail.Status}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Vendor Name: {assetDetail.VendorName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Invoice No.: {assetDetail.InvoiceNo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Invoice Date: {assetDetail.InvoiceDate}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Added On: {assetDetail.AddDateTime}</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AssetDetail;

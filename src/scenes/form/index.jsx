import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  
  const [roles, setRoles] = useState([]);
  const [functions, setFunctions] = useState([]);

  // Fetch roles and functions from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("https://namami-infotech.com/NiveshanBackend/api/users/roles.php");
        // Extracting the array from the response
        if (response.data.records && Array.isArray(response.data.records)) {
          setRoles(response.data.records);
        } else {
          console.error("Roles data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchFunctions = async () => {
      try {
        const response = await axios.get("https://namami-infotech.com/NiveshanBackend/api/users/functions.php");
        // Extracting the array from the response
        if (response.data.records && Array.isArray(response.data.records)) {
          setFunctions(response.data.records);
        } else {
          console.error("Functions data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching functions:", error);
      }
    };

    fetchRoles();
    fetchFunctions();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const formattedValues = {
        EmpId: values.empId,
        Name: values.name,
        Password: values.password,
        Mobile: values.mobile,
        Email: values.email,
        RM_Mail: values.rm_mail,
        Role: values.role,
        Functions: values.functions,
        Status: values.status,
        DateOfJoining: values.dateOfJoining,
      };

      const response = await axios.post(
        "https://namami-infotech.com/NiveshanBackend/api/users/add_user.php",
        formattedValues
      );

      if (response.data) {
        alert("User created successfully");
        console.log(response.data); // Optional: to log the API response
        resetForm(); // Resets the form after successful submission
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  return (
    <Box m="20px">
      <Header title="ADD NEW USER" subtitle="Add a New User Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
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
                label="Emp ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.empId}
                name="empId"
                error={!!touched.empId && !!errors.empId}
                helperText={touched.empId && errors.empId}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Mobile"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.mobile}
                name="mobile"
                error={!!touched.mobile && !!errors.mobile}
                helperText={touched.mobile && errors.mobile}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="RM Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.rm_mail}
                name="rm_mail"
                error={!!touched.rm_mail && !!errors.rm_mail}
                helperText={touched.rm_mail && errors.rm_mail}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Dropdown for Role */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.role && !!errors.role}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.role_id} value={role.role_name}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.role && errors.role && <div>{errors.role}</div>}
              </FormControl>

              {/* Dropdown for Functions */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel id="functions-label">Functions</InputLabel>
                <Select
                  labelId="functions-label"
                  name="functions"
                  value={values.functions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.functions && !!errors.functions}
                >
                  {functions.map((func) => (
                    <MenuItem key={func.function_id} value={func.function_name}>
                      {func.function_name}
                    </MenuItem>
                  ))}
                </Select>
                {touched.functions && errors.functions && <div>{errors.functions}</div>}
              </FormControl>

              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Date of Joining"
                InputLabelProps={{ shrink: true }}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.dateOfJoining}
                name="dateOfJoining"
                error={!!touched.dateOfJoining && !!errors.dateOfJoining}
                helperText={touched.dateOfJoining && errors.dateOfJoining}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  empId: yup.string(), // EmpId is not required anymore
  name: yup.string().required("required"),
  password: yup.string().required("required"),
  mobile: yup.string().matches(phoneRegExp, "Phone number is not valid").required("required"),
  email: yup.string().email("Invalid email").required("required"),
  rm_mail: yup.string().email("Invalid email"),
  role: yup.string().required("required"),
  functions: yup.string().required("required"),
  dateOfJoining: yup.string().required("required"),
});

const initialValues = {
  empId: "",
  name: "",
  password: "",
  mobile: "",
  email: "",
  rm_mail: "",
  role: "",
  functions: "",
  dateOfJoining: "",
};

export default Form;

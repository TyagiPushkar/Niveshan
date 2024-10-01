import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import Header from "../../components/Header";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Role"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.role}
                name="role"
                error={!!touched.role && !!errors.role}
                helperText={touched.role && errors.role}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Functions"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.functions}
                name="functions"
                error={!!touched.functions && !!errors.functions}
                helperText={touched.functions && errors.functions}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Status"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.status}
                name="status"
                error={!!touched.status && !!errors.status}
                helperText={touched.status && errors.status}
                sx={{ gridColumn: "span 2" }}
              />
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
  empId: yup.string().required("required"),
  name: yup.string().required("required"),
  password: yup.string().required("required"),
  mobile: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  email: yup.string().email("invalid email").required("required"),
  rm_mail: yup.string().email("invalid email").required("required"),
  role: yup.string().required("required"),
  functions: yup.string().required("required"),
  status: yup.string().required("required"),
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
  status: "",
  dateOfJoining: "",
};

export default Form;

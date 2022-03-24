import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import logo from "../assets/logo/logo.svg";
import { useFormField } from "../utils/UseFiled";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { doRegister } from "../utils/auth/doRegister";
import { doLogin } from "../utils/auth/doLoginUser";
import {
  fetchRegisterUserActionSuccess,
  fetchLoginUserActionsSuccess,
  fetchLoginUserActionsError,
  fetchRegisterUserActionError,
} from "../actions/actions";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://owleer.io/">
        {"owleer.io"}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    margin: theme.spacing(1),
    backgroundColor: "#FFFFFF",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const classes = useStyles();
  const history = useHistory();
  const fullNameField = useFormField();
  const otherRoleField = useFormField();
  const companyNameField = useFormField();
  const emailField = useFormField();
  const passwordField = useFormField();
  const roleList = [
    "Initiator/Entrepreneur",
    "Architect",
    "Structural Engineer",
    "Electric Engineer",
    "Plumbing Engineer",
    "HVAC Engineer",
    "Green Building Consultant",
    "Elevator Planner",
    "Hydrologist",
    "Safety Consultant",
    "Accessibility Consultant",
    "BIM manager",
    "Cost Estimator",
    "Superposition Consultant",
    "Other",
  ];
  const [valueRole, setValueRole] = useState<string | null>(roleList[0]);
  const [inputValueRole, setInputValueRole] = useState("");
  const [errorSingUpFullName, setErrorSingUpFullName] = useState("");
  const [errorCompanyName, setErrorCompanyName] = useState("");
  const [errorSingUpEmail, setErrorSingUpEmail] = useState("");
  const [errorSingUpPassword, setErrorSingUpPassword] = useState("");
  const [errorOtherRole, setErrorOtherRole] = useState("");
  const dispatch = useDispatch();
  const [isLoadingDoRegister, setIsLoadingDoRegister] = useState(false);

  async function handleSignUp(
    email: string,
    password: string,
    name: string,
    company: string,
    role: string
  ) {
    setErrorSingUpFullName("");
    setErrorCompanyName("");
    setErrorSingUpEmail("");
    setErrorSingUpPassword("");
    if (
      (email &&
        password &&
        fullNameField.value &&
        companyNameField.value &&
        inputValueRole === "Other" &&
        otherRoleField.value !== "") !== ""
    ) {
      try {
        setIsLoadingDoRegister(true);
        await doRegister(email, password, name, company, role);
        dispatch(fetchRegisterUserActionSuccess());
        setIsLoadingDoRegister(false);
        try {
          const userData = await doLogin(email, password);
          dispatch(fetchLoginUserActionsSuccess(userData));
        } catch {
          dispatch(fetchLoginUserActionsError());
        }
        history.push("/projects");
      } catch (e) {
        dispatch(fetchRegisterUserActionError());
        setIsLoadingDoRegister(false);
        switch (e.code) {
          case "auth/invalid-email":
            setErrorSingUpEmail("Please enter correct email");
            break;
          case "auth/weak-password":
            setErrorSingUpPassword("Please enter correct password");
            break;
          case "auth/email-already-in-use":
            setErrorSingUpEmail("E-mail already in use");
            break;
          default:
            setErrorSingUpFullName("");
            setErrorSingUpEmail("");
            setErrorCompanyName("");
            setErrorSingUpPassword("");
        }
      }
    } else {
      fullNameField.value === ""
        ? setErrorSingUpFullName("The field cannot be empty")
        : setErrorSingUpFullName("");
      companyNameField.value === ""
        ? setErrorCompanyName("The field cannot be empty")
        : setErrorCompanyName("");
      email === ""
        ? setErrorSingUpEmail("The field cannot be empty")
        : setErrorSingUpEmail("");
      password === ""
        ? setErrorSingUpPassword("The field cannot be empty")
        : setErrorSingUpPassword("");
      otherRoleField.value === ""
        ? setErrorOtherRole("The field cannot be empty")
        : setErrorOtherRole("");
    }
  }
  const HEBREW_TEXT =
    "לכל שאלה תרגישו חופשי לכתוב לויקטור המנהל הטכנולוגי שלנו בכתובת";

  const getOptionDisabled = () => {
    return inputValueRole === "Other";
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <img src={logo} className={classes.avatarImage} alt="Logo" />
        </Avatar>
        <Typography
          style={{ fontWeight: "bold" }}
          component="h1"
          variant="h5"
          align="center"
        >
          <span style={{ color: "#662e79" }}>Sign u</span>
          <span style={{ color: "#f16644" }}>p</span>
          <span style={{ color: "#662e79" }}> / </span>
          <span style={{ color: "#662e79" }}>להרש</span>
          <span style={{ color: "#f16644" }}>ם</span>
          <span style={{ color: "#662e79" }}> / </span>ֿ
          <span style={{ color: "#662e79" }}>Зарегистрироватьс</span>
          <span style={{ color: "#f16644" }}>я</span>
        </Typography>
        <Grid container style={{ margin: "20px" }}>
          <Grid item xs={6}>
            <Typography
              style={{
                fontWeight: "bold",
                borderColor: "gray",
                border: 1,
                textAlign: "left",
              }}
              component="h1"
              align="center"
            >
              For any questions or assistance feel free to reach our CTO Victor
              on
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              style={{
                fontWeight: "bold",
                borderColor: "gray",
                border: 1,
                textAlign: "right",
              }}
              component="h1"
              align="center"
            >
              {HEBREW_TEXT}
            </Typography>
          </Grid>
          <Grid xs={12}>
            <Typography
              style={{
                fontWeight: "bold",
                margin: "10px",
              }}
              component="h1"
              align="center"
            >
              <a
                style={{ textDecoration: "none" }}
                href="mailto:victor@owleer.io"
              >
                <span style={{ color: "#662e79" }}>victor@owleer</span>
                <span style={{ color: "#f16644" }}>.io</span>
              </a>
            </Typography>
          </Grid>
        </Grid>

        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                error={!!errorSingUpFullName}
                autoComplete="fullName"
                name="fullName"
                variant="outlined"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                autoFocus
                helperText={setErrorSingUpFullName}
                {...fullNameField}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                error={!!errorCompanyName}
                autoComplete="company"
                name="company"
                variant="outlined"
                required
                fullWidth
                id="company"
                label="Company"
                autoFocus
                helperText={errorCompanyName}
                {...companyNameField}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Autocomplete
                value={valueRole}
                onChange={(event: any, newValue: string | null) => {
                  setValueRole(newValue);
                }}
                inputValue={inputValueRole}
                onInputChange={(event, newInputValue) => {
                  setInputValueRole(newInputValue);
                }}
                id="controllable-states-demo"
                options={roleList}
                renderInput={(params) => (
                  <TextField {...params} label="Role" variant="outlined" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              {inputValueRole === "Other" ? (
                <TextField
                  error={!!errorOtherRole}
                  autoComplete="Other role"
                  name="Other role"
                  variant="outlined"
                  required
                  fullWidth
                  id="Other role"
                  label="Other role"
                  autoFocus
                  helperText={errorOtherRole}
                  {...otherRoleField}
                />
              ) : null}
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errorSingUpEmail}
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                helperText={errorSingUpEmail}
                {...emailField}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errorSingUpPassword}
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                helperText={errorSingUpPassword}
                {...passwordField}
              />
            </Grid>
          </Grid>
          <Button
            disabled={isLoadingDoRegister}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() =>
              handleSignUp(
                emailField.value,
                passwordField.value,
                fullNameField.value,
                companyNameField.value,
                otherRoleField.value || inputValueRole
              )
            }
          >
            {isLoadingDoRegister ? "Loading" : "Sign Up"}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

import { useState } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { IconButton, InputAdornment } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as Logo } from "../assets/logo/logo.svg";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { useFormField } from "../utils/UseFiled";
import { doLogin } from "../utils/auth/doLoginUser";
import {
  fetchLoginUserActionsError,
  fetchUserActionError,
  fetchUserActionSuccess,
  fetchUserOrganizationsActionRequest,
} from "../actions/actions";
import { fetchUserData } from "../utils/auth/fetchUserData";
import { UserData } from "../types/AuthTypes";

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
  root: {
    height: "100vh",
  },
  paper: {
    margin: theme.spacing(8, 4),
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
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: "10%",
  },
  submit: {
    margin: theme.spacing(1, 0, 1),
  },
  logo: {
    height: "500px",
    width: "500px",
    paddingTop: "25",
    ["@media (max-width:800px)"]: {
      width: "30%",
      padding: 0,
      marginLeft: "35%",
      height: "15%",
    },
  },
  label: {
    color: "#662e79",
    fontWeight: "bold",
    ["@media (max-width:800px)"]: {
      fontSize: 18,
    },
  },
}));

export default function Login() {
  const classes = useStyles();
  const history = useHistory();
  const emailField = useFormField();
  const passwordField = useFormField();
  const [errorSingInEmail, setErrorSingInEmail] = useState("");
  const [errorSingInPassword, setErrorSingInPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  async function handleSignIn(email: string, password: string) {
    setErrorSingInEmail("");
    setErrorSingInPassword("");
    try {
      if (email && password !== "") {
        setIsLoadingLogin(true);
        await doLogin(email, password);
        fetchUserData()
          .then((userData: UserData) => {
            dispatch(fetchUserActionSuccess(userData));
          })
          .catch((e) => {
            dispatch(fetchUserActionError());
          });
        setIsLoadingLogin(false);
        dispatch(fetchUserOrganizationsActionRequest());
      } else {
        email === ""
          ? setErrorSingInEmail("The field cannot be empty")
          : setErrorSingInEmail("");
        password === ""
          ? setErrorSingInPassword("The field cannot be empty")
          : setErrorSingInPassword("");
      }
    } catch (e) {
      dispatch(fetchLoginUserActionsError());
      setIsLoadingLogin(false);
      switch (e.code) {
        case "auth/wrong-password":
          setErrorSingInPassword("Wrong password");
          break;
        case "auth/user-not-found":
          setErrorSingInEmail("User is not found");
          break;
        case "auth/invalid-email":
          setErrorSingInEmail("Please enter correct email");
          break;
        default:
          setErrorSingInEmail("");
          setErrorSingInPassword("");
      }
    }
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7}>
        <Grid
          container
          alignContent="center"
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            container
            alignContent="center"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <Logo className={classes.logo} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography className={classes.label} align="center" variant="h3">
              Construction Operation Syste
              <span style={{ color: "#f16644", fontWeight: "bold" }}>m</span>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Typography
            style={{ paddingTop: "20%", fontWeight: "bold" }}
            component="h1"
            variant="h5"
          >
            <span style={{ color: "#662e79" }}>Sign i</span>
            <span style={{ color: "#f16644" }}>n</span>
            <span style={{ color: "#662e79" }}> / </span>
            <span style={{ color: "#662e79" }}>להתחב</span>
            <span style={{ color: "#f16644" }}>ר</span>
            <span style={{ color: "#662e79" }}> / </span>ֿ
            <span style={{ color: "#662e79" }}>Войт</span>
            <span style={{ color: "#f16644" }}>и</span>
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              error={!!errorSingInEmail}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              helperText={errorSingInEmail}
              {...emailField}
            />
            <TextField
              error={!!errorSingInPassword}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              type={showPassword ? undefined : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={errorSingInPassword}
              {...passwordField}
            />
            <Button
              disabled={isLoadingLogin}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={async () => {
                await handleSignIn(emailField.value, passwordField.value);
                history.push("/projects");
              }}
            >
              {isLoadingLogin ? "loading" : "Sign In"}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link variant="body2" href="/forgot-password">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}

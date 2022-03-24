import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Avatar from "@material-ui/core/Avatar";
import Backdrop from "@material-ui/core/Backdrop";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Fade } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { useHistory } from "react-router";
import { useFormField } from "../utils/UseFiled";
import logo from "../assets/logo/logo.svg";
import { useDispatch } from "react-redux";
import { resetPasswordForEmail } from "../utils/auth/resetPasswordForEmail";
import {
  fetchForgotPasswordActionSuccess,
  fetchForgotPasswordActionError,
} from "../actions/actions";

export default function ForgotPassword() {
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
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paperModal: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));
  const history = useHistory();
  const classes = useStyles();
  const emailField = useFormField();
  const [open, setOpen] = useState(false);
  const [errorForgotPassword, setForgotPassword] = useState("");
  const dispatch = useDispatch();
  const [isLoadingForgotPassword, setIsLoadingForgotPassword] = useState(false);

  const handleClose = () => {
    setOpen(false);
    history.push("/");
  };
  async function handleForgotPassword(email: string) {
    setForgotPassword("");
    try {
      setIsLoadingForgotPassword(true);
      await resetPasswordForEmail(email);
      setOpen(true);
      dispatch(fetchForgotPasswordActionSuccess());
      setIsLoadingForgotPassword(false);
    } catch (e) {
      dispatch(fetchForgotPasswordActionError());
      setIsLoadingForgotPassword(false);
      switch (e) {
        case "auth/invalid-email":
          setForgotPassword("Invalid email entered");
          break;
        case "auth/user-not-found":
          setForgotPassword("User with this email not found");
          break;
        default:
          setForgotPassword("");
      }
    }
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <img src={logo} className={classes.avatarImage} alt="Logo" />
        </Avatar>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                error={!!errorForgotPassword}
                autoComplete="email"
                name="email"
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                autoFocus
                helperText={errorForgotPassword}
                {...emailField}
              />
            </Grid>
          </Grid>
          <Button
            disabled={isLoadingForgotPassword}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => handleForgotPassword(emailField.value)}
          >
            {isLoadingForgotPassword ? "Loading" : "Forgot Password"}
          </Button>
        </form>
      </div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paperModal}>
            <h2 id="transition-modal-title">Forgot Password</h2>
            <p id="transition-modal-description">
              An email with a link to reset your password has been sent to{" "}
              {emailField.value}
            </p>
          </div>
        </Fade>
      </Modal>
    </Container>
  );
}

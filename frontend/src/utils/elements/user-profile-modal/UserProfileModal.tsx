import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { useTranslation } from "react-i18next";
import Backdrop from "@material-ui/core/Backdrop";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Zoom,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { closeUserProfileModal } from "../../../actions/actions";
import MailIcon from "@material-ui/icons/Mail";
import { Phone } from "@material-ui/icons";
import PersonIcon from "@material-ui/icons/Person";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: 25,
      padding: theme.spacing(2, 4, 3),
      maxWidth: 345,
    },
    media: {
      height: 140,
    },
    border: {
      borderLeft: "1px solid #828282",
      height: "30px",
      marginLeft: 10,
      paddingRight: 10,
    },
  })
);

export const UserProfileModal = () => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const userProfile = useSelector(
    (state: State) => state.utils.userProfileModal
  );
  const dispatch = useDispatch();

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={userProfile.open || false}
        onClose={() => dispatch(closeUserProfileModal())}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Zoom in={userProfile.open}>
          <Card className={classes.paper}>
            <CardContent>
              <CardMedia style={{ display: "flex", justifyContent: "center" }}>
                <Avatar style={{ width: 100, height: 100, marginBottom: 20 }}>
                  {userProfile.name ? userProfile.name[0] : ""}
                </Avatar>
              </CardMedia>
              <Typography
                align="center"
                gutterBottom
                variant="h5"
                component="h2"
              >
                {userProfile.name}
              </Typography>
              {userProfile.role ? (
                <Typography
                  align="left"
                  variant="body1"
                  color="textSecondary"
                  component="p"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: 10,
                  }}
                >
                  <PersonIcon color="primary" />{" "}
                  <div className={classes.border} /> {userProfile.role}
                </Typography>
              ) : null}

              {userProfile.phone ? (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  component="p"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: 10,
                  }}
                >
                  <Phone color="primary" /> <div className={classes.border} />{" "}
                  {userProfile.phone}
                </Typography>
              ) : null}

              {userProfile.email ? (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  component="p"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: 10,
                  }}
                >
                  <MailIcon color="primary" />{" "}
                  <div className={classes.border} /> {userProfile.email}
                </Typography>
              ) : null}
            </CardContent>
            <CardActions style={{ display: "flex", justifyContent: "end" }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => dispatch(closeUserProfileModal())}
              >
                {t("user-profile-modal.close-button")}
              </Button>
            </CardActions>
          </Card>
        </Zoom>
      </Modal>
    </div>
  );
};

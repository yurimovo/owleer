import Paper from "@material-ui/core/Paper";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Button, Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { Add, Cancel, Delete, Edit, PersonAdd, Save } from "@material-ui/icons";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { State, UserProfileModalType } from "../../types/ReducerTypes";
import { makeStyles } from "@material-ui/core/styles";
import { attachUserProject } from "../../utils/projects/attachUserProject";
import { fetchProject } from "../../utils/projects/fetchProject";
import {
  openUserProfileModal,
  setContextProjectAction,
} from "../../actions/actions";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { detachUserProject } from "../../utils/projects/detachUserProject";
import {useConfirmationDialog} from "../../utils/elements/confirmation-dialog/ConfirmationDialog";
import {UserSearchRecord} from "../../types/UserTypes";

const useStyles = makeStyles((theme) => ({
  gridRoot: {
    paddingLeft: "2%",
    paddingTop: "2%",
    paddingBottom: "5%",
    maxWidth: "100%",
  },
  columnName: {
    cursor: "pointer",
  },
  rootPaper: {
    padding: 20,
  },
  avatar: {
    marginRight: "20px",
  },
  permissionIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  files: {
    width: "100%",
  },
}));

export const UsersTable = () => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { alertAction } = useSnackBar();
  const [validateError, setValidateError] = useState<boolean>(false);
  const [editUsers, setEditUsers] = useState(false);
  // @ts-ignore
  const [userMailToAdd, setUserMailToAdd] = useState <Array>([]);

  const { getConfirmation } = useConfirmationDialog();
  const [userSearchArr, setUserSearchArr] = useState<Array<UserSearchRecord>>(
    []
  );

  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );

  const validateEmail = (email: string) => {
    const validate =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const v = validate.test(String(email).toLocaleLowerCase());
    if (v) {
      setValidateError(false);
    } else {
      setValidateError(true);
    }
  };

  const handleAddMailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    validateEmail(e.target.value);
    setUserMailToAdd(e.target.value);
  };

  const handleAddUserOnProject = (userEmail: string) => {
    attachUserProject(contextProject.uid, userEmail)
      .then((r) => {
        fetchProject(contextProject.uid)
          .then((r) => dispatch(setContextProjectAction(r)))
          .catch((e) => e);
        alertAction.success(t("dashboard.alert-add-member.success"));
      })
      .catch((e) => {
        console.log(e);
        alertAction.error(t("dashboard.alert-add-member.error"));
      });
  };

  const handleDeleteUserOnProject = (userEmail: string) => {
    detachUserProject(contextProject.uid, userEmail)
      .then((r) => {
        fetchProject(contextProject.uid)
          .then((r) => dispatch(setContextProjectAction(r)))
          .catch((e) => e);
        alertAction.success(t("dashboard.alert-remove-member.success"));
      })
      .catch((e) => {
        console.log(e);
        alertAction.error(t("dashboard.alert-remove-member.success"));
      });
  };

  const handleClose = () => {
    setEditUsers(false);
  };

  const handleDelete = async (email: string) => {
    const confirmed = await getConfirmation({
      title: t("dashboard.confirm.tittle"),
      message: t("dashboard.confirm.message"),
    });
    if (confirmed) {
      handleDeleteUserOnProject(email);
    }
  }

  return (
    <Paper elevation={7}>
      <Typography align="center" color="primary">{t('dashboard.table.tittle')}</Typography>
      <Divider/>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">{t("dashboard.table.name")}</TableCell>
              <TableCell align="center">{t("dashboard.table.role")}</TableCell>
              <TableCell align="center">{t("dashboard.table.phone")}</TableCell>
              <TableCell align="center">{t("dashboard.table.email")}</TableCell>
              {contextProject?.is_admin ? (
                <>
                  {editUsers ? (
                    <TableCell align="right">
                      <Tooltip title={`${t("dashboard.tooltip.cancel")}`}>
                        <Button>
                          <Cancel color="primary" onClick={handleClose} />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  ) : (
                    <TableCell align="right">
                      <Tooltip
                        title={`${t(
                          "dashboard.tooltip.editing-project-participants"
                        )}`}
                      >
                        <Button onClick={() => setEditUsers(!editUsers)}>
                          <Edit color="primary" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  )}
                </>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {contextProject?.users.map((user) => (
              <TableRow hover key={user.user.uid}>
                <TableCell
                  className={classes.columnName}
                  style={{ cursor: "pointer" }}
                  onClick={() => dispatch(openUserProfileModal(user.user))}
                >
                  <Grid container direction="row" alignItems="center">
                    <Avatar className={classes.avatar}>
                      {user.user.name === null || user.user.name === undefined
                        ? " "
                        : user?.user.name[0]}
                    </Avatar>
                    <Typography noWrap>
                      {user.user.name}
                      {user.is_admin ? (
                        <sup>{t("dashboard.project-admin")}</sup>
                      ) : null}
                    </Typography>
                  </Grid>
                  <Grid item></Grid>
                </TableCell>
                <TableCell
                  align="center"
                  style={{ cursor: "pointer" }}
                  onClick={() => dispatch(openUserProfileModal(user.user))}
                >
                  {user.user.role}
                </TableCell>
                <TableCell
                  align="center"
                  style={{ cursor: "pointer" }}
                  onClick={() => dispatch(openUserProfileModal(user.user))}
                >
                  {user.user.phone}
                </TableCell>
                <TableCell
                  align="center"
                  style={{ cursor: "pointer" }}
                  onClick={() => dispatch(openUserProfileModal(user.user))}
                >
                  {user.user.email}
                </TableCell>
                <TableCell align="right">
                  {editUsers ? (
                    <Tooltip
                      title={`${t(
                        "dashboard.tooltip.remove-member-from-project"
                      )}`}
                    >
                      <Button
                        style={{ zIndex: 100 }}
                        disabled={user.is_admin}
                        onClick={() => handleDelete(user.user.email)}
                      >
                        <Delete
                          color={`${user.is_admin ? "inherit" : "primary"}`}
                        />
                      </Button>
                    </Tooltip>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editUsers ? (
        <Grid xs={12} item>
          <Paper elevation={7}>
            <Accordion>
              <AccordionSummary
                expandIcon={
                  <Tooltip
                    title={`${t("dashboard.tooltip.add-member-to-project")}`}
                  >
                    <PersonAdd color="primary" />
                  </Tooltip>
                }
              >
                <Typography>
                  {t("dashboard.tooltip.add-member-to-project")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid item xs={3}>
                  <TextField
                    id="outlined-start-adornment"
                    type="email"
                    color={validateError ? "secondary" : "primary"}
                    fullWidth={true}
                    placeholder={`${t(
                      "permissions-modal.input-search-placeholder"
                    )}`}
                    onChange={handleAddMailChange}
                    error={validateError}
                    helperText={
                      validateError
                        ? t("organization-add-user.text-filed.error")
                        : null
                    }
                  />
                </Grid>
                <Grid>
                  <Button
                    style={{ marginLeft: "10px" }}
                    color="primary"
                    variant="contained"
                    disabled={validateError}
                    onClick={() => handleAddUserOnProject(userMailToAdd)}
                  >
                    {t("organization-add-user.add-user-btn")} <Add />
                  </Button>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      ) : null}
    </Paper>
  );
};

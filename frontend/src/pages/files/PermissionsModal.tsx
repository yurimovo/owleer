import { useEffect } from "react";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  List,
  IconButton,
  InputAdornment,
  TextField,
  Grid,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  TableCell,
  TableHead,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  Avatar,
} from "@material-ui/core";
import { useState } from "react";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { getPermissions } from "../../utils/permission/getPermission";
import { Permission } from "../../types/PermissionType";
import PersonIcon from "@material-ui/icons/Person";
import DeleteIcon from "@material-ui/icons/Delete";
import { deletePermission } from "../../utils/permission/deletePermission";
import SearchIcon from "@material-ui/icons/Search";
import * as React from "react";
import { UserSearchRecord } from "../../types/UserTypes";
import { searchUsers } from "../../utils/users/searchUsers";
import { UserList } from "./UserList";
import { useDispatch, useSelector } from "react-redux";
import { openUserProfileModal, setUsersToFile } from "../../actions/actions";
import { State } from "../../types/ReducerTypes";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Add, AddCircle } from "@material-ui/icons";

const style = {
  width: "60%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "25px",
  marginLeft: "20%",
  p: 4,
};
const useStyles = makeStyles(() => ({
  input: {},
  uploadButton: {},
  modal: {
    marginTop: "2%",
    marginBottom: "4%",
    paddingTop: "4%",
    overflowY: "scroll",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxHeight: "800px",
    overflow: "auto",
  },
  loader: {
    padding: "10%",
  },
  root: {
    maxWidth: "60%",
    maxHeight: "95%",
    display: "flex-box",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1%",
    borderRadius: "25px",
  },
  accordion: {
    width: "100%",
  },
}));

interface IPermissionsModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  folderUid: string;
}

export const PermissionsModal: React.FC<IPermissionsModal> = ({
  open,
  setOpen,
  folderUid,
}) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const filePermissions = useSelector(
    (state: State) => state.projects.file.permissions
  );
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);
  const [validateError, setValidateError] = useState<boolean>(false);
  const [userSearchArr, setUserSearchArr] = useState<Array<UserSearchRecord>>(
    []
  );

  const handleClose = () => {
    setOpen(false);
  };

  const handleGetPermissions = () => {
    setLoadingPermissions(true);
    getPermissions(folderUid, "project_folders")
      .then((permissions: Array<Permission>) => {
        dispatch(setUsersToFile(permissions));
      })
      .finally(() => {});
  };

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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    validateEmail(e.target.value);
    try {
      const searchResult = await searchUsers(e.target.value);
      const arr = searchResult.slice(0, 5);
      setUserSearchArr(arr);
    } catch (e) {}
  };

  const handleDelete = (permissionUid: string) => {
    deletePermission(permissionUid)
      .then(() => {
        alertAction.success(t("permissions-modal.alert.success"));
        handleGetPermissions();
      })
      .catch((e) => {
        alertAction.error(t("permissions-modal.alert.error"));
      });
  };

  useEffect(() => {
    if (open) {
      handleGetPermissions();
    }
  }, [open]);

  return (
    <div className={classes.root}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={classes.modal}
      >
        <Box sx={style}>
          <>
            <Grid
              container
              direction="row"
              justifyContent="space-evenly"
              alignItems="flex-start"
              xs={12}
            >
              <Grid item xs={12}>
                <List component="nav">
                  <Paper elevation={7}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">
                              {t("permissions-modal.users-table.name")}
                            </TableCell>
                            <TableCell align="center">
                              {t("permissions-modal.users-table.role")}
                            </TableCell>
                            <TableCell align="center">
                              {t("permissions-modal.users-table.permission")}
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(filePermissions || []).map(
                            (permission: Permission) => {
                              return (
                                <TableRow hover>
                                  <TableCell
                                    onClick={() =>
                                      dispatch(
                                        openUserProfileModal(permission.user)
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Avatar style={{ marginRight: 15 }} />
                                      {permission.user.name}
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    onClick={() =>
                                      dispatch(
                                        openUserProfileModal(permission.user)
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    {permission.user.role}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    onClick={() =>
                                      dispatch(
                                        openUserProfileModal(permission.user)
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    {permission.type === "edit"
                                      ? t(
                                          "permissions-modal.user-list.permission-edit"
                                        )
                                      : t(
                                          "permissions-modal.user-list.permission-view"
                                        )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      onClick={() => {
                                        handleDelete(permission.uid);
                                      }}
                                      edge="end"
                                      aria-label="delete"
                                    >
                                      <DeleteIcon color="primary" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </List>
              </Grid>
              <Grid xs={12} item>
                <Paper elevation={7}>
                  <Accordion className={classes.accordion}>
                    <AccordionSummary
                      expandIcon={<AddCircle color="primary" />}
                    >
                      <Typography>
                        {t("permissions-modal.accordion-label")}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid item xs={3}>
                        <div>
                          <TextField
                            id="outlined-start-adornment"
                            type="email"
                            color={validateError ? "secondary" : "primary"}
                            fullWidth={true}
                            placeholder={`${t(
                              "permissions-modal.input-search-placeholder"
                            )}`}
                            onChange={handleSearch}
                            error={validateError}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                            helperText={
                              validateError
                                ? t("organization-add-user.text-filed.error")
                                : null
                            }
                          />
                        </div>
                      </Grid>
                      <Grid item xs={9}>
                        <div>
                          <List component="nav">
                            {userSearchArr.map((u: UserSearchRecord) => {
                              return (
                                <UserList user={u} folderUid={folderUid} />
                              );
                            })}
                          </List>
                        </div>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </Grid>
            </Grid>
          </>
        </Box>
      </Modal>
    </div>
  );
};

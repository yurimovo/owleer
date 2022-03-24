import * as React from "react";
import { ChangeEvent, useState } from "react";
import { useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import { useTranslation } from "react-i18next";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { searchUsers } from "../../../utils/users/searchUsers";
import { UserSearchRecord } from "../../../types/UserTypes";
import PersonIcon from "@material-ui/icons/Person";
import List from "@material-ui/core/List";
import { Button } from "@material-ui/core";
import { createOrganization } from "../../../utils/organizations/createOrganization";
import { fetchUserOrganization } from "../../../utils/organizations/fetchUserOrganizations";
import { fetchUserOrganizationsActionRequest } from "../../../actions/actions";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "25px",
  p: 4,
};

const useStyles = makeStyles(() => ({
  setUserList: {
    height: "230px",
    overflowY: "scroll",
  },
  userList: {
    display: "flex",
    justifyContent: "space-between",
    minHeight: "200px",
    marginTop: "20px",
  },
  createBtn: {
    marginTop: "20px",
    float: "right",
  },
  addUserBlock: {
    display: "flex",
    flexDirection: "column",
  },
  modalAttr: {
    marginTop: "20px",
  },
}));

interface IcreateOrganizationModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateOrganizationModal: React.FC<IcreateOrganizationModal> = ({
  open,
  setOpen,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [userSearchArr, setUserSearchArr] = useState<Array<UserSearchRecord>>(
    []
  );
  const [userEmails, setUserEmails] = useState<Array<string>>([]);
  const [inviteEmail, setInviteMail] = useState<string>("");
  const [nameOrganization, setNameOrganization] = useState("");
  const [errorSearchFiled, setErrorSearchField] = useState(false);
  const [validateError, setValidateError] = useState<boolean>(false);

  const { alertAction } = useSnackBar();

  const handleClose = () => {
    setOpen(false);
    setUserSearchArr([]);
    setErrorSearchField(false);
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
      setInviteMail(e.target.value);
      const searchResult = await searchUsers(e.target.value);
      const arr = searchResult.slice(0, 5);
      setUserSearchArr(arr);
    } catch (e) {}
  };

  const handleSetUser = (email: string) => {
    setInviteMail(email);
    setUserEmails([...userEmails, email]);
    setUserSearchArr([]);
    setInviteMail("");
  };

  const handleAddUser = () => {
    if (userEmails.indexOf(inviteEmail) === -1 && inviteEmail !== "") {
      setUserEmails([...userEmails, inviteEmail]);
      setUserSearchArr([]);
      setInviteMail("");
    }
  };

  const handleCreateOrganization = async () => {
    const organizationInfo = {
      name: nameOrganization,
      image_url: null,
      members_emails: userEmails,
    };
    setErrorSearchField(false);
    if (organizationInfo.name !== "") {
      try {
        createOrganization(organizationInfo).then(async () => {
          fetchUserOrganization().then((organizationsData) => {
            dispatch(fetchUserOrganizationsActionRequest());
            alertAction.success(t("create-organization-modal.alert.success"));
            handleClose();
          });
        });
      } catch (e) {
        alertAction.error(t("create-organization-modal.alert.error"));
      }
    } else if (organizationInfo.name === "") {
      setErrorSearchField(true);
    } else {
      setErrorSearchField(false);
    }
  };

  const handleNameOrganization = (e: ChangeEvent<HTMLInputElement>) => {
    setNameOrganization(e.target.value);
  };

  const handleDeleteEmailUser = (email: string) => {
    const arr = userEmails;
    const findIndex = arr.findIndex((res) => res === email);
    const newArr = [...arr.slice(0, findIndex), ...arr.slice(findIndex + 1)];
    setUserEmails(newArr);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <TextField
          className={classes.modalAttr}
          error={errorSearchFiled}
          helperText={
            errorSearchFiled
              ? t(
                  "create-organization-modal.text-field.organization-name.error"
                )
              : null
          }
          placeholder={t(
            "create-organization-modal.text-field.organization-name.label"
          )}
          label={t(
            "create-organization-modal.text-field.organization-name.label"
          )}
          variant="outlined"
          fullWidth={true}
          name={"nameOrganization"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleNameOrganization(e)
          }
        ></TextField>

        <Typography className={classes.modalAttr}>
          {t("create-organization-modal.label")}
        </Typography>

        <div>
          <div className={classes.userList}>
            <div>
              <div className={classes.addUserBlock}>
                <TextField
                  color={validateError ? "secondary" : "primary"}
                  error={validateError}
                  helperText={
                    validateError
                      ? t(
                          "create-organization-modal.text-field.user-email.error"
                        )
                      : null
                  }
                  className={classes.modalAttr}
                  placeholder={"Email"}
                  onChange={handleSearch}
                  value={inviteEmail}
                />
                <Button
                  color="primary"
                  variant="contained"
                  disabled={validateError}
                  onClick={handleAddUser}
                >
                  {t("create-organization-modal.add-btn-user")}
                </Button>
              </div>
              <List component="nav">
                {userSearchArr.map((u: UserSearchRecord) => {
                  return (
                    <ListItem button onClick={() => handleSetUser(u.email)}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={u.email} secondary={u.role} />
                    </ListItem>
                  );
                })}
              </List>
            </div>
            <div className={classes.setUserList}>
              <List>
                {userEmails.map((email: string) => {
                  return (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={email} />
                      <Button onClick={() => handleDeleteEmailUser(email)}>
                        <HighlightOffIcon />
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            </div>
          </div>
        </div>
        <Button
          color="primary"
          variant="contained"
          className={classes.createBtn}
          onClick={handleCreateOrganization}
        >
          {t("create-organization-modal.create-organization-btn")}
        </Button>
      </Box>
    </Modal>
  );
};

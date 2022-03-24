import { UserSearchRecord } from "../../../types/UserTypes";
import {
  Avatar,
  Button,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import List from "@material-ui/core/List";
import { searchUsers } from "../../../utils/users/searchUsers";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import * as React from "react";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import SearchIcon from "@material-ui/icons/Search";
import { addMemberOrganization } from "../../../utils/organizations/addMemberOrganization";
import { fetchOrganizationByUid } from "../../../utils/organizations/fetchOrganizationByUid";
import { useDispatch } from "react-redux";
import { fetchOrganizationDataActionSuccess } from "../../../actions/actions";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";

interface IorganizationAddUser {
  uid: string;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const OrganizationAddUser: React.FC<IorganizationAddUser> = ({
  uid,
}) => {
  const dispatch = useDispatch();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setUserSearchArr([]);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [userSearchArr, setUserSearchArr] = useState<Array<UserSearchRecord>>(
    []
  );
  const [validateError, setValidateError] = useState<boolean>(false);

  const handleAddUser = async (email: string, uid: string) => {
    await addMemberOrganization(uid, email);
    const organizationData = await fetchOrganizationByUid(uid);
    dispatch(fetchOrganizationDataActionSuccess(organizationData));
    alertAction.success(`${email} ${t("organization-add-user.alert.success")}`);
    handleClose();
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

  return (
    <>
      <AddCircleOutlineIcon fontSize="large" onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField
            id="outlined-start-adornment"
            type="email"
            color={validateError ? "secondary" : "primary"}
            fullWidth={true}
            placeholder={"Email"}
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
              validateError ? t("organization-add-user.text-filed.error") : null
            }
          />
          <List component="nav">
            {userSearchArr.map((u: UserSearchRecord) => {
              return (
                <ListItem button key={u.uid}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={u.email} secondary={u.role} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddUser(u.email, uid)}
                  >
                    {t("organization-add-user.add-user-btn")}
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Modal>
    </>
  );
};

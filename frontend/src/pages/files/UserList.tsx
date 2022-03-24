import {
  Avatar,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  NativeSelect,
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import * as React from "react";
import { UserSearchRecord } from "../../types/UserTypes";
import { useState } from "react";
import { grantPermission } from "../../utils/permission/grantPermission";
import { getPermissions } from "../../utils/permission/getPermission";
import { Permission } from "../../types/PermissionType";
import { openUserProfileModal, setUsersToFile } from "../../actions/actions";
import { useDispatch } from "react-redux";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { useTranslation } from "react-i18next";

interface IUserList {
  user: UserSearchRecord;
  folderUid: string;
}

const useStyles = makeStyles(() => ({
  permissionBlock: {
    display: "flex",
    justifyContent: "center",
  },
  autoComplete: {
    width: "200px",
    paddingRight: 10,
  },
  saveButton: {
    maxHeight: 35,
  },
}));

export const UserList: React.FC<IUserList> = ({ user, folderUid }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const [selectPermission, setSelectPermission] = useState<string>("view");

  const handlePermission = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectPermission(event.target.value as string);
  };

  const handleSaveUserPermission = () => {
    grantPermission({
      objectName: "project_folders",
      objectUid: folderUid,
      userEmail: user.email,
      permission: selectPermission,
    }).then((r) => {
      getPermissions(folderUid, "project_folders")
        .then((permissions: Array<Permission>) => {
          dispatch(setUsersToFile(permissions));
          alertAction.success(t("permissions-modal.user-list.alert.success"));
        })
        .finally(() => {});
    });
  };

  return (
    <>
      <ListItem button key={user.uid}>
        <ListItemAvatar>
          <Avatar>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={user.email}
          secondary={user.role}
          onClick={() => dispatch(openUserProfileModal(user))}
        />
        <div className={classes.permissionBlock}>
          <FormControl className={classes.autoComplete}>
            <NativeSelect value={selectPermission} onChange={handlePermission}>
              <option value={"view"}>
                {t("permissions-modal.user-list.permission-view")}
              </option>
              <option value={"edit"}>
                {t("permissions-modal.user-list.permission-edit")}
              </option>
            </NativeSelect>
            <FormHelperText>
              {t("permissions-modal.user-list.form-helper")}
            </FormHelperText>
          </FormControl>
          <Button
            className={classes.saveButton}
            onClick={handleSaveUserPermission}
            variant="contained"
            color="primary"
          >
            {t("permissions-modal.user-list.save-btn")}
          </Button>
        </div>
      </ListItem>
      <Divider />
    </>
  );
};

import {
  Avatar,
  FormControlLabel,
  ListItemAvatar,
  ListItemText,
  Switch,
} from "@material-ui/core";
import * as React from "react";
import { UserInOrhanization } from "../../../types/OrganizationTypes";
import {useEffect, useState} from "react";
import PersonIcon from "@material-ui/icons/Person";
import {useDispatch} from "react-redux";
import {openUserProfileModal} from "../../../actions/actions";

interface IUserOnList {
  user: UserInOrhanization,
  selectAllUsers?: boolean,
  handleAddUserEmail: (email: string) => void;
}

export const UserOnList: React.FC<IUserOnList> = ({
  user,
  handleAddUserEmail, selectAllUsers
}) => {
  const [selected, setSelected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
      if (selectAllUsers) {
          setSelected(true);
      } else {
          setSelected(false);
      }
  },[selectAllUsers])

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer"}} onClick={() => dispatch(openUserProfileModal(user.user))}>
        <ListItemAvatar>
          <Avatar>{user.user.name ? user.user.name[0] : <PersonIcon />}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={user.user.name} secondary={user.user.role} />
      </div>
      <FormControlLabel
        style={{ margin: 0 }}
        label={null}
        onChange={() => {
              setSelected(!selected);
              handleAddUserEmail(user.user.email)
        }}
        control={<Switch color="primary" checked={selected} />}
      />
    </div>
  );
};

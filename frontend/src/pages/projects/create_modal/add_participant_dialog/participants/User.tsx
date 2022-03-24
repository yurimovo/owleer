import {
  Avatar,
  Input,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import React, { useState } from "react";
import {
  ProjectParticipantsGroup,
  ProjectUserParticipant,
} from "../../../../../types/ProjectTypes";
import SearchIcon from "@material-ui/icons/Search";
import PersonIcon from "@material-ui/icons/Person";
import List from "@material-ui/core/List";
import { UserSearchRecord } from "../../../../../types/UserTypes";
import { searchUsers } from "../../../../../utils/users/searchUsers";

type UserProps = {
  group: ProjectParticipantsGroup;
  setOpenAddForm(value: boolean): void;
};
export const User: React.FC<UserProps> = ({ group, setOpenAddForm }) => {
  const [users, setUsers] = useState<Array<UserSearchRecord>>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const searchResult = await searchUsers(e.target.value);
      setUsers(searchResult);
    } catch (e) {}
  };

  const handleRecordClick = (userRecord: UserSearchRecord) => {
    group.users.push({
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone,
      uid: userRecord.uid,
      role: userRecord.role,
    } as ProjectUserParticipant);
    setOpenAddForm(false);
  };

  return (
    <div>
      <Input
        placeholder={"Email"}
        onChange={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />
      <List component="nav">
        {users.map((u: UserSearchRecord) => {
          return (
            <ListItem button onClick={() => handleRecordClick(u)}>
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
  );
};

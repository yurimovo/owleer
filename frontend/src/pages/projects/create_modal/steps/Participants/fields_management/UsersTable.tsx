import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  TableHead,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import HighlightOffRoundedIcon from "@material-ui/icons/HighlightOffRounded";
import { useTranslation } from "react-i18next";
import React, { useReducer } from "react";
import {
  ProjectParticipantsGroup,
  ProjectUserParticipant,
} from "../../../../../../types/ProjectTypes";

const useStyles = makeStyles(() =>
  createStyles({
    fieldsRoot: {
      display: "flex",
      alignItems: "center",
    },
  })
);

interface IusersTable {
  group: ProjectParticipantsGroup;
}

const UsersTable: React.FC<IusersTable> = ({ group }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("users-table.table.full-name")}</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>{t("users-table.table.phone")}</TableCell>
          <TableCell>{t("users-table.table.role")}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>{" "}
      <TableBody>
        {group.users.map((u: ProjectUserParticipant, index: number) => {
          return (
            <TableRow>
              <TableCell>
                <TextField
                  variant="outlined"
                  value={u?.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    u.name = e.target.value;
                    forceUpdate();
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField variant="outlined" value={u?.email} disabled />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  value={u?.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    u.phone = e.target.value;
                    forceUpdate();
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  value={u?.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    u.role = e.target.value;
                    forceUpdate();
                  }}
                />
              </TableCell>
              <TableCell>
                <span
                  className={classes.fieldsRoot}
                  onClick={() => {
                    delete group.users[index];
                    forceUpdate();
                  }}
                >
                  <HighlightOffRoundedIcon fontSize="medium" />
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

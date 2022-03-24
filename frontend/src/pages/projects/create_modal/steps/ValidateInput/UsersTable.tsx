import { ProjectUserParticipant } from "../../../../../types/ProjectTypes";
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import React from "react";

interface IusersTable {
  users: Array<ProjectUserParticipant>;
}

const UsersTable: React.FC<IusersTable> = ({ users }) => {
  const { t, i18n } = useTranslation();
  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("validate-input.users-table.table.name")}</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>{t("validate-input.users-table.table.phone")}</TableCell>
          <TableCell>{t("validate-input.users-table.table.role")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(users || []).map((u: ProjectUserParticipant) => {
          return (
            <TableRow>
              <TableCell>{u?.name}</TableCell>
              <TableCell>{u?.email}</TableCell>
              <TableCell>{u?.phone}</TableCell>
              <TableCell>{u?.role}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

import { ProjectCompanyParticipant } from "../../../../../types/ProjectTypes";
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import React from "react";

interface IcompaniesTable {
  companies: Array<ProjectCompanyParticipant>;
}

const CompaniesTable: React.FC<IcompaniesTable> = ({ companies }) => {
  const { t, i18n } = useTranslation();

  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            {t("validate-input.companies-table.table.name")}
          </TableCell>
          <TableCell>
            {t("validate-input.companies-table.table.role")}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(companies || []).map((c: ProjectCompanyParticipant) => {
          return (
            <TableRow>
              <TableCell>{c?.name}</TableCell>
              <TableCell>{c?.role}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CompaniesTable;

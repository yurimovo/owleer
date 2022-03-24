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
  ProjectCompanyParticipant,
  ProjectParticipantsGroup,
} from "../../../../../../types/ProjectTypes";

const useStyles = makeStyles(() =>
  createStyles({
    fieldsRoot: {
      display: "flex",
      alignItems: "center",
    },
  })
);

interface IcompaniesTable {
  group: ProjectParticipantsGroup;
}

const CompaniesTable: React.FC<IcompaniesTable> = ({ group }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("companies-table.table.company-name")}</TableCell>
          <TableCell>{t("companies-table.table.company-role")}</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>{" "}
      <TableBody>
        {group.companies.map((c: ProjectCompanyParticipant, index: number) => {
          return (
            <TableRow>
              <TableCell>{c?.name}</TableCell>
              <TableCell>
                <TextField
                  variant="outlined"
                  value={c?.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    c.role = e.target.value;
                    forceUpdate();
                  }}
                />
              </TableCell>
              <TableCell>
                <span
                  className={classes.fieldsRoot}
                  onClick={() => {
                    delete group.companies[index];
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

export default CompaniesTable;

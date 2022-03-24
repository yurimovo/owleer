import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { CreateProjectData } from "../../../../../types/ProjectTypes";
import { useTranslation } from "react-i18next";
import React from "react";

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      "& TableCell": {
        fontWeight: "bold",
      },
    },
  })
);

interface IprojectInfoTable {
  projectData: CreateProjectData;
}

const ProjectInfoTable: React.FC<IprojectInfoTable> = ({ projectData }) => {
  const { t, i18n } = useTranslation();
  const classes = useStyles();

  return (
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow className={classes.label}>
          <TableCell>
            {t("validate-input.project-info-table.table.company")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.name")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.description")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.status")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.country")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.city")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.neighbourhood")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.zip-code")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.address")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.floors-above-level")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.floors-behind-level")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.site-size")}
          </TableCell>
          <TableCell>
            {t("validate-input.project-info-table.table.type")}
          </TableCell>
          {/* <TableCell>Phases</TableCell> */}
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow key={projectData.name}>
          <TableCell>{projectData.initiatorCompany?.name}</TableCell>
          <TableCell>{projectData.name}</TableCell>
          <TableCell>{projectData.description}</TableCell>
          <TableCell>{projectData.status}</TableCell>
          <TableCell>{projectData.country}</TableCell>
          <TableCell>{projectData.city}</TableCell>
          <TableCell>{projectData.data.neighbourhood}</TableCell>
          <TableCell>{projectData.data.zip_code}</TableCell>
          <TableCell>{projectData.data.address}</TableCell>
          <TableCell>{projectData.floors_above_level}</TableCell>
          <TableCell>{projectData.floors_behind_level}</TableCell>
          <TableCell>{projectData.site_size}</TableCell>
          <TableCell>{projectData.type}</TableCell>
          {/*                            <TableCell>{n.phases}</TableCell>*/}
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ProjectInfoTable;

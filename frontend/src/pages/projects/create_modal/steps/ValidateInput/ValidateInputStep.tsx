import React from "react";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { CreateProjectData } from "../../../../../types/ProjectTypes";
import CompaniesTable from "./CompaniesTable";
import UsersTable from "./UsersTable";
import ProjectInfoTable from "./ProjectInfoTable";

type AllInfoCreateProjectProps = {
  projectData: CreateProjectData;
};

const useStyles = makeStyles(() =>
  createStyles({
    rootAllInfo: {
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    tableHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      paddingTop: "15px",
    },
    emptyLine: {
      color: "red",
      fontWeight: "bold",
      fontSize: "11px",
      textAlign: "justify",
    },
  })
);

export const ValidateInputStep: React.FC<AllInfoCreateProjectProps> = ({
  projectData,
}) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  return (
    <div className={classes.rootAllInfo}>
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.info-create-project")}
      </Typography>
      <ProjectInfoTable projectData={projectData} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.management")}
      </Typography>
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.companies")}
      </Typography>
      <CompaniesTable companies={projectData.groups.management.companies} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.contractors")}
      </Typography>
      <UsersTable users={projectData.groups.management.users} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.engineering")}
      </Typography>
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.companies")}
      </Typography>
      <CompaniesTable companies={projectData.groups.engineering.companies} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.contractors")}
      </Typography>
      <UsersTable users={projectData.groups.engineering.users} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.field")}
      </Typography>
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.companies")}
      </Typography>
      <CompaniesTable companies={projectData.groups.field.companies} />
      <Typography className={classes.tableHeader}>
        {t("validate-input.validate-input-step.contractors")}
      </Typography>
      <UsersTable users={projectData.groups.field.users} />
    </div>
  );
};

import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import { useTranslation } from "react-i18next";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useState } from "react";
import { AddParticipantDialog } from "../../../add_participant_dialog/AddParticipantDialog";
import { ProjectParticipantsGroup } from "../../../../../../types/ProjectTypes";
import AddIcon from "@material-ui/icons/Add";
import { AccordionActions, Button } from "@material-ui/core";
import CompaniesTable from "./CompaniesTable";
import UsersTable from "./UsersTable";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accordion: {
      margin: "10px",
    },
    addButton: {
      width: "40px",
      height: "40px",
      float: "right",
      marginTop: "10px",
    },
    fields: {
      margin: theme.spacing(1, 1),
      border: "2px rgba(0, 0, 0, 0.38) solid",
      padding: "5px",
      borderRadius: "5px",
      "&:focus": {
        outline: "none",
        border: "2px #3f51b5 solid",
      },
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    accordionContent: {
      display: "flex",
      justifyContent: "center",
    },
  })
);

interface IaccordionAddManagementFields {
  title: string;
  group: ProjectParticipantsGroup;
}

export const GroupFieldsManagement: React.FC<IaccordionAddManagementFields> = ({
  title,
  group,
}) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const [openAddForm, setOpenAddForm] = useState(false);

  return (
    <div>
      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionContent}>
          <span>
            <CompaniesTable {...{ group }} />
          </span>
        </AccordionDetails>
        <AccordionDetails className={classes.accordionContent}>
          <span>
            <UsersTable {...{ group }} />
          </span>
        </AccordionDetails>
        <AccordionActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setOpenAddForm(true);
            }}
          >
            {t("group-fields-management.add-btn")} <AddIcon />
          </Button>
        </AccordionActions>
      </Accordion>
      <AddParticipantDialog
        openAddForm={openAddForm}
        setOpenAddForm={setOpenAddForm}
        group={group}
      />{" "}
    </div>
  );
};

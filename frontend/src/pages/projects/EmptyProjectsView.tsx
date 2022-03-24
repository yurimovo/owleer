import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import CreateProjectModal from "./create_modal/CreateProjectModal";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginTop: "20%",
      overflow: "hidden",
    },
    addButtonContainer: {
      display: "flex",
      padding: "30px",
      cursor: "pointer",
      border: "2px #d6d6d6 dashed",
      "&:hover": {
        border: "2px #474747 dashed",
      },
    },
    textAddButton: {
      paddingLeft: "15px",
      fontWeight: "bold",
      color: "#787878",
      "&:hover": {
        color: "black",
      },
    },
  })
);

function EmptyProjectsView() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [openCreateProjectModal, setOpenCreateProjectModal] = useState(false);

  const handleOpenModal = () => {
    setOpenCreateProjectModal(true);
  };

  return (
    <div>
      <Grid
        className={classes.root}
        container
        justifyContent="center"
        alignItems="center"
      >
        <div className={classes.addButtonContainer} onClick={handleOpenModal}>
          <p className={classes.textAddButton}>
            {t("empty-project-view.label")}
          </p>
        </div>
      </Grid>
      <CreateProjectModal
        {...{
          open: openCreateProjectModal,
          setOpen: setOpenCreateProjectModal,
        }}
      />
    </div>
  );
}

export default EmptyProjectsView;

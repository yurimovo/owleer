import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  Divider,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import EditOffIcon from "../../../../utils/icons/EditOffIcon.svg";
import EditIcon from "@material-ui/icons/Edit";

import {
  AddLocation,
  ArrowLeft,
  ArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  VisibilityOff,
} from "@material-ui/icons";
import AssessmentIcon from "@material-ui/icons/Assessment";
import VisibilityIcon from "@material-ui/icons/Visibility";
import GestureIcon from "@material-ui/icons/Gesture";
import UndoIcon from "@material-ui/icons/Undo";

const useStyles = makeStyles(() => ({
  rootControlPanel: {
    backgroundColor: "#dfdfe3",
    display: "fixed",
    width: "100% ",
    justifyContent: "space-between",
    alignItems: "center",
    "& Button": {
      width: "10px",
      color: "#5b6dd0",
    },
    "& Input": {
      width: "20px",
      color: "#5b6dd0",
    },
  },
  pages: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5b6dd0",
    marginLeft: "1%",
  },
  Button: {
    width: "20px",
  },
  colorButtonBlock: {
    display: "flex",
    marginRight: "1%",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const ControlPanel = (props) => {
  const {
    undoFlag,
    setUndoFlag,
    name,
    pageNumber,
    numPages,
    drawMode,
    setPageNumber,
  } = props;

  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === numPages;

  const firstPageClass = isFirstPage ? "disabled" : "clickable";
  const lastPageClass = isLastPage ? "disabled" : "clickable";

  const goToFirstPage = () => {
    if (!isFirstPage) setPageNumber(1);
  };

  const goToPreviousPage = () => {
    if (!isFirstPage) setPageNumber(pageNumber - 1);
  };

  const goToNextPage = () => {
    if (!isLastPage) setPageNumber(pageNumber + 1);
  };

  const goToLastPage = () => {
    if (!isLastPage) setPageNumber(numPages);
  };

  const handleShowIssue = () => {
    props.handleShowIssue();
  };

  const handleAddNewIssue = () => {
    props.handleAddNewIssue();
  };

  const handleDrawMode = () => {
    props.handleDrawMode();
  };

  const handleUndoFlag = () => {
    setUndoFlag(undoFlag + 1);
  }

  return (
    <Paper>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Grid
            container
            xs={12}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={3}>
              <Typography align="left" className={classes.fileName}>
                {name}
              </Typography>
            </Grid>

            <Grid container xs={5} justifyContent="center">
              <Button>
                <ArrowLeft
                  color="primary"
                  className={firstPageClass}
                  onClick={goToFirstPage}
                />
              </Button>
              <Button className={firstPageClass} onClick={goToPreviousPage}>
                <KeyboardArrowLeft color="primary" />{" "}
              </Button>
              <Typography style={{ fontSize: 12 }}>
                {t("pdf-files-view.control-panel.page")}{" "}
                <Typography style={{ fontSize: 12 }}>
                  {pageNumber} {t("pdf-files-view.control-panel.of")} {numPages}
                </Typography>
              </Typography>
              <Button className={lastPageClass} onClick={goToNextPage}>
                <KeyboardArrowRight color="primary" />
              </Button>
              <Button className={lastPageClass} onClick={goToLastPage}>
                <ArrowRight color="primary" />
              </Button>
            </Grid>
            <Grid container justifyContent="flex-end" xs={4}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AssessmentIcon />}
                  onClick={() => {
                    props.setOpenReportModal(true);
                  }}
                >
                  {t("pdf-files-view.generate-report-btn")}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ margin: 7 }}
                  disabled={props.addNewIssue}
                  onClick={handleShowIssue}
                  endIcon={
                    props.showIssues ? <VisibilityIcon /> : <VisibilityOff />
                  }
                >
                  {props.showIssues
                    ? t("pdf-files-view.control-panel.issues")
                    : t("pdf-files-view.control-panel.hide-issues")}
                </Button>
                <Tooltip
                  style={{ marginRight: 7 }}
                  title={
                    props.addNewIssue
                      ? t("control-panel.disable-creator-issue")
                      : t("control-panel.enable-creator-issue")
                  }
                >
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={
                      props.showEditMode ? (
                        <img src={EditOffIcon} alt="Edit-off-icon" />
                      ) : (
                        <EditIcon />
                      )
                    }
                    onClick={() => props.setShowEditMode(!props.showEditMode)}
                  >
                    {t("pdf-files-view.control-panel.edit-mode")}
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {props.showEditMode ? (
          <Grid container alignItems="right">
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item>
              <Button
                style={{ margin: "5px" }}
                disabled={drawMode}
                onClick={handleAddNewIssue}
                variant="outlined"
                endIcon={<AddLocation color="primary" />}
              >
                {!props.addNewIssue
                  ? t("pdf-files-view.control-panel.add-new-issue")
                  : t("pdf-files-view.control-panel.exit-add-new-issue")}
              </Button>
              {drawMode ? (
                <Button
                  style={{ margin: "5px" }}
                  onClick={handleUndoFlag}
                  variant="outlined"
                  endIcon={<UndoIcon color="primary" />}
                >
                  {t("pdf-files-view.control-panel.undo-draw")}
                </Button>
              ) : null}
              <Button
                style={{ margin: "5px" }}
                disabled={props.addNewIssue}
                onClick={handleDrawMode}
                variant="outlined"
                endIcon={<GestureIcon color="primary" />}
              >
                {!props.drawMode
                  ? t("pdf-files-view.control-panel.start-draw-mode")
                  : t("pdf-files-view.control-panel.stop-draw-mode")}
              </Button>
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    </Paper>
  );
};

export default ControlPanel;

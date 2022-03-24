import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginTop: "20%",
      overflow: "hidden",
    },
    text: {
      paddingLeft: "15px",
      fontWeight: "bold",
      color: "#D3D3D3",
      fontSize: 24,
    },
  })
);

function NoProjectSelectedView() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  return (
    <div>
      <Grid
        className={classes.root}
        container
        justifyContent="center"
        alignItems="center"
      >
        <p className={classes.text}>
          {t("no-project-selected-view.no-project-label")}
        </p>
      </Grid>
    </div>
  );
}

export default NoProjectSelectedView;

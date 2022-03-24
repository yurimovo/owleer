import { createStyles, makeStyles, Paper } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: "100%",
      width: "100%",
      position: "fixed",
      justifyItems: "center",
    },
    text: {
      marginTop: "20%",
      marginLeft: "30%",
      fontWeight: "bold",
      color: "#D3D3D3",
      fontSize: 24,
    },
  })
);

export default function Integrations() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <p className={classes.text}>Coming Soon...</p>
    </Paper>
  );
}

import { createStyles, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { OwleerAppBar } from "./OwleerAppBar";
import { OwleerDrawer } from "./OwleerDrawer";
import clsx from "clsx";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { State } from "../types/ReducerTypes";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      height: "100vh",
      width: "100%",
      overflow: "hidden",
    },
    body: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      marginTop: 72,
    },
    content: {
      flexGrow: 1,
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginInlineStart: 240,
    },
  })
);

export const OwleerContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  const urlState = useSelector((state: State) => state.utils.url);
  const history = useHistory();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [url, setUrl] = useState<string>(urlState);

  useEffect(() => {
    if (urlState) {
      setUrl(urlState);
    } else {
      setUrl(history.location.pathname.split("/").join("-"));
    }
  }, [urlState]);

  return (
    <div>
      <OwleerAppBar url={url} handleDrawerOpen={handleDrawerOpen} open={open} />
      <div className={classes.body}>
        <div className={classes.content}>
          <OwleerDrawer
            url={url}
            handleDrawerClose={handleDrawerClose}
            handleDrawerOpen={handleDrawerOpen}
            open={open}
          />
          <div
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import SettingsIcon from "@material-ui/icons/Settings";
import WorkIcon from "@material-ui/icons/Work";
import GroupIcon from "@material-ui/icons/Group";
import DescriptionIcon from "@material-ui/icons/Description";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import LocalPrintshopIcon from "@material-ui/icons/LocalPrintshop";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import DynamicFeedIcon from "@material-ui/icons/DynamicFeed";
import { useTranslation } from "react-i18next";
import { ReactComponent as AutodeskIcon } from "./../integrations/autodesk/resources/Autodesk.svg";
import { ReactComponent as MondayIcon } from "./../integrations/monday/resources/Monday.svg";
import { ReactComponent as MondayWhiteIcon } from "./../integrations/monday/resources/Monday-white.svg";
import { ReactComponent as ZoomIcon } from "./../utils/icons/ZoomIconMenu.svg";
import { ReactComponent as ZoomIconSelected } from "./../utils/icons/ZoomIconMenuSelected.svg";
import { Link } from "react-router-dom";
import {
  Dashboard,
  ExpandLess,
  ExpandMore,
  NoteAdd,
  StarBorder,
  TrackChanges,
} from "@material-ui/icons";
import { useSelector } from "react-redux";
import { State } from "../types/ReducerTypes";
import { Collapse } from "@material-ui/core";

const drawerWidth = 240;
interface IowleerDrawer {
  open: boolean;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  url: string;
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    drawerContainer: {
      overflow: "auto",
    },
    link: {
      textDecoration: "none",
      color: theme.palette.text.primary,
      display: "flex",
    },
    appBar: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    rootSup: {
      color: "#3f51b5",
    },
  })
);

const CLICKED_STYLE = {
  backgroundColor: "#f16644",
  color: "#ffffff",
  opacity: "85%",
};

export const OwleerDrawer: React.FC<IowleerDrawer> = ({ open, url }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const setContextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [openPrintery, setOpenPrintery] = React.useState(false);

  const handleOpenPrinterySection = () => {
    setOpenPrintery(!openPrintery);
  };

  return (
    <div>
      <div className={classes.root}>
        <CssBaseline />
        <Drawer
          className={classes.drawer}
          variant="persistent"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              <Link
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/projects"}
                style={url === "-projects" ? CLICKED_STYLE : undefined}
                className={classes.link}
              >
                <ListItem button key={"Projects"}>
                  <ListItemIcon>
                    <WorkIcon
                      style={url === "-projects" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.projects")} />
                </ListItem>
              </Link>
              <Divider />
              <Link
                style={url === "-dashboard" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={setContextProject ? "/dashboard" : "/projects"}
                className={classes.link}
              >
                <ListItem
                  disabled={!setContextProject}
                  button
                  key={"Dashboard"}
                >
                  <ListItemIcon>
                    <Dashboard
                      style={url === "-dashboard" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.dashboard")} />
                </ListItem>
              </Link>
              <Link
                style={
                  setContextProject?.is_admin
                    ? url === "-feed"
                      ? CLICKED_STYLE
                      : undefined
                    : { pointerEvents: "none", opacity: 0.5 }
                }
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/feed"}
                className={classes.link}
              >
                <ListItem disabled={!setContextProject} button key={"Feed"}>
                  <ListItemIcon>
                    <DynamicFeedIcon
                      style={url === "-feed" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.feed")} />
                </ListItem>
              </Link>
              <Link
                style={url === "-files" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/files"}
                className={classes.link}
              >
                <ListItem button key={"Files"}>
                  <ListItemIcon>
                    <DescriptionIcon
                      style={url === "-files" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.files")} />
                </ListItem>
              </Link>

              <List>
                <ListItem button onClick={handleOpenPrinterySection}>
                  <ListItemIcon>
                    <LocalPrintshopIcon />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.printery")} />
                  {openPrintery ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openPrintery} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Link
                      style={
                        url === "-create-order" ? CLICKED_STYLE : undefined
                      }
                      to={"/create-order"}
                      className={classes.link}
                    >
                      <ListItem button key={"create-order"}>
                        <ListItemIcon>
                          <NoteAdd
                            style={
                              url === "-create-order"
                                ? CLICKED_STYLE
                                : undefined
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={t("app-drawer.list-item.create-order")}
                        />
                      </ListItem>
                    </Link>
                    <Link
                      style={
                        setContextProject?.is_admin
                          ? url === "-order_printery"
                            ? CLICKED_STYLE
                            : undefined
                          : { pointerEvents: "none", opacity: 0.5 }
                      }
                      to={"/project-order-printery"}
                      className={classes.link}
                    >
                      <ListItem
                        style={
                          url === "-project-order-printery"
                            ? CLICKED_STYLE
                            : undefined
                        }
                        button
                        key={"Project Orders"}
                      >
                        <ListItemIcon>
                          <AssignmentTurnedInIcon
                            style={
                              url === "-project-order-printery"
                                ? CLICKED_STYLE
                                : undefined
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={t("app-drawer.list-item.project-orders")}
                        />
                      </ListItem>
                    </Link>
                    <Link
                      style={
                        url === "-my-order-printery" ? CLICKED_STYLE : undefined
                      }
                      to={"/my-order-printery"}
                      className={classes.link}
                    >
                      <ListItem button key={"My Orders"}>
                        <ListItemIcon>
                          <StarBorder
                            style={
                              url === "-my-order-printery"
                                ? CLICKED_STYLE
                                : undefined
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={t("app-drawer.list-item.my-orders")}
                        />
                      </ListItem>
                    </Link>
                  </List>
                </Collapse>
              </List>
              <Divider />

              <Link
                style={url === "-mail-tracker" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/mail-tracker"}
                className={classes.link}
              >
                <ListItem button key={"mail-tracker"}>
                  <ListItemIcon>
                    <TrackChanges
                      style={
                        url === "-mail-tracker" ? CLICKED_STYLE : undefined
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("app-drawer.list-item.mail-tracker")}
                  />
                </ListItem>
              </Link>
              <Link
                style={url === "-organizations" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/organizations"}
                className={classes.link}
              >
                <ListItem button key={"Organizations"}>
                  <ListItemIcon>
                    <GroupIcon
                      style={
                        url === "-organizations" ? CLICKED_STYLE : undefined
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t("app-drawer.list-item.organizations")}
                  />
                </ListItem>
              </Link>
              <Divider />
              <Link
                style={
                  url.includes("-integrations-monday")
                    ? CLICKED_STYLE
                    : undefined
                }
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/integrations/monday"}
                className={classes.link}
              >
                <ListItem
                  style={
                    url.includes("-integrations-monday")
                      ? CLICKED_STYLE
                      : undefined
                  }
                  onClick={() => {
                    setOpenPrintery(false);
                  }}
                  button
                  key={"monday"}
                >
                  <ListItemIcon>
                    {url.includes("-integrations-monday") ? (
                      <MondayWhiteIcon />
                    ) : (
                      <MondayIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={"monday.com"} />
                </ListItem>
              </Link>
              <ListItem
                style={url === "Autodesk Cloud" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                disabled
                button
                key={"Autodesk Cloud"}
              >
                <ListItemIcon>
                  <AutodeskIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("app-drawer.list-item.autodesk")}
                  secondary={<sup className={classes.rootSup}>Coming soon</sup>}
                />
              </ListItem>
              {/* <Link
                style={
                  url.includes("-integrations-zoom") ? CLICKED_STYLE : undefined
                }
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/integrations/zoom"}
                className={classes.link}
              >
                <ListItem button key={"Zoom"}>
                  <ListItemIcon>
                    {url.includes("-integrations-zoom") ? (
                      <ZoomIconSelected />
                    ) : (
                      <ZoomIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Zoom" />
                </ListItem>
              </Link> */}
              <Divider />
              <Link
                style={url === "-profile" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/profile"}
                className={classes.link}
              >
                <ListItem button key={"Profile"}>
                  <ListItemIcon>
                    <AccountCircleIcon
                      style={url === "-profile" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.profile")} />
                </ListItem>
              </Link>
              <Link
                style={url === "-settings" ? CLICKED_STYLE : undefined}
                onClick={() => {
                  setOpenPrintery(false);
                }}
                to={"/settings"}
                className={classes.link}
              >
                <ListItem button key={"Settings"}>
                  <ListItemIcon>
                    <SettingsIcon
                      style={url === "-settings" ? CLICKED_STYLE : undefined}
                    />
                  </ListItemIcon>
                  <ListItemText primary={t("app-drawer.list-item.settings")} />
                </ListItem>
              </Link>
            </List>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

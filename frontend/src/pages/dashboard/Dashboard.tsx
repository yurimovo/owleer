import { Cancel, Edit, Save } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  Input,
} from "@material-ui/core";
import { State } from "../../types/ReducerTypes";
import { UsersTable } from "./UsersTable";
import Files from "../files/Files";
import { ProjectInfo } from "./ProjectInfo";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProject } from "../../utils/projects/updateProject";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import Loader from "../../utils/elements/Loader";
import { fetchProject } from "../../utils/projects/fetchProject";
import { setContextProjectAction } from "../../actions/actions";
import { useTranslation } from "react-i18next";
import { FilesView } from "./filtered-files-view/FilesView";
import { updateProjectSubscription } from "../../utils/projects/updateProjectSubscription";

const useStyles = makeStyles((theme) => ({
  gridRoot: {
    paddingLeft: "2%",
    paddingTop: "2%",
    paddingBottom: "5%",
    maxWidth: "100%",
  },
  columnName: {},
  rootPaper: {
    padding: 20,
  },
  avatar: {
    marginRight: "20px",
  },
  permissionIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  files: {
    width: "100%",
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { alertAction } = useSnackBar();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [editProjectName, setEditProjectName] = useState(false);
  const [projectName, setProjectName] = useState<string>(contextProject?.name);
  const [subscribe, setSubscribe] = useState<boolean>(
    contextProject?.subscribe
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const handleEditProjectName = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setProjectName(e.target.value);
  };

  const updateSubscription = async () => {
    if (contextProject) {
      dispatch(
        setContextProjectAction({ ...contextProject, subscribe: !subscribe })
      );
      setSubscribe(!subscribe);
      updateProjectSubscription(contextProject.uid, !subscribe);
    }
  };

  const handleSaveProjectName = async () => {
    if (projectName.trim() !== "") {
      setIsLoading(true);
      UpdateProject(contextProject.uid, { name: projectName })
        .then((r) => {
          alertAction.success("Project name success updated");
          setEditProjectName(false);
          setIsLoading(false);
          fetchProject(contextProject?.uid)
            .then((r) => {
              dispatch(setContextProjectAction(r));
            })
            .catch((e) => e);
        })
        .catch((r) => {
          alertAction.error("Error while updating information");
          setIsLoading(false);
        });
    } else {
      alertAction.error("The field cannot be empty");
    }
  };

  useEffect(() => {
    setProjectName(contextProject?.name);
    setSubscribe(contextProject?.subscribe);
  }, [contextProject]);

  return (
    <Grid
      container
      spacing={4}
      className={classes.gridRoot}
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
    >
      <Grid item xs={12}>
        <Paper elevation={7} className={classes.rootPaper}>
          {contextProject?.owner_company.image_uri ? (
            <Grid item xs={12}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={contextProject?.owner_company.image_uri}
                  style={{
                    maxHeight: "130px",
                    maxWidth: "130px",
                    margin: "20px",
                  }}
                />
              </div>
            </Grid>
          ) : null}
          {contextProject?.is_admin ? (
            <div style={{ float: "right" }}>
              {editProjectName ? (
                <div>
                  <Button>
                    <Save
                      onClick={handleSaveProjectName}
                      style={{ marginRight: 10 }}
                      color="primary"
                    />
                  </Button>
                  <Button onClick={() => setEditProjectName(false)}>
                    <Cancel color="primary" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditProjectName(!editProjectName)}>
                  <Edit color="primary" />
                </Button>
              )}
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "center" }}>
            {editProjectName ? (
              <Input
                onChange={handleEditProjectName}
                style={{ fontSize: 24 }}
                value={projectName}
              />
            ) : (
              <Typography color="primary" variant="h4">
                {isLoading ? <Loader /> : `${contextProject?.name}`}
              </Typography>
            )}
          </div>
          <Divider />
          <Typography align="justify">{contextProject?.description}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <ProjectInfo />
      </Grid>
      {contextProject?.is_admin ? (
        <Grid item xs={12}>
          <Paper elevation={7}>
            <Typography color="primary" align="center">
              {t("dashboard.admin-panel.title")}
            </Typography>
            <Divider />
            <FormGroup style={{ padding: "20px", alignContent: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={subscribe}
                    onChange={updateSubscription}
                    name="subscribe"
                    color="primary"
                  />
                }
                label={t("dashboard.admin-panel.actions.subscribe.label")}
              />
            </FormGroup>
          </Paper>
        </Grid>
      ) : null}
      <Grid item xs={12}>
        <Paper elevation={7}>
          <FilesView />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <UsersTable />
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={7}>
          <Typography color="primary" align="center">
            {t("dashboard.project-files.tittle")}
          </Typography>
          <Divider />
          <Files />
        </Paper>
      </Grid>
    </Grid>
  );
}

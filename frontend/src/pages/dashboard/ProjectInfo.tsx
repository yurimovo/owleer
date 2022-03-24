import Typography from "@material-ui/core/Typography";
import { Button, Divider } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../types/ReducerTypes";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import { UpdateProject } from "../../utils/projects/updateProject";
import { Cancel, Edit, Save } from "@material-ui/icons";
import { fetchProject } from "../../utils/projects/fetchProject";
import { setContextProjectAction } from "../../actions/actions";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  rootPaper: {
    padding: 20,
  },
}));

export const ProjectInfo = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [statusValue, setStatusValue] = useState<string>("");
  const [nextDeadlineData, setNextDeadlineData] = useState<string>("");
  const [editProjectData, setEditProjectData] = useState<boolean>(false);
  const [daysToDeadlineNow, setDaysToDeadlineNow] = useState<number>(0); // от нынещней даты
  const [daysToDeadLine, setDaysToDeadline] = useState<number>(0); // от даты установки
  const { alertAction } = useSnackBar();

  const inputPropsDate = {
    min: new Date().toISOString().split("T")[0],
  };

  const handleStatusProject = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStatusValue(e.target.value);
  };

  const setDeadlineDay = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNextDeadlineData(e.target.value);
  };

  const handleSave = async () => {
    await UpdateProject(contextProject.uid, {
        status: statusValue,
        data: {
            next_deadline_date: {
                deadline_date: nextDeadlineData,
                set_date_deadline: new Date().toISOString().split("T")[0],
            },
        },
    }).then((r) => {
      fetchProject(contextProject?.uid).then((res) =>
        dispatch(setContextProjectAction(res))
      );
      alertAction.success(t("dashboard.project-info-deadline.alert.success"));
      setEditProjectData(false);
    });
  };

  const calculateDaysToDeadLine = () => {
    const dateDeadline = new Date(
      contextProject?.data.next_deadline_date.deadline_date
    );
    const setDeadlineDate = new Date(
      contextProject?.data?.next_deadline_date?.set_date_deadline
    );
    const timeDiffSetDate = Math.abs(
      dateDeadline.getTime() - setDeadlineDate.getTime()
    );
    const diffDaysSetDeadLine = Math.ceil(timeDiffSetDate / (1000 * 3600 * 24));
    setDaysToDeadline(diffDaysSetDeadLine);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dateDeadline.setHours(0, 0, 0, 0);
    const timeDiff = Math.abs(dateDeadline.getTime() - now.getTime());
    const diffDays = timeDiff / (1000 * 3600 * 24);
    setDaysToDeadlineNow(Math.ceil(diffDays));
  };

  const updateNewProject = async () => {
    await UpdateProject(contextProject?.uid, {
        status: statusValue,
        data: {
            next_deadline_date: {
                deadline_date: new Date().toISOString().split("T")[0],
                set_date_deadline: new Date().toISOString().split("T")[0],
            },
        },
    }).then((r) => {
      fetchProject(contextProject?.uid).then((res) =>
        dispatch(setContextProjectAction(res))
      );
    });
  };

  useEffect(() => {
    if (contextProject?.data?.next_deadline_date) {
      calculateDaysToDeadLine();
      setNextDeadlineData(
        contextProject?.data?.next_deadline_date.deadline_date
      );
      setStatusValue(contextProject?.status);
    } else {
      if (contextProject?.uid) {
        updateNewProject();
      }
    }
  }, [contextProject]);

  return (
    <Paper elevation={7} className={classes.rootPaper}>
      <Typography variant="h5" align="center" color="primary">
        {t("dashboard.project-info-deadline.label")}
      </Typography>
      {contextProject?.is_admin ? (
        <>
          {editProjectData ? (
            <div style={{ float: "right" }}>
              <Button onClick={handleSave}>
                <Save color="primary" />
              </Button>
              <Button
                style={{ padding: 0 }}
                onClick={() => setEditProjectData(false)}
              >
                <Cancel color="primary" />
              </Button>
            </div>
          ) : (
            <Button
              style={{ float: "right" }}
              onClick={() => setEditProjectData(true)}
            >
              <Edit color="primary" />
            </Button>
          )}
        </>
      ) : null}
      <Typography align="justify">{contextProject?.description}</Typography>
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography color="primary" align="center">
            {t("dashboard.project-info-deadline.project-status")}
          </Typography>
          <TextField
            disabled={!editProjectData}
            value={statusValue}
            onChange={handleStatusProject}
          />
        </div>
        <div style={{ width: "60%" }}>
          <Typography color="error" align="center">
            {" "}
            {daysToDeadlineNow}{" "}
            {t("dashboard.project-info-deadline.days-till-deadline")}
          </Typography>
          <div style={{ marginLeft: 20, marginRight: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>
                {daysToDeadlineNow} {t("dashboard.project-info-deadline.days")}
              </Typography>
              <Typography color="error">
                {t("dashboard.project-info-deadline.deadline")}
              </Typography>
            </div>
            <LinearProgress
              style={{ marginRight: 25, marginLeft: 25, marginTop: "1%" }}
              color="primary"
              variant="buffer"
              value={
                ((daysToDeadLine - daysToDeadlineNow) * 100) / daysToDeadLine
              }
            />
          </div>
        </div>
        <div>
          <Typography color="primary" align="center">
            {t("dashboard.project-info-deadline.deadline-day")}
          </Typography>
          <TextField
            disabled={!editProjectData}
            color="primary"
            id="deadlineDay"
            type="date"
            value={nextDeadlineData}
            onChange={setDeadlineDay}
            inputProps={inputPropsDate}
          />
        </div>
      </div>
    </Paper>
  );
};

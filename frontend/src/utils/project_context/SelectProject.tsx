import React, { useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, FormHelperText, NativeSelect } from "@material-ui/core";
import { State } from "../../types/ReducerTypes";
import { Project, UserProjectsPerOrgItem } from "../../types/ProjectTypes";
import {fetchUseProjectsActionSuccess, setContextProjectAction} from "../../actions/actions";
import { fetchProject } from "../projects/fetchProject";
import { useSnackBar } from "../elements/snackbar/useSnackBar";
import { useTranslation } from "react-i18next";
import {fetchUserProjects} from "../projects/fetchUserProjects";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: "250px",
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  })
);

export const SelectContextProject = () => {
  const userProjects = useSelector((state: State) => state.user.projects);
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [defaultContextProject, setDefaultContextProject] = useState("");
  const [handleContextProject, setHandleContextProject] = useState("");
  const { t } = useTranslation();
  const { alertAction } = useSnackBar();
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    setHandleContextProject(event.target.value as string);
    try {
      const r = await fetchProject(event.target.value as string);
      dispatch(setContextProjectAction(r));
    } catch (e) {
      alertAction.error("Failed to fetch target project.");
    }
  };

  useEffect(() => {
    if (!(defaultContextProject?.length > 0)) {
      if (contextProject?.uid) {
        setDefaultContextProject(contextProject.uid);
      } else {
        setDefaultContextProject(userProjects[0]?.projects[0]?.uid);
        fetchProject(userProjects[0]?.projects[0]?.uid).then((proj) => {
          console.log(1)
          dispatch(setContextProjectAction(proj));
        });
      }
    }
  }, [defaultContextProject.length, contextProject?.uid, userProjects]);

  useEffect(() => {
    if (contextProject) {
      setDefaultContextProject(contextProject.uid);
    }
  }, [contextProject]);

  useEffect(() => {
    fetchUserProjects()
        .then((projects: Array<UserProjectsPerOrgItem>) => {
          dispatch(fetchUseProjectsActionSuccess(projects));
        })
        .catch((e) => {});
  },[contextProject?.name])

  useEffect(() => {
    if (userProjects.length && defaultContextProject.length < 0) {
      if (userProjects[0].projects.length && defaultContextProject) {
        fetchProject(defaultContextProject)
          .then((proj) => {
            dispatch(setContextProjectAction(proj));
          })
          .catch((e) => {
            console.log("Default Project Error.");
          });
      }
    }
  }, [userProjects]);

  const renderProjectList = () => {
    return userProjects.map((p: UserProjectsPerOrgItem) => {
      return (
        <optgroup
          key={p.company_uid + p.company_name}
          label={`${p.company_name}`}
        >
          {p.projects.map((project: Project) => {
            return (
              <option
                key={project.uid}
                value={project.uid}
              >{`${project.name}`}</option>
            );
          })}
        </optgroup>
      );
    });
  };

  return (
    <FormControl className={classes.formControl}>
      <NativeSelect
        value={
          handleContextProject?.length > 0
            ? handleContextProject
            : defaultContextProject
        }
        onChange={handleChange}
      >
        {renderProjectList()}
      </NativeSelect>
      <FormHelperText>
        {t("app-bar.select-project.select-project-text")}
      </FormHelperText>
    </FormControl>
  );
};

import { Project, UserProjectsPerOrgItem } from "../../../types/ProjectTypes";
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  IconButton,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject } from "../../../utils/projects/fetchProject";
import {
  fetchUseProjectsActionSuccess,
  setContextProjectAction,
} from "../../../actions/actions";
import { useHistory } from "react-router";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";
import { Delete } from "@material-ui/icons";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { deleteProject } from "../../../utils/projects/deleteProject";
import { fetchUserProjects } from "../../../utils/projects/fetchUserProjects";
import { State } from "../../../types/ReducerTypes";
import { useConfirmationDialog } from "../../../utils/elements/confirmation-dialog/ConfirmationDialog";

const useStyles = makeStyles(() =>
  createStyles({
    passed: {
      background: "#808080",
      color: "#FFFFFF",
      fontWeight: "bold",
      transition: "background .3s linear",
      "&:hover": {
        cursor: "pointer",
      },
    },
    alert: {
      background: "#FF0000",
      color: "#FFFFFF",
      fontWeight: "bold",
      "&:hover": {
        cursor: "pointer",
      },
    },
    important: {
      background: "#FFA500",
      color: "#FFFFFF",
      fontWeight: "bold",
      "&:hover": {
        cursor: "pointer",
      },
    },
    table: {
      border: "1px #534534 solid",
      marginTop: "2%",
      marginLeft: "1%",
      marginRight: "1%",
    },
    widthRows: {
      width: "10%",
    },
  })
);

interface IprojectsTable {
  projects: Array<Project>;
}

const ProjectsTable: React.FC<IprojectsTable> = ({ projects }) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const { getConfirmation } = useConfirmationDialog();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );

  const handleContextProject = async (uid: string) => {
    try {
      const p = await fetchProject(uid);
      dispatch(setContextProjectAction(p));
      history.push(`/dashboard`);
    } catch (e) {
      alertAction.error("Failed To Fetch Project.");
    }
  };

  const handleDeleteProject = async (projectUid: string) => {
    const confirmed = await getConfirmation({
      title: t("project-table.confirm.tittle"),
      message: t("project-table.confirm.message"),
    });
    if (confirmed) {
      deleteProject(projectUid).then(() => {
        fetchUserProjects().then((projects: Array<UserProjectsPerOrgItem>) => {
          if (projects.length) {
            fetchProject(projects[0].projects[0].uid).then((p) => {
              dispatch(setContextProjectAction(p));
            });
          } else {
            dispatch(setContextProjectAction(null));
          }
          dispatch(fetchUseProjectsActionSuccess(projects));
        });
        alertAction.success(t("project-table.delete-success-alert"));
      });
    }
  };

  const calculateCellClass = (daysTillDeadLine: number) => {
    if (daysTillDeadLine <= 0) {
      return classes.passed;
    }
    if (daysTillDeadLine === 1) {
      return classes.alert;
    }
    if (daysTillDeadLine > 1 && daysTillDeadLine <= 3) {
      return classes.important;
    }
    return undefined;
  };

  return (
    <div className={classes.table}>
      <TableContainer>
        <Table size="small" stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow hover>
              <TableCell>{t("project-table.table.name")}</TableCell>
              <TableCell align="center">
                {t("project-table.table.new-files")}
              </TableCell>
              <TableCell align="center">
                {t("project-table.table.status")}
              </TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>
                {t("project-table.table.days-deadline")}
              </TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>
                {t("project-table.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p: Project) => {
              return (
                <TableRow hover key={p.uid}>
                  <TableCell
                    onClick={() => handleContextProject(p.uid)}
                    className={classes.widthRows}
                  >
                    {p.name}
                  </TableCell>
                  <TableCell
                    onClick={() => handleContextProject(p.uid)}
                    align="center"
                    className={classes.widthRows}
                  >
                    {p.stats.new_files_count}
                  </TableCell>
                  <TableCell
                    onClick={() => handleContextProject(p.uid)}
                    align="center"
                    className={classes.widthRows}
                  >
                    {p.status}
                  </TableCell>
                  <TableCell
                    onClick={() => handleContextProject(p.uid)}
                    align="center"
                    className={classes.widthRows}
                  >
                    {p.data.next_deadline_date?.deadline_date ||
                      new Date().toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.widthRows}
                    style={{ background: "#f2f2f2" }}
                  >
                    <IconButton
                      onClick={() => {
                        handleContextProject(p.uid);
                      }}
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        handleDeleteProject(p.uid);
                      }}
                      disabled={!p.is_admin}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ProjectsTable;

import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { ProjectInfoForm } from "./steps/ProjectInfo/ProjectInfoForm";
import {
  StartProject,
  UserProjectsPerOrgItem,
} from "../../../types/ProjectTypes";
import { createProject } from "../../../utils/projects/createProject";
import Loader from "../../../utils/elements/Loader";
import { useDispatch, useSelector } from "react-redux";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";
import { fetchUserProjects } from "../../../utils/projects/fetchUserProjects";
import { fetchUseProjectsActionSuccess } from "../../../actions/actions";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@material-ui/core";

const EMPTY_PROJECT_DATA = {
  name: "",
  country: "",
  initiatorCompany: {
    name: "",
    uid: "",
    image_url: "",
  },
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      overflow: "auto",
      minWidth: "85%",
      maxHeight: "95%",
      display: "flex-box",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "20%",
      marginRight: "20%",
      marginTop: "1%",
      borderRadius: "25px",
    },
    paper: {
      overflow: "auto",
      backgroundColor: theme.palette.background.paper,
      borderRadius: "25px",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 2, 2),
    },
    rootAccordion: {
      width: "100%",
    },
    rootStepper: {
      width: "100%",
    },
    backButton: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    closeModalIcon: {
      float: "right",
      cursor: "pointer",
    },
  })
);

interface IcreateProjectModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateProjectModal: React.FC<IcreateProjectModal> = ({
  open,
  setOpen,
}) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [emptyFields, setEmptyFields] = useState(false);
  const { alertAction } = useSnackBar();
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] =
    useState<StartProject>(EMPTY_PROJECT_DATA);
  const [createProjectLoading, setCreateProjectLoading] =
    useState<boolean>(false);

  const dispatch = useDispatch();

  const checkEmptyField = (
    name: string,
    companyName: string,
    country: string
  ) => {
    if (name !== "" && companyName !== "" && country !== "") {
      setEmptyFields(false);
    } else {
      setEmptyFields(true);
    }
  };
  useEffect(() => {
    checkEmptyField(
      projectData.name,
      projectData.initiatorCompany?.name || "",
      projectData.country
    );
  }, [projectData]);

  const handleCloseModal = async () => {
    setOpen(false);
    const projects = await fetchUserProjects();
    dispatch(fetchUseProjectsActionSuccess(projects));
  };

  const handleStartProject = () => {
    if (!emptyFields) {
      setIsLoading(true);
      createProject({
        name: projectData.name,
        country: projectData.country,
        initiator_organization_uid: projectData.initiatorCompany.uid,
        data: {
          next_deadline_date:{
            deadline_date: new Date().toISOString().split('T')[0],
            set_date_deadline: new Date().toISOString().split('T')[0]
          }
        }
      })
        .then((r) => {
          if (r.status !== 200) {
            alertAction.info("This function is available only after payment.");
          } else {
            alertAction.success("Project successfully created!");
            setIsLoading(false);
            setOpen(false);
            fetchUserProjects()
              .then((projects: Array<UserProjectsPerOrgItem>) => {
                dispatch(fetchUseProjectsActionSuccess(projects));
              })
              .catch((e) => {});
          }
        })
        .catch((e) => {
          setIsLoading(false);
          alertAction.error("An error occured while creating the project.");
        });
    } else {
      setIsLoading(false);
      alertAction.error("All fields are required");
    }
  };

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.root}
      maxWidth="lg"
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      {!createProjectLoading ? (
        <div>
          <DialogTitle>{t("create-project-modal.header")}</DialogTitle>
          <DialogContent>
            <Fade in={open}>
              <ProjectInfoForm
                projectData={projectData}
                setProjectData={setProjectData}
              />
            </Fade>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={isLoading}
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleStartProject}
            >
              {t("create-project-modal.create-button")}
            </Button>
          </DialogActions>
        </div>
      ) : (
        <Loader title={`${t("create-project-modal.creating-loader")}`} />
      )}
    </Dialog>
  );
};

export default CreateProjectModal;

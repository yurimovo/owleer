import React, { ChangeEvent, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import { useTranslation } from "react-i18next";
import Fade from "@material-ui/core/Fade";
import { Button, TextField, Typography } from "@material-ui/core";
import { createFileIssue } from "../../../../../utils/files/file_view/issues/createFileIssue";
import { fetchFileIssues } from "../../../../../utils/files/fetchFileIssues";
import { fetchIssueFileProjectAction } from "../../../../../actions/actions";
import { useDispatch } from "react-redux";
import { useSnackBar } from "../../../../../utils/elements/snackbar/useSnackBar";
import Loader from "../../../../../utils/elements/Loader";
import Draggable from "react-draggable";

interface IModalAddNewIssue {
  pageNumber: number | undefined | null;
  openModal: boolean;
  handleCloseModal: () => void;
  fileUid: string;
  newIssue: any;
  setColor: (value: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      display: "flex",
      alignItems: "center",
      borderRadius: "25px",
      flexDirection: "column",
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(1, 1, 1),
      width: "20%",
    },
    textField: {
      padding: "13px",
    },
  })
);

export const ModalAddNewIssue: React.FC<IModalAddNewIssue> = ({
  pageNumber,
  openModal,
  handleCloseModal,
  fileUid,
  newIssue,
}) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [colorCircle, setColorCircle] = useState<string>("red");
  const [isLoading, setIsLoading] = useState(false);

  const [errorTextField, setErrorTextField] = useState({
    name: false,
    description: false,
  });
  const [newIssueData, setNewIssueData] = useState({
    name: "",
    description: "",
  });

  const handleClose = () => {
    setNewIssueData({
      name: "",
      description: "",
    });
    handleCloseModal();
  };

  const handleNewElement = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    switch (e.target.id) {
      case "name":
        setNewIssueData({
          ...newIssueData,
          name: e.target.value,
        });
        break;
      case "description":
        setNewIssueData({
          ...newIssueData,
          description: e.target.value,
        });
        break;
    }
  };

  const handleSaveNewIssue = () => {
    setIsLoading(true);
    setErrorTextField({ name: false, description: false });
    const data = {
      name: newIssueData.name,
      description: newIssueData.description,
      data: { ...newIssue, color: colorCircle },
    };
    if (newIssueData.name !== "" && newIssueData.description !== "") {
      createFileIssue(fileUid, data, pageNumber)
        .then((r) => {
          fetchFileIssues(fileUid, {
            page: pageNumber,
            user_emails: [],
          })
            .then((r) => dispatch(fetchIssueFileProjectAction(r)))
            .catch((e) => alertAction.error(e));
          alertAction.success(
            `${t("modal-add-new-issue.alert.success")} ${newIssueData.name}!`
          );
          setIsLoading(false);
          setColorCircle("red");
          handleClose();
        })
        .catch((e) => alertAction.error(e));
    } else {
      alertAction.error(t("modal-add-new-issue.alert.error"));
      setIsLoading(false);
    }
  };

  const handleSetColorCircle = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setColorCircle(e.target.value);
  };

  return (
    <div>
      <Draggable>
        <Modal
          style={{ cursor: "move" }}
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={openModal}
          onClose={handleClose}
          closeAfterTransition
          BackdropProps={{
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
            timeout: 500,
          }}
        >
          <Fade in={openModal}>
            <div className={classes.paper}>
              <TextField
                error={errorTextField.name}
                required
                fullWidth
                className={classes.textField}
                id="name"
                label={t("modal-add-new-issue.text-field.name")}
                placeholder={t("modal-add-new-issue.text-field.name")}
                variant="outlined"
                onChange={(e) => handleNewElement(e)}
              />
              <TextField
                error={errorTextField.description}
                required
                fullWidth
                className={classes.textField}
                multiline
                rows={7}
                id="description"
                label={t("modal-add-new-issue.text-field.description")}
                placeholder={t("modal-add-new-issue.text-field.description")}
                variant="outlined"
                onChange={(e) => handleNewElement(e)}
              />
              <div
                style={{
                  margin: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Typography>
                  {t("pdf-files-view.control-panel.set-color-label")}
                </Typography>
                <TextField
                  type="color"
                  style={{ width: 30 }}
                  onChange={handleSetColorCircle}
                  defaultValue="#ff0000"
                />
              </div>
              <Button
                disabled={isLoading}
                variant="contained"
                color="primary"
                onClick={handleSaveNewIssue}
              >
                {isLoading ? (
                  <>
                    <Loader />
                    {t("modal-add-new-issue.save-loader")}
                  </>
                ) : (
                  t("modal-add-new-issue.save-btn")
                )}
              </Button>
            </div>
          </Fade>
        </Modal>
      </Draggable>
    </div>
  );
};

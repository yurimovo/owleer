import * as React from "react";
import Box from "@material-ui/core/Box";
import { useTranslation } from "react-i18next";
import Modal from "@material-ui/core/Modal";
import { Button, makeStyles, Input } from "@material-ui/core";
import { useState } from "react";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import Loader from "../../utils/elements/Loader";
import { createFolder } from "../../utils/files/createFolder";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "25px",
  p: 4,
};
const useStyles = makeStyles((theme) => ({
  input: {
    padding: "1%",
  },
  uploadButton: {
    padding: "1%",
  },
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    padding: "10%",
  },
}));

interface IuploadFileModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectUid: string;
  currentDir: string;
}

export const CreateFolderModal: React.FC<IuploadFileModal> = ({
  open,
  setOpen,
  projectUid,
  currentDir,
}) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const [folderName, setFolderName] = useState<string>("");
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    setFolderName("");
    setCreatingFolder(false);
  };

  const handleSubmission = async () => {
    if (folderName) {
      setCreatingFolder(true);
      createFolder(projectUid, currentDir, folderName)
        .then(() => {
          setCreatingFolder(false);
          alertAction.success(t("create-folder-modal.alert-success"));
          setOpen(false);
        })
        .catch(() => {
          alertAction.error(t("create-folder-modal.alert-error"));
        })
        .finally(() => {
          setCreatingFolder(false);
          setOpen(false);
        });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className={classes.modal}
    >
      <Box sx={style}>
        {creatingFolder ? (
          <div className={classes.loader}>
            <Loader title={t("create-folder-modal.loader-creating-folder")} />
          </div>
        ) : (
          <div>
            <div>
              <h2>{t("create-folder-modal.creating-folder-label")}</h2>
            </div>
            <div className={classes.input}>
              <Input
                placeholder={t("create-folder-modal.creating-folder-input")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFolderName(e.target.value)
                }
              />
            </div>
            <div className={classes.uploadButton}>
              <Button
                onClick={handleSubmission}
                color="primary"
                variant="contained"
              >
                {t("create-folder-modal.creating-folder-btn")}
              </Button>
            </div>
          </div>
        )}
      </Box>
    </Modal>
  );
};

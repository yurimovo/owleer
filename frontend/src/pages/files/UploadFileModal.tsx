import * as React from "react";
import { useTranslation } from "react-i18next";
import PublishIcon from "@material-ui/icons/Publish";
import {
  Button,
  FormControlLabel,
  makeStyles,
  Switch,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { ChangeEvent, useState } from "react";
import { uploadFile } from "../../utils/files/uploadFile";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import Loader from "../../utils/elements/Loader";
import { useSelector } from "react-redux";
import { State } from "../../types/ReducerTypes";
import { UsersSendFileModal } from "./users_send_file_modal/UsersSendFileModal";
import { UploadedFile } from "../../types/FileTypes";
import { Cancel } from "@material-ui/icons";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "25px",
  p: 1,
  display: "flex",
  justifyContent: "center",
};
const useStyles = makeStyles(() => ({
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

export const UploadFileModal: React.FC<IuploadFileModal> = ({
  open,
  setOpen,
  projectUid,
  currentDir,
}) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [selectedFiles, setSelectedFiles] = useState<FileList>();
  const [isSelectedFiles, setIsSelectedFiles] = useState<boolean>(false);
  const [processedFileName, setProcessedFileName] = useState<String>();
  const [processStatus, setProcessStatus] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [files, setFiles] = useState<Array<UploadedFile>>([]);
  const [uploadDirectory, setUploadDirectory] = useState<boolean>(false);
  const [fileDescription, setFileDescription] = useState<string>("");

  const handleClose = () => {
    setOpen(false);
    setIsSelectedFiles(false);
    setUploading(false);
    setUploadSuccess(false);
    setUploadDirectory(false);
    setFiles([]);
  };

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setSelectedFiles(event?.target?.files);
      setIsSelectedFiles(true);
    }
  };

  const handleSubmission = async () => {
    if (selectedFiles) {
      setUploading(true);
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          setProcessedFileName(selectedFiles[i].name);
          const res = await uploadFile({
            file: selectedFiles[i],
            project_uid: projectUid,
            path: currentDir,
            onProgressCallback: (p) => {
              setProcessStatus(Math.round((p.loaded / p.total) * 100));
            },
            fileDescription,
          });
          const arr = files;
          arr.push(res);
          setFiles(arr);
          alertAction.success(
            `${t("upload-file-modal.alert-success")} ${selectedFiles[i].name}`
          );
        } catch (e) {
          alertAction.error(
            `${t("upload-file-modal.alert-error")} ${selectedFiles[i].name}`
          );
        }
      }
      setUploadSuccess(true);
      setUploading(false);
    }
    // handleClose();
  };

  const handleDescriptionFile = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFileDescription(e.target.value);
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xs"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {uploadSuccess ? (
        <DialogContent>
          <UsersSendFileModal
            handleClose={handleClose}
            files={files}
            users={contextProject.users}
          />
        </DialogContent>
      ) : (
        <div>
          <DialogTitle>
            <Typography variant="h5" color="primary" align="center">
              {t("upload-file-modal.upload-file-box-label")}
            </Typography>
          </DialogTitle>
          {uploading ? (
            <DialogContent>
              <div style={{ padding: 30 }}>
                <Loader
                  title={
                    processStatus > 99 ? (
                      <div>
                        <Typography variant="h6" color="primary" align="center">
                          {t("upload-file-modal.saving-file-text")}
                        </Typography>
                        <Typography variant="h6" color="primary" align="center">
                          {processedFileName}
                        </Typography>
                      </div>
                    ) : (
                      <div>
                        <Typography variant="h6" color="primary" align="center">
                          {t("upload-file-modal.uploading-file-text")}
                        </Typography>
                        <Typography variant="h6" color="primary" align="center">
                          {processStatus}%
                        </Typography>
                      </div>
                    )
                  }
                />
              </div>
            </DialogContent>
          ) : (
            <div>
              {/* <DialogTitle>
                <Typography variant="h5" color="primary" align="center">
                  {t("upload-file-modal.upload-file-box-label")}
                </Typography>
              </DialogTitle> */}
              <DialogContent
                style={{ display: "flex", flexDirection: "column" }}
              >
                {uploadDirectory ? (
                  <input
                    multiple
                    type="file"
                    webkitdirectory=""
                    directory=""
                    onChange={changeHandler}
                  />
                ) : (
                  <input multiple type="file" onChange={changeHandler} />
                )}
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={uploadDirectory}
                      onChange={(e) => {
                        setUploadDirectory(e.target.checked);
                      }}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  }
                  label={t("upload-file-modal.upload-directories-checkbox")}
                />
                <TextField
                  multiline
                  rows={5}
                  label={t("upload-file-modal.file-description-label")}
                  variant="outlined"
                  onChange={(e) => handleDescriptionFile(e)}
                />
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={handleClose}>
                  {t("upload-file-modal.close-file-box-btn")}
                </Button>
                <Button
                  color="primary"
                  disabled={!isSelectedFiles}
                  variant="contained"
                  onClick={handleSubmission}
                  startIcon={<PublishIcon />}
                >
                  {t("upload-file-modal.upload-file-box-btn")}
                </Button>
              </DialogActions>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};

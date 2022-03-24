import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import {
  FileSystemDirectoryObject,
  ListObjects,
} from "../../../types/FileTypes";
import Loader from "../../../utils/elements/Loader";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";
import { useTranslation } from "react-i18next";
import { listObjects } from "../../../utils/files/listObjects";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import { FolderOnList } from "./FolderOnList";

interface IMoveObjectsModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  moveObjects: (targetDirectory: string) => Promise<void>;
}

export const MoveObjectsModal: React.FC<IMoveObjectsModal> = ({
  open,
  setOpen,
  moveObjects,
}) => {
  const { t } = useTranslation();

  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [currentDir, setCurrentDir] = useState<string>("/");

  const [targetDirectory, setTargetDirectory] = useState<string>(
    `${contextProject?.uid}/`
  );
  const [directories, setDirectories] = useState<
    Array<FileSystemDirectoryObject>
  >([]);

  const { alertAction } = useSnackBar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [folderUid, setFolderUid] = useState<string>("");
  const [isPermitted, setIsPermitted] = useState<boolean>(false);
  const [root, setRoot] = useState<string>("/");
  const [currentDirDisplayName, setCurrentDirDisplayName] =
    useState<string>("/");

  const [targettDirDisplayName, setTargettDirDisplayName] = useState<
    string | null
  >(null);

  const reloadFolders = async (targetDir: string) => {
    setIsLoading(true);
    listObjects(contextProject.uid, targetDir)
      .then((fileSystemObjects: ListObjects) => {
        setFolderUid(fileSystemObjects.folder_uid);
        setIsPermitted(fileSystemObjects.permitted_to_edit);
        setDirectories(fileSystemObjects.result.directories);
        setIsLoading(false);
        console.log(fileSystemObjects.result.directories)
      })
      .catch(() => {
        setIsLoading(false);
        setDirectories([]);
      });
  };

  useEffect(() => {
    if (contextProject) {
      reloadFolders(currentDir).then(() => {
        console.log("Files Reloaded.");
      });
    }
  }, [currentDir]);

  useEffect(() => {
    if (open) {
      setTargetDirectory(`${contextProject?.uid}/`);
      setCurrentDir("/");
      setCurrentDirDisplayName("/");
      setTargettDirDisplayName(null);
      if (contextProject) {
        reloadFolders("/").then(() => {
          console.log("Files Reloaded.");
        });
      }
    }

  }, [open]);

  const handleMoveObjects = () => {
    setIsLoading(true);
    moveObjects(targetDirectory)
      .then((r) => {
        setIsLoading(false);
        setOpen(false);
        alertAction.success(t("files.move-file-modal.alert.success"));
      })
      .catch((e) => {
        alertAction.error(t("files.move-file-modal.alert.error"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFolderItemClick = (key: string) => {
    const splittedDir = key.split("/");

    if (key !== "/") {
      if (splittedDir.length === 2) {
        setRoot("/");
      } else {
        splittedDir.splice(-2, 2);

        let currentDirPer = "";

        for (let index in splittedDir) {
          currentDirPer = currentDirPer + splittedDir[index] + "/";
        }
        setRoot(currentDirPer);
      }
    }

    let currentDirDisplay = "";
    let splittedKey = key.split("/");
    splittedKey.pop();

    for (let index in splittedKey) {
      if (splittedKey[index] !== contextProject?.uid) {
        currentDirDisplay = currentDirDisplay + splittedKey[index] + "/";
      }
    }

    setCurrentDirDisplayName(currentDirDisplay || "/");

    setCurrentDir(key);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t("files.move-file-modal.title")}
      </DialogTitle>
      {isLoading ? (
        <Loader />
      ) : (
        <DialogContent>
          <Tooltip title={`${t("files.move-file-modal.path-display-tooltip")}`}>
            <Paper style={{ backgroundColor: "#f16644", opacity: "85%" }}>
              <Typography
                align="center"
                variant="h6"
                style={{ fontWeight: "bold", padding: 20, color: "#ffffff" }}
              >
                {targettDirDisplayName ||
                  t("files.move-file-modal.choose-path-text")}
              </Typography>
            </Paper>
          </Tooltip>
          {contextProject ? (
            <div>
              <List component="nav">
                <ListItem
                  style={{ width: "400px" }}
                  button
                  onClick={() => {
                    if (currentDirDisplayName !== "/") {
                      handleFolderItemClick(root);
                    }
                  }}
                >
                  <ListItemIcon>
                    {root === "/" && currentDirDisplayName === "/" ? null : (
                      <ArrowBackOutlinedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={currentDirDisplayName + "..."} />
                  {currentDirDisplayName === "/" ? (
                    <Tooltip
                      title={`${t(
                        "files.move-file-modal.folder.select-button-tooltip"
                      )}`}
                      placement="right-end"
                    >
                      <Button
                        onClick={() => {
                          setTargetDirectory(`${contextProject?.uid}/`);
                          setTargettDirDisplayName("/");
                        }}
                        color="primary"
                        disabled={!isPermitted}
                      >
                        <CenterFocusStrongIcon fontSize="medium" />
                      </Button>
                    </Tooltip>
                  ) : null}
                </ListItem>
                <div>
                  {directories.map((dir: FileSystemDirectoryObject) => {
                    return (
                      <FolderOnList
                        {...{
                          isPermitted,
                          handleFolderItemClick,
                          dir,
                          setTargetDirectory,
                          currentDirDisplayName,
                          setTargettDirDisplayName,
                        }}
                      />
                    );
                  })}
                </div>
              </List>
            </div>
          ) : null}
        </DialogContent>
      )}
      <DialogActions>
        <Button
          variant="contained"
          disabled={!targettDirDisplayName}
          color="primary"
          style={{ margin: "10px" }}
          onClick={() => handleMoveObjects()}
        >
          {t("files.move-file-modal.move-button")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

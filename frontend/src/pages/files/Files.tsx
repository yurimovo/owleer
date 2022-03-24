import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { State } from "../../types/ReducerTypes";

import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { useTranslation } from "react-i18next";

import NoProjectSelectedView from "./NoProjectSelectedView";
import {
  Button,
  createStyles,
  Divider,
  Grid,
  makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@material-ui/core";
import {
  FileSystemDirectoryObject,
  FileSystemObject,
  FileSystemObjects,
  ListObjects,
  MovingObject,
  SelectedFile,
} from "../../types/FileTypes";
import { UploadFileModal } from "./UploadFileModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { Spinner } from "../../utils/elements/Spinner";
import { PermissionsModal } from "./PermissionsModal";
import { listObjects } from "../../utils/files/listObjects";
import { FileOnList } from "./FileOnList";
import { deleteObject } from "../../utils/files/deleteObject";
import { FolderOnList } from "./FolderOnList";
import { renameObject } from "../../utils/files/renameObject";
import { Cancel, Send } from "@material-ui/icons";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import { SendFileModal } from "./users_send_file_modal/SendFileModal";
import MailIcon from "@material-ui/icons/Mail";
import { moveObjects } from "../../utils/files/moveObjects";
import { MoveObjectsModal } from "./move_objects_modal/MoveObjectsModal";
import {useConfirmationDialog} from "../../utils/elements/confirmation-dialog/ConfirmationDialog";

const useStyles = makeStyles(() =>
    createStyles({
      root: {
        width: "100%",
        height: "91vh",
      },
      filesView: {
        maxHeight: "86vh",
        maxWidth: "100%",
        overflowY: "auto",
      },
      fab: {
        margin: 0,
        top: "auto",
        left: "auto",
        position: "fixed",
      },
      btn: {
        fontSize: 11,
      },
    })
);

export default function Files() {
  const classes = useStyles();

  const { t, i18n } = useTranslation();
  const { getConfirmation } = useConfirmationDialog();

  const contextProject = useSelector((state: State) => state.projects.contextProject);

  const [openCreateFolderModal, setOpenCreateFolderModal] = useState<boolean>(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPermitted, setIsPermitted] = useState<boolean>(false);
  const [openSendFileModal, setOpenSendFileModal] = useState<boolean>(false);
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false);
  const [sendingFiles, setSendingFiles] = useState<boolean>(false);
  const [movingObjects, setsMovingObjects] = useState<boolean>(false);
  const [openMoveObjectsModal, setOpenMoveObjectsModal] = useState<boolean>(false);

  const [folderUid, setFolderUid] = useState<string>("");
  const [currentDir, setCurrentDir] = useState<string>("/");
  const [root, setRoot] = useState<string>("/");
  const [currentDirDisplayName, setCurrentDirDisplayName] = useState<string>("/");

  const [selectedSendFiles, setSelectedSendFiles] = useState<Array<SelectedFile>>([]);
  const [selectedDirectories, setSelectedDirectories] = useState<Array<FileSystemDirectoryObject>>([]);
  const [fileSystemObjects, setFileSystemObjects] = useState<FileSystemObjects>({ files: [], directories: [] });

  const reloadFiles = async () => {
    setIsLoading(true);
    listObjects(contextProject.uid, currentDir)
        .then((fileSystemObjects: ListObjects) => {
          setFolderUid(fileSystemObjects.folder_uid);
          setIsPermitted(fileSystemObjects.permitted_to_edit);
          setFileSystemObjects(fileSystemObjects.result);
          setSelectedDirectories([]);
          setSelectedSendFiles([]);
          setIsLoading(false);
        })
        .catch(() => {
          setSelectedDirectories([]);
          setSelectedSendFiles([]);
          setIsLoading(false);
          setFileSystemObjects({ files: [], directories: [] });
        });
  };

  const moveFiles = async (targetDirectory: string) => {
    let movingObjects: Array<MovingObject> = [];

    selectedSendFiles.forEach((f: SelectedFile) => {
      movingObjects = [...movingObjects, { uid: f.uid, path: f.path }];
    });

    selectedDirectories.forEach((d: FileSystemDirectoryObject) => {
      movingObjects = [...movingObjects, { uid: d.uid, path: d.key }];
    });

    moveObjects(contextProject?.uid, targetDirectory, movingObjects).finally(
        () => {
          reloadFiles();
        }
    );
  };

  useEffect(() => {
    if (
        contextProject &&
        !openUploadModal &&
        !openCreateFolderModal &&
        !openMoveObjectsModal
    ) {
      reloadFiles().then(() => {
        console.log("Files Reloaded.");
      });
    }
  }, [
    contextProject,
    currentDir,
    openUploadModal,
    openCreateFolderModal,
    openMoveObjectsModal,
  ]);

  useEffect(() => {
    if (contextProject) {
      setCurrentDir("/");
      setCurrentDirDisplayName("/");
      setRoot("/");
    }
  }, [contextProject]);

  const handleSaveEdit = async (
      objectPath: string,
      newName: string,
      objectUid: string | null
  ) => {
    setIsLoading(true);
    renameObject(contextProject.uid, objectPath, newName, objectUid).finally(
        async () => {
          await reloadFiles();
          setIsLoading(false);
        }
    );
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

  const handleDeleteObject = async (objectKey: string) => {
    await deleteObject(contextProject.uid, objectKey);
    await reloadFiles();
  };

  const handleSendFiles = () => {
    setSendingFiles(!sendingFiles);
    setsMovingObjects(false);
    setSelectedSendFiles([]);
    setSelectedDirectories([]);
  };

  const handleMoveFiles = async () => {
    const confirmed = await getConfirmation({
      title: t("files.confirm-dialog.move.tittle"),
      message: t("files.confirm-dialog.move.message"),
    });
    if (confirmed) {
      setsMovingObjects(!movingObjects);
      setSendingFiles(false);
      setSelectedSendFiles([]);
      setSelectedDirectories([]);
    }
  };

  const handleSelectedFiles = (
      fileUid: string,
      fileName: string,
      filePath: string
  ) => {
    const find = selectedSendFiles.find((file) => file.uid === fileUid);
    if (find) {
      const arr = selectedSendFiles.filter((file) => file.uid !== fileUid);
      setSelectedSendFiles(arr);
    } else {
      const newFile = {
        path: filePath,
        uid: fileUid,
        file_name: fileName,
      };
      setSelectedSendFiles([...selectedSendFiles, newFile]);
    }
  };

  const handleSelectedDirectory = (directoryObject: FileSystemDirectoryObject) => {
    const find = selectedDirectories.find(
        (directory) => directory.uid === directoryObject.uid
    );
    if (find) {
      const arr = selectedDirectories.filter(
          (file) => file.uid !== directoryObject.uid
      );
      setSelectedDirectories(arr);
    } else {
      setSelectedDirectories([...selectedDirectories, directoryObject]);
    }
  };

  const handleOpenSendFileModal = () => setOpenSendFileModal(true);
  const handleCloseSendFileModal = () => setOpenSendFileModal(false);

  return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <div>
              <Button
                  disabled={!contextProject || !isPermitted || isLoading}
                  className={classes.btn}
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  style={{ margin: "10px" }}
                  onClick={() => setOpenUploadModal(true)}
              >
                {t("files.upload-btn")}
              </Button>
              <Button
                  disabled={!contextProject || !isPermitted || isLoading}
                  className={classes.btn}
                  variant="contained"
                  color="primary"
                  startIcon={<CreateNewFolderIcon />}
                  style={{ margin: "10px" }}
                  onClick={() => setOpenCreateFolderModal(true)}
              >
                {t("files.create-folder-btn")}
              </Button>
              {currentDir != "/" ? (
                  <Button
                      disabled={!contextProject || !isPermitted || isLoading}
                      className={classes.btn}
                      variant="contained"
                      color="primary"
                      startIcon={<VerifiedUserIcon />}
                      style={{ margin: "10px" }}
                      onClick={() => setOpenPermissionsModal(true)}
                  >
                    {t("files.permission-btn")}
                  </Button>
              ) : null}
              {!sendingFiles && (
                  <Button
                      disabled={!contextProject || isLoading}
                      className={classes.btn}
                      variant="contained"
                      color="primary"
                      startIcon={<MailIcon />}
                      style={{ margin: "10px" }}
                      onClick={handleSendFiles}
                  >
                    {t("files.send-files-btn")}
                  </Button>
              )}
              {sendingFiles && (
                  <Button
                      disabled={
                        !contextProject || selectedSendFiles.length === 0 || isLoading
                      }
                      className={classes.btn}
                      variant="contained"
                      color="primary"
                      startIcon={<Send />}
                      style={{ margin: "10px" }}
                      onClick={handleOpenSendFileModal}
                  >
                    {t("files.select-users-btn")}
                  </Button>
              )}
              {sendingFiles && (
                  <Button
                      disabled={!contextProject || isLoading}
                      className={classes.btn}
                      variant="outlined"
                      color="primary"
                      endIcon={<Cancel />}
                      style={{ margin: "10px" }}
                      onClick={handleSendFiles}
                  >
                    {t("files.cancel-send-files-btn")}
                  </Button>
              )}
              {!movingObjects && (
                  <Button
                      disabled={!contextProject || isLoading}
                      className={classes.btn}
                      variant="contained"
                      color="primary"
                      startIcon={<OpenWithIcon />}
                      style={{ margin: "10px" }}
                      onClick={handleMoveFiles}
                  >
                    {t("files.move-files-btn")}
                  </Button>
              )}
              {movingObjects && (
                  <Button
                      disabled={
                        !contextProject ||
                        (selectedSendFiles.length === 0 &&
                            selectedDirectories.length === 0) ||
                        isLoading
                      }
                      className={classes.btn}
                      variant="contained"
                      color="primary"
                      startIcon={<DoubleArrowIcon />}
                      style={{ margin: "10px" }}
                      onClick={() => {
                        setOpenMoveObjectsModal(true);
                      }}
                  >
                    {t("files.move-selected-files-btn")}
                  </Button>
              )}
              {movingObjects && (
                  <Button
                      disabled={!contextProject || isLoading}
                      className={classes.btn}
                      variant="outlined"
                      color="primary"
                      endIcon={<Cancel />}
                      style={{ margin: "10px" }}
                      onClick={handleMoveFiles}
                  >
                    {t("files.stop-moving-files-btn")}
                  </Button>
              )}
            </div>
            <Divider />
          </Grid>
          {isLoading ? (
              <Grid item xs={12}>
                <Spinner />
              </Grid>
          ) : (
              <Grid item xs={12}>
                <div className={classes.filesView}>
                  {contextProject ? (
                      <>
                        <TableContainer>
                          <Table component={Paper}>
                            <TableHead>
                              <TableRow>
                                <TableCell>{t("files.files-table.name")}</TableCell>
                                <TableCell align="center">{t("files.files-table.created")}</TableCell>
                                <TableCell>{t("files.files-table.description")}</TableCell>
                                <TableCell>{t("files.files-table.user")}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow
                                  onClick={() => {
                                    handleFolderItemClick(root);
                                  }}>
                                  <TableCell>
                                    <div style={{display: "flex", alignItems: "center"}}>
                                      {root === "/" &&
                                      currentDirDisplayName === "/" ? null : (
                                          <ArrowBackOutlinedIcon
                                              color="primary"/>
                                      )}
                                      <div style={{marginInlineStart: "7px"}}>
                                        {currentDirDisplayName + "..."}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell/>
                                  <TableCell/>
                                  <TableCell/>
                                  <TableCell/>
                              </TableRow>
                              {fileSystemObjects.directories.map(
                                  (dir: FileSystemDirectoryObject) => {
                                    return (
                                        <FolderOnList
                                            {...{
                                              handleSaveEdit,
                                              isPermitted,
                                              handleFolderItemClick,
                                              handleDeleteObject,
                                              movingObjects,
                                              dir,
                                              handleSelectedDirectory,
                                              sendingFiles,
                                            }}
                                        />
                                    );
                                  }
                              )}
                              {fileSystemObjects.files.map(
                                  (fileSObject: FileSystemObject) => {
                                    return (
                                        <FileOnList
                                            handleSaveEdit={handleSaveEdit}
                                            isPermitted={isPermitted}
                                            handleDeleteObject={handleDeleteObject}
                                            fileSObject={fileSObject}
                                            sendingFiles={sendingFiles}
                                            movingObjects={movingObjects}
                                            handleSelectedFiles={handleSelectedFiles}
                                        />
                                    );
                                  }
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                  ) : (
                      <NoProjectSelectedView />
                  )}
                </div>{" "}
              </Grid>
          )}
        </Grid>
        <UploadFileModal
            {...{
              open: openUploadModal,
              setOpen: setOpenUploadModal,
              projectUid: contextProject?.uid,
              currentDir: currentDir,
            }}
        />
        <CreateFolderModal
            {...{
              open: openCreateFolderModal,
              setOpen: setOpenCreateFolderModal,
              projectUid: contextProject?.uid,
              currentDir: currentDir,
            }}
        />
        <PermissionsModal
            {...{
              open: openPermissionsModal,
              setOpen: setOpenPermissionsModal,
              folderUid: folderUid,
            }}
        />
        <SendFileModal
            openSendFileModal={openSendFileModal}
            handleCloseSendFileModal={handleCloseSendFileModal}
            selectedSendFiles={selectedSendFiles}
            sendFilesMode={handleSendFiles}
        />
        <MoveObjectsModal
            open={openMoveObjectsModal}
            setOpen={setOpenMoveObjectsModal}
            moveObjects={moveFiles}
        />
      </div>
  );
}
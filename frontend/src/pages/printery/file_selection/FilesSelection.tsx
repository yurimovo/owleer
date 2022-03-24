import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";

import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";

import {
  createStyles,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@material-ui/core";
import {
  FileSystemDirectoryObject,
  FileSystemObject,
  FileSystemObjects,
  ListObjects,
} from "../../../types/FileTypes";
import { Spinner } from "../../../utils/elements/Spinner";
import { listObjects } from "../../../utils/files/listObjects";

import NoProjectSelectedView from "../../files/NoProjectSelectedView";
import { PrintingOrder } from "../../../types/PrintaryTypes";
import { FolderOnSelection } from "./objects_on_selection/folder/FolderOnSelection";
import { FileOnSelection } from "./objects_on_selection/file/FileOnSelection";
import { ProjectPrintingAgency } from "../../../types/ProjectTypes";
import { OrderType } from "../../../types/OrderTypes";
import {useTranslation} from "react-i18next";

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
  })
);

interface IFilesSelection {
  printingOrder: OrderType;
  contextAgency: ProjectPrintingAgency;
  setPrintingOrder: React.Dispatch<React.SetStateAction<OrderType>>;
}

export const FilesSelection: React.FC<IFilesSelection> = ({
  printingOrder,
  setPrintingOrder,
  contextAgency,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPermitted, setIsPermitted] = useState<boolean>(false);
  const [root, setRoot] = useState<string>("/");
  const [folderUid, setFolderUid] = useState<string>("");
  const [currentDir, setCurrentDir] = useState<string>("/");

  const [fileSystemObjects, setFileSystemObjects] = useState<FileSystemObjects>(
    { files: [], directories: [] }
  );
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );

  const reloadFiles = async () => {
    setIsLoading(true);
    listObjects(contextProject.uid, currentDir)
      .then((fileSystemObjects: ListObjects) => {
        setFolderUid(fileSystemObjects.folder_uid);
        setIsPermitted(fileSystemObjects.permitted_to_edit);
        setFileSystemObjects(fileSystemObjects.result);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setFileSystemObjects({ files: [], directories: [] });
      });
  };

  useEffect(() => {
    if (contextProject) {
      reloadFiles().then(() => {
        console.log("Files Reloaded.");
      });
    }
  }, [contextProject, currentDir]);

  useEffect(() => {
    setCurrentDir("/");
    setRoot("/");
  }, [contextProject]);

  const handleFolderItemClick = (key: string) => {
    if (key !== "/") {
      const splittedDir = key.split("/");
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

    setCurrentDir(key);
  };

  return (
    <div>
      <Grid container>
        {isLoading ? (
          <Grid item xs={12}>
            <Spinner />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <div className={classes.filesView}>
              {contextProject ? (
                  <TableContainer>
                    <Table  size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("printery.file-selection.table.file-name")}</TableCell>
                          <TableCell align="center">{t("printery.file-selection.table.created")}</TableCell>
                          <TableCell align="center">{t("printery.file-selection.table.description")}</TableCell>
                          <TableCell align="right"/>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow
                            hover
                            onClick={() => {
                              handleFolderItemClick(root);
                            }}
                        >
                          <TableCell>
                            <div style={{display: "flex", alignItems: "center"}}>
                              {root === "/" && currentDir === "/" ? null : (
                                  <ArrowBackOutlinedIcon />
                              )}
                              <div style={{marginInlineStart: 10}}>
                                {currentDir.split("/").slice(1)} ...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {fileSystemObjects.directories.map(
                            (dir: FileSystemDirectoryObject) => {
                              return (
                                  <FolderOnSelection
                                      {...{ handleFolderItemClick, dir, isPermitted }}
                                  />
                              );
                            }
                        )}
                        {fileSystemObjects.files.map(
                            (fileSObject: FileSystemObject) => {
                              return (
                                  <FileOnSelection
                                      {...{
                                        fileSObject,
                                        isPermitted,
                                        printingOrder,
                                        setPrintingOrder,
                                        contextAgency,
                                      }}
                                  />
                              );
                            }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
              ) : (
                <NoProjectSelectedView />
              )}
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

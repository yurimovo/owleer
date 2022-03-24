import { FileSystemObject } from "../../types/FileTypes";
import {
  Badge,
  Button,
  Checkbox,
  createStyles,
  Divider,
  IconButton,
  Input,
  Link,
  ListItemIcon,
  makeStyles,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import SaveIcon from "@material-ui/icons/Save";
import Delete from "@material-ui/icons/Delete";
import {Cancel, Edit, GetApp, History} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { getAuthUserToken } from "../../utils/auth/getAuthUserToken";
import Loader from "../../utils/elements/Loader";
import { useConfirmationDialog } from "../../utils/elements/confirmation-dialog/ConfirmationDialog";
import { handleFileIcon } from "../../utils/icons/handleFileIcon";
import { lastModifiedTime } from "../../utils/timeUtils";
import { FileVersionModal } from "./file_version_modal/FileVersionsModal";

interface IFileOnList {
  handleSaveEdit: (
    objectPath: string,
    newName: string,
    objectUid: string | null
  ) => Promise<void>;
  fileSObject: FileSystemObject;
  handleDeleteObject: (objectKey: string) => void;
  isPermitted: boolean;
  sendingFiles: boolean;
  movingObjects: boolean;
  handleSelectedFiles: (
    fileUid: string,
    fileName: string,
    filePath: string
  ) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    rootFileOnList: {
      minHeight: 50,
      cursor: "default",
      "&:hover": {
        backgroundColor: "#e9e9e9",
      },
    },
    file: {
      padding: 10,
      fontWeight: "bold",
      "&:hover": {
        padding: "10px",
        // border: "1px solid #DCDCDC",
      },
    },
    actionsButtonsView: {
      maxHeight: 30,
      minWidth: 300,
      paddingLeft: 10,
    },
    actionsButtonHide: {
      display: "none",
    },
    font: {
      fontSize: 13,
    },
  })
);

export const FileOnList: React.FC<IFileOnList> = ({
  handleSaveEdit,
  isPermitted,
  fileSObject,
  handleDeleteObject,
  sendingFiles,
  movingObjects,
  handleSelectedFiles,
}) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  const { getConfirmation } = useConfirmationDialog();
  const [fileName, setFileName] = useState<string>(fileSObject.Name);
  const [viewActionBlock, setViewActionBlock] = useState<boolean>(false);
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<boolean>(false);
  const [fileExtention, setFileExtention] = useState<string | undefined>("");
  const [openFileVersionModal, setOpenFileVersionModal] =
    useState<boolean>(false);

  const defineFileExtention = () =>
    setFileExtention(fileSObject.Name.split(".").pop());
  const handleViewActionsBlock = () => setViewActionBlock(true);
  const handleHideActionsBlock = () => setViewActionBlock(false);
  const handleFileItemClick = (idFiles: string) => {
    history.push(`/files/${idFiles}`);
  };

  const handleDeleteFiles = async () => {
    const confirmed = await getConfirmation({
      title: `${t("file-on-list.confirm.tittle")}`,
      message: `${t("file-on-list.confirm.message")} ${fileName}`,
    });
    if (confirmed) {
      handleDeleteObject(fileSObject.Key);
    }
  };

  const handleSelectFile = () => {
    handleSelectedFiles(fileSObject.uid, fileSObject.Name, fileSObject.Key);
    setSelectedFile(!selectedFile);
  };

  const handleEditName = async () => {
    const confirmed = await getConfirmation({
      title: t("file-on-list.confirm-rename.tittle"),
      message: t("file-on-list.confirm-rename.message"),
    });
    if (confirmed) {
      setIsInEdit(true)
    }
  }

  useEffect(() => {
    defineFileExtention();
  }, [fileSObject]);

  useEffect(() => {
    setSelectedFile(false);
  }, [sendingFiles, movingObjects]);

  const handleOpenFileVersionModal = () => setOpenFileVersionModal(true);
  const handleCloseFileVersionModal = () => setOpenFileVersionModal(false);

  return (
    <TableRow
      className={classes.rootFileOnList}
      key={fileSObject.uid}
      onMouseOver={handleViewActionsBlock}
      onMouseOut={handleHideActionsBlock}
    >
      <TableCell>
        <div style={{ maxWidth: 400, display: "flex", alignItems: "center" }}>
          {(sendingFiles || movingObjects) && (
            <Checkbox
              color="primary"
              onChange={handleSelectFile}
              checked={selectedFile}
            />
          )}
          <div style={{ display: "flex", alignItems: "center" }}>
            {downloading ? (
              <Loader title={`Downloading ${fileSObject.Name}...`} />
            ) : null}
            {handleFileIcon(fileExtention)}
            {isInEdit ? (
              <Input
                value={fileName}
                onChange={(e) => {
                  setFileName(e.target.value);
                }}
              />
            ) : (
              <Typography
                style={{
                  maxWidth: 400,
                  marginInlineStart: 10,
                  wordWrap: "break-word",
                  fontSize: 12,
                }}
              >
                {fileSObject.Name}
              </Typography>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell align="center">
        <Typography style={{ minWidth: 150 }} className={classes.font}>
          {`${lastModifiedTime(fileSObject.LastModified)}`}
        </Typography>
      </TableCell>
      <TableCell style={{ cursor: "default" }}>
        <Typography
          style={{ maxWidth: 290, wordWrap: "break-word" }}
          className={classes.font}
        >
          {fileSObject?.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className={classes.font}>
          {fileSObject.user.name ? (
            <div>{`${fileSObject.user.name} - ${fileSObject.user.role}`}</div>
          ) : (
            <Typography align="center" className={classes.font}>
              ---
            </Typography>
          )}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <div style={{ minWidth: 350 }}></div>
        <div
          className={
            viewActionBlock
              ? classes.actionsButtonsView
              : classes.actionsButtonHide
          }
        >
          {downloading ? null : (
            <div>
              <Tooltip title={t("file-on-list.tooltip-history")}>
                <IconButton onClick={handleOpenFileVersionModal}>
                  <Badge
                    badgeContent={fileSObject.versions_count}
                    color="primary"
                  >
                    <History color="primary" />
                  </Badge>
                </IconButton>
              </Tooltip>
              {!isInEdit ? (
                  <>
                    <Tooltip title={`${t("file-on-list.tooltip-edit")}`}>
                      <IconButton
                          onClick={handleEditName}
                          color="primary"
                          disabled={!isPermitted}
                      >
                        <Edit fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </>
              ) : <>
                <Tooltip title={`${t("file-on-list.tooltip-save")}`}>
                  <IconButton
                      onClick={async () => {
                        await handleSaveEdit(
                            fileSObject.Key,
                            fileName,
                            fileSObject.uid
                        );
                        setIsInEdit(false);
                      }}
                      color="primary"
                      disabled={!isPermitted}
                  >
                    <SaveIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("file-on-list.tooltip-cancel")}`}>
                  <IconButton
                      onClick={async () => {
                        setIsInEdit(false);
                      }}
                      color="primary"
                      disabled={!isPermitted}
                  >
                    <Cancel fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </>}
              <Tooltip
                title={`${t("file-on-list.tooltip-download")}`}
                placement="right-end"
              >
                <Link
                  component="a"
                  variant="body2"
                  href={
                    fileSObject.uri + `/download?token=${getAuthUserToken()}`
                  }
                  download={fileSObject.Name}
                >
                  <IconButton color="primary">
                    <GetApp fontSize="medium" />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip
                title={`${t("file-on-list.tooltip-view")}`}
                placement="right-end"
              >
                <IconButton
                  onClick={() => {
                    handleFileItemClick(fileSObject.uid);
                  }}
                  color="primary"
                >
                  <VisibilityIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={`${t("file-on-list.tooltip-delete")}`}
                placement="right-end"
              >
                <IconButton
                  onClick={() => {
                    handleDeleteFiles();
                  }}
                  color="primary"
                  disabled={!isPermitted}
                >
                  <Delete fontSize="medium" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      </TableCell>
      <FileVersionModal
        file={fileSObject}
        handleCloseFileVersionModal={handleCloseFileVersionModal}
        openFileVersionModal={openFileVersionModal}
      />
    </TableRow>
  );
};

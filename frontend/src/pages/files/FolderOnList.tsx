import {
  Button,
  Checkbox, createStyles,
  Input,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText, makeStyles, TableCell, TableRow,
  Tooltip, Typography,
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import FolderIcon from "@material-ui/icons/Folder";
import { useTranslation } from "react-i18next";
import { FileSystemDirectoryObject } from "../../types/FileTypes";
import { Edit } from "@material-ui/icons";
import SaveIcon from "@material-ui/icons/Save";
import { useEffect, useState } from "react";
import { useConfirmationDialog } from "../../utils/elements/confirmation-dialog/ConfirmationDialog";

interface IFolderOnList {
  isPermitted: boolean;
  handleFolderItemClick: (key: string) => void;
  handleDeleteObject: (objectKey: string) => Promise<void>;
  handleSaveEdit: (
      objectPath: string,
      newName: string,
      objectUid: string | null
  ) => Promise<void>;
  movingObjects: boolean;
  dir: FileSystemDirectoryObject;
  handleSelectedDirectory: (directoryObject: FileSystemDirectoryObject) => void;
  sendingFiles: boolean;
}

const useStyles = makeStyles(() =>
    createStyles({
      rootFolderOnList: {
        cursor: "default",
        "&:hover" : {
          backgroundColor: "#e9e9e9",
        }
      },
    })
);

export const FolderOnList: React.FC<IFolderOnList> = ({
                                                        isPermitted,
                                                        handleFolderItemClick,
                                                        handleDeleteObject,
                                                        handleSaveEdit,
                                                        movingObjects,
                                                        dir,
                                                        handleSelectedDirectory,
                                                        sendingFiles,
                                                      }) => {
  const { t, i18n } = useTranslation();
  const [folderName, setFolderName] = useState<string>(dir.name);
  const { getConfirmation } = useConfirmationDialog();
  const classes = useStyles();
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<boolean>(false);

  const handleDeleteFolder = async () => {
    const confirmed = await getConfirmation({
      title: `${t("folder-on-list.confirm.tittle")}`,
      message: `${t("folder-on-list.confirm.message")} ${dir?.name}`,
    });
    if (confirmed) {
      handleDeleteObject(dir.key);
    }
  };

  const handleSelectDirectory = () => {
    handleSelectedDirectory(dir);
    setSelectedFolder(!selectedFolder);
  };

  useEffect(() => {
    setSelectedFolder(false);
  }, [sendingFiles, movingObjects]);

  return (
      <TableRow
          className={classes.rootFolderOnList}
          key={dir.key}
      >
        <TableCell style={{minWidth: 200}}
                   onClick={() => {
                       if (!isInEdit && !movingObjects) {
                           handleFolderItemClick(dir.key);
                       }
                   }}
        >
            <div style={{display: "flex", alignItems: "center"}}>
                {movingObjects && (
                    <Checkbox
                        color="primary"
                        onChange={handleSelectDirectory}
                        checked={selectedFolder}
                    />
                )}
                <FolderIcon color="primary"/>
                {isInEdit ? (
                    <Input
                        value={folderName}
                        onChange={(e) => {
                            setFolderName(e.target.value);
                        }}
                    />
                ) : (
                    <Typography style={{marginInlineStart: "10px", fontSize: 14}}>{dir.name}</Typography>
                )}
            </div>
        </TableCell>
        <TableCell/>
        <TableCell/>
        <TableCell/>
        <TableCell
            align="right"
            style={{minWidth: 200, paddingInlineStart: 25}}>
          <div>
            <Tooltip
                title={
                  isInEdit
                      ? `${t("file-on-list.tooltip-save")}`
                      : `${t("file-on-list.tooltip-edit")}`
                }
                placement="right-end"
            >
              <Button
                  onClick={async () => {
                    if (!isInEdit) {
                      setIsInEdit(true);
                    } else {
                      await handleSaveEdit(dir.key, folderName, null);
                      setIsInEdit(false);
                    }
                  }}
                  color="primary"
                  disabled={!isPermitted}
              >
                {!isInEdit ? (
                    <Edit fontSize="medium" />
                ) : (
                    <SaveIcon fontSize="medium" />
                )}
              </Button>
            </Tooltip>
            <Tooltip
                title={`${t("file-on-list.tooltip-delete")}`}
                placement="right-end"
            >
              <Button
                  onClick={handleDeleteFolder}
                  color="primary"
                  disabled={!isPermitted}
              >
                <Delete fontSize="medium" />
              </Button>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
  );
};
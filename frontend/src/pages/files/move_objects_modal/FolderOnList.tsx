import {
  Button,
  Checkbox,
  Input,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import { useTranslation } from "react-i18next";
import { useConfirmationDialog } from "../../../utils/elements/confirmation-dialog/ConfirmationDialog";
import { FileSystemDirectoryObject } from "../../../types/FileTypes";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
import { useState } from "react";

interface IFolderOnList {
  isPermitted: boolean;
  handleFolderItemClick: (key: string) => void;
  dir: FileSystemDirectoryObject;
  setTargetDirectory: React.Dispatch<React.SetStateAction<string>>;
  currentDirDisplayName: string;
  setTargettDirDisplayName: React.Dispatch<React.SetStateAction<string | null>>;
}

export const FolderOnList: React.FC<IFolderOnList> = ({
  isPermitted,
  handleFolderItemClick,
  dir,
  setTargetDirectory,
  currentDirDisplayName,
  setTargettDirDisplayName,
}) => {
  const { t, i18n } = useTranslation();
  const [folderName, setFolderName] = useState<string>(dir.name);
  const { getConfirmation } = useConfirmationDialog();
  const [isInEdit, setIsInEdit] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<boolean>(false);

  return (
    <ListItem
      key={dir.key}
      style={{ width: "400px" }}
      button
      onClick={() => {
        handleFolderItemClick(dir.key);
      }}
    >
      <ListItemIcon>
        <FolderIcon />
      </ListItemIcon>

      <ListItemText primary={dir.name} />

      <ListItemSecondaryAction>
        <Tooltip
          title={`${t("files.move-file-modal.folder.select-button-tooltip")}`}
          placement="right-end"
        >
          <Button
            onClick={() => {
              setTargettDirDisplayName(currentDirDisplayName + dir.name + "/");
              setTargetDirectory(dir.key);
            }}
            color="primary"
            disabled={!isPermitted}
          >
            <CenterFocusStrongIcon fontSize="medium" />
          </Button>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

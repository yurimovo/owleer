import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText, TableCell, TableRow, Tooltip,
} from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import { useTranslation } from "react-i18next";
import { FileSystemDirectoryObject } from "../../../../../types/FileTypes";
import {handleFileIcon} from "../../../../../utils/icons/handleFileIcon";
import {lastModifiedTime} from "../../../../../utils/timeUtils";
import {Add} from "@material-ui/icons";
import SelectedFilePrintingInfoModal from "../file/SelectedFilePrintingInfoModal";
import React from "react";

interface IFolderOnSelection {
  isPermitted: boolean;
  handleFolderItemClick: (key: string) => void;
  dir: FileSystemDirectoryObject;
}

export const FolderOnSelection: React.FC<IFolderOnSelection> = ({
  handleFolderItemClick,
  dir,
}) => {

  return (
        <TableRow hover>
          <TableCell
              onClick={() => handleFolderItemClick(dir.key)}
              component="th"
              scope="row">
              <div style={{display: "flex", alignItems: "center"}}>
                  <FolderIcon color="primary" style={{marginInlineEnd: 10}}/>
                  {dir.name}
              </div>
          </TableCell>
          <TableCell/>
          <TableCell/>
          <TableCell align="right"/>
        </TableRow>
  );
};

import {
  Button,
  createStyles,
  Grid,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles, TableCell, TableRow,
  Tooltip,
} from "@material-ui/core";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import React, { useState } from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { FileSystemObject } from "../../../../../types/FileTypes";
import { Add } from "@material-ui/icons";
import { PrintingOrder } from "../../../../../types/PrintaryTypes";
import SelectedFilePrintingInfoModal from "./SelectedFilePrintingInfoModal";
import { lastModifiedTime } from "../../../../../utils/timeUtils";
import { ProjectPrintingAgency } from "../../../../../types/ProjectTypes";
import { OrderType } from "../../../../../types/OrderTypes";
import {handleFileIcon} from "../../../../../utils/icons/handleFileIcon";

interface IFileOnSelection {
  fileSObject: FileSystemObject;
  isPermitted: boolean;
  printingOrder: OrderType;
  contextAgency: ProjectPrintingAgency;
  setPrintingOrder: React.Dispatch<React.SetStateAction<PrintingOrder>>;
}

const useStyles = makeStyles(() =>
  createStyles({
    rootFileOnList: {
      display: "flex",
      width: "100%",
    },
    file: {
      padding: 11,
      "&:hover": {
        padding: "10px",
        border: "1px solid #DCDCDC",
      },
    },
    actionsButtonsView: {
      paddingLeft: 10,
    },
    actionsButtonHide: {
      display: "none",
    },
  })
);

const PRINT_TYPE_OPTIONS = ["color", "Black And White"];

export const FileOnSelection: React.FC<IFileOnSelection> = ({
  isPermitted,
  fileSObject,
  printingOrder,
  setPrintingOrder,
  contextAgency,
}) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);

  const handleFileItemClick = (idFiles: string) => {
    history.push(`/files/${idFiles}`);
  };

  return (
      <TableRow hover>
        <TableCell component="th" scope="row">
            <div style={{display: "flex", alignItems: "center"}}>
                {handleFileIcon(fileSObject.Name.split(".").pop())}
                <div style={{maxWidth: 220, wordWrap: "break-word", marginInlineStart: 10}}>
                    {fileSObject.Name}
                </div>
            </div>

        </TableCell>
        <TableCell align="right">
            {lastModifiedTime(fileSObject.LastModified)}</TableCell>
        <TableCell align="right"  style={{maxWidth: 150, wordWrap: "break-word", textAlign: "center"}}>{fileSObject.description}</TableCell>
        <TableCell align="right">
          <Tooltip
              title={`${t("printery.file-selection.add-icon-tooltip")}`}
              placement="right-end"
          >
            <Button
                disabled={!(contextAgency?.works?.length > 0)}
                onClick={() => {
                  setOpenAddModal(true);
                }}
                color="primary"
            >
              <Add fontSize="medium" />
            </Button>
          </Tooltip>
        </TableCell>
          <SelectedFilePrintingInfoModal
              prinitingOrder={printingOrder}
              setPrintingOrder={setPrintingOrder}
              open={openAddModal}
              setOpen={setOpenAddModal}
              file={fileSObject}
              contextAgency={contextAgency}
          />
      </TableRow>
  );
};

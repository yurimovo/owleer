import {
    Button,
    createStyles,
    Grid, IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip,
} from "@material-ui/core";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import React from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import {Delete, Visibility} from "@material-ui/icons";
import { FileToPrint, PrintingOrder } from "../../../types/PrintaryTypes";
import { OrderType } from "../../../types/OrderTypes";

interface IFileOnSelection {
  fileToPrint: FileToPrint;
  printingOrder: OrderType;
  setPrintingOrder: React.Dispatch<React.SetStateAction<OrderType>>;
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

export const SelectedFile: React.FC<IFileOnSelection> = ({
  fileToPrint,
  printingOrder,
  setPrintingOrder,
}) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const classes = useStyles();

  const handleFileItemClick = (idFiles: string) => {
    history.push(`/files/${idFiles}`);
  };

  const handleDeleteFile = () => {
      const updatedOrder = { ...printingOrder };
      const findIndex =
          printingOrder.files.indexOf(fileToPrint);
      const oldArr = [...printingOrder.files];
      const arr = [
          ...oldArr.slice(0, findIndex),
          ...oldArr.slice(findIndex + 1),
      ];
      updatedOrder.files = arr;
      setPrintingOrder(updatedOrder);
  }

  return (
                          <TableRow>
                              <TableCell style={{maxWidth: 80}}>
                                  <Tooltip
                                      style={{fontSize: 10}}
                                      title={fileToPrint.file.Key.split("/")[1]}>
                                      <div>
                                          {
                                              fileToPrint.file.Key.length > 20
                                                  ? fileToPrint.file.Key.split("/")[1].substring(0, 20) + "..."
                                                  : fileToPrint.file.Key.split("/")[1]
                                          }
                                      </div>
                                  </Tooltip>
                              </TableCell>
                              <TableCell style={{fontSize: 10}} align="left">{fileToPrint.foldingType}</TableCell>
                              <TableCell style={{fontSize: 10}} align="left">{fileToPrint.workType}</TableCell>
                              <TableCell style={{fontSize: 10, maxWidth: 70}} align="left">{fileToPrint.pageSize}</TableCell>
                              <TableCell style={{fontSize: 10}} align="left">{fileToPrint.copies}</TableCell>
                              <TableCell style={{display: "flex"}} align="left">
                                  <IconButton onClick={() => handleFileItemClick(fileToPrint.file.uid)}>
                                      <Visibility
                                          fontSize="small"
                                          color="primary"
                                          />
                                  </IconButton>
                                  <IconButton onClick={handleDeleteFile}>
                                      <Delete
                                          fontSize="small"
                                          color="primary"
                                      />
                                  </IconButton>
                              </TableCell>
                          </TableRow>
  );
};

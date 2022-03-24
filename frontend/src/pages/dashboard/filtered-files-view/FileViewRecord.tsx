import {
  Button,
  createStyles,
  Divider,
  Grid,
  Icon,
  Link,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { FilteredFileType } from "../../../types/FileTypes";
import { useHistory } from "react-router";
import { Edit, GetApp } from "@material-ui/icons";
import { getAuthUserToken } from "../../../utils/auth/getAuthUserToken";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { useTranslation } from "react-i18next";
import Loader from "../../../utils/elements/Loader";
import { handleFileIcon } from "../../../utils/icons/handleFileIcon";
import { lastModifiedTime } from "../../../utils/timeUtils";
import TableContainer from "@material-ui/core/TableContainer";

interface ILastFileRecord {
  file: FilteredFileType;
}

const useStyles = makeStyles(() =>
  createStyles({
    file: {
      padding: 10,
      fontWeight: "bold",
      "&:hover": {
        padding: "10px",
        // border: "1px solid #DCDCDC",
      },
    },
    actionsButtonsView: {
      paddingLeft: 10,
    },
    actionsButtonHide: {
      display: "none",
    },
    row: {
      minWidth: "100%",
      maxWidth: "100%",
      height: "50px",
      "&:hover": {
        backgroundColor: "#e9e9e9",
        // border: "1px solid #DCDCDC",
      },
    },
    font: {
      fontSize: "12px",
      wordWrap: "break-word",
    },
  })
);

export const FileViewRecord: React.FC<ILastFileRecord> = ({ file }) => {
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTranslation();
  const [viewActionBlock, setViewActionBlock] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [fileExtention, setFileExtention] = useState<string | undefined>("");

  const defineFileExtention = () => {
    setFileExtention(file.Name.split(".").pop());
  };

  const handleViewActionsBlock = () => {
    setViewActionBlock(true);
  };

  const handleHideActionsBlock = () => {
    setViewActionBlock(false);
  };
  const handleFileItemClick = (idFiles: string) => {
    history.push(`/files/${idFiles}`);
  };

  const handleDownloadFile = () => {
    setDownloading(true);
    let token = getAuthUserToken();

    fetch(file.uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.Name);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  useEffect(() => {
    defineFileExtention();
  }, [file]);

  return (
    <TableRow
      className={classes.row}
      key={file.uid}
      onMouseOver={handleViewActionsBlock}
      onMouseOut={handleHideActionsBlock}
    >
      <TableCell
        className={classes.font}
        style={{ maxWidth: 400 }}
        align="left"
      >
        {downloading ? <Loader title={`Downloading ${file.Name}...`} /> : null}
        <div style={{ display: "flex", alignItems: "center" }}>
          {handleFileIcon(fileExtention)}
          <div
            style={{
              maxWidth: 350,
              wordWrap: "break-word",
              marginInlineStart: 10,
            }}
          >
            {file.Name.split("/").slice(1).join("/")}
          </div>
        </div>
      </TableCell>
      <TableCell className={classes.font} align="center">{`${lastModifiedTime(
        file.created_at
      )}`}</TableCell>
      <TableCell
        className={classes.font}
        align="center"
        style={{ maxWidth: "30vh" }}
      >
        {file.description}
      </TableCell>
      <TableCell className={classes.font} align="center">
        {file.user.name ? (
          <div>{`${file.user.name} - ${file.user.role}`}</div>
        ) : (
          <Typography align="center">---</Typography>
        )}
      </TableCell>
      <TableCell className={classes.font} align="right">
        <div className={classes.actionsButtonsView}>
          <div>
            <Tooltip
              title={`${t("file-on-list.tooltip-download")}`}
              placement="right-end"
            >
              <Link
                component="a"
                variant="body2"
                href={file.uri + `/download?token=${getAuthUserToken()}`}
                download={file.Name}
              >
                <Button color="primary">
                  <GetApp fontSize="medium" />
                </Button>
              </Link>
            </Tooltip>
            <Tooltip
              title={`${t("file-on-list.tooltip-view")}`}
              placement="right-end"
            >
              <Button
                onClick={() => {
                  handleFileItemClick(file.uid);
                }}
                color="primary"
              >
                <VisibilityIcon fontSize="medium" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

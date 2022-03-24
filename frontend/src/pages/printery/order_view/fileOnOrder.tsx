import {
  Button,
  createStyles,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import React, { useState } from "react";
import { useHistory } from "react-router";
import { Visibility } from "@material-ui/icons";
import { FileFetchOnOrder } from "../../../types/OrderTypes";
import { useTranslation } from "react-i18next";

interface IFileOnOrder {
  file: FileFetchOnOrder;
}

const useStyles = makeStyles(() =>
  createStyles({
    rootFileOnList: {
      display: "flex",
      minWidth: "100%",
    },
    file: {
      padding: 11,
    },
    actionsButtonsView: {
      paddingLeft: "10px",
    },
    actionsButtonHide: {
      display: "none",
    },
  })
);

export const FileOnOrder: React.FC<IFileOnOrder> = ({ file }) => {
  const history = useHistory();
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [viewActionBlock, setViewActionBlock] = useState<boolean>(false);

  const handleViewActionsBlock = () => {
    setViewActionBlock(true);
  };

  const handleHideActionsBlock = () => {
    setViewActionBlock(false);
  };

  return (
    <ListItem
      fullwidth
      onMouseOver={handleViewActionsBlock}
      onMouseOut={handleHideActionsBlock}
    >
      <ListItemText
        primary={file.path}
        secondary={`${file.data.folding} | ${file.data.workType} | ${file.data.pageSize} | X${file.data.copies}`}
      />
      <div
        className={
          viewActionBlock
            ? classes.actionsButtonsView
            : classes.actionsButtonHide
        }
      >
        <Tooltip title={`${t("file-on-order.tooltip.view-file")}`}>
          <Button onClick={() => history.push(`/files/${file.uid}`)}>
            <Visibility color="primary" />
          </Button>
        </Tooltip>
      </div>
    </ListItem>
  );
};

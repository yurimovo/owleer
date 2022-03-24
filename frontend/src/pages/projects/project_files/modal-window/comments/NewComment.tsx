import React from "react";
import { useState } from "react";
import { Send } from "@material-ui/icons";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { createFileIssueComment } from "../../../../../utils/files/file_view/issues/comments/createFileIssueComment";
import { fetchFileIssueComments } from "../../../../../utils/files/file_view/issues/fetchFileIssueCommets";
import { fetchFileIssueCommentsAction } from "../../../../../actions/actions";
import { useDispatch } from "react-redux";
import { useSnackBar } from "../../../../../utils/elements/snackbar/useSnackBar";

const useStyles = makeStyles({
  rootNewCommit: {
    display: "flex",
  },
  sendIcon: {
    display: "flex",
    alignItems: "flex-end",
    marginLeft: "10px",
  },
  field: {
    minWidth: "400px",
  },
});

interface INewCommit {
  selectIssueUid: string;
}

export const NewComment: React.FC<INewCommit> = ({ selectIssueUid }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { alertAction } = useSnackBar();
  const [newCommit, setNewCommit] = useState("");

  const handleSendNewCommit = () => {
    if (newCommit !== "") {
      createFileIssueComment(selectIssueUid, { text: newCommit })
        .then((r) => {
          fetchFileIssueComments(selectIssueUid)
            .then((r) => dispatch(fetchFileIssueCommentsAction(r)))
            .catch((e) => e);
          setNewCommit("");
        })
        .catch((e) => e);
    } else {
      alertAction.error("Comment cannot be empty");
    }
  };

  return (
    <div className={classes.rootNewCommit}>
      <TextField
        value={newCommit}
        fullWidth
        className={classes.field}
        label="New comment"
        multiline
        rows={4}
        placeholder="Your comment"
        variant="outlined"
        onChange={(e) => setNewCommit(e.target.value)}
      />
      <div className={classes.sendIcon}>
        <Send color="primary" onClick={handleSendNewCommit} />
      </div>
    </div>
  );
};

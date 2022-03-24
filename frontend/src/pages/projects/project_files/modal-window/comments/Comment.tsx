import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CommentInList } from "../../../../../types/FileTypes";
import React from "react";
import { lastModifiedTime } from "../../../../../utils/timeUtils";

interface IComment {
  comment: CommentInList;
}
const useStyles = makeStyles({
  root: {
    margin: "5px",
    minWidth: "350px",
  },
  labelCard: {
    display: "flex",
    alignItems: "center",
    marginLeft: "2%",
  },
  headerBlockCard: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "3%",
  },
  labelName: {
    padding: 0,
    margin: 0,
    fontSize: "16px",
  },
  commentTime: {
    color: "#a4a5ad",
    fontSize: "14px",
  },
  content: {
    marginLeft: "5%",
  },
});

export const Comment: React.FC<IComment> = ({ comment }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={<Avatar alt={comment.user.name} />}
        title={
          <div>
            {comment.user.name} | {comment.user.role}{" "}
          </div>
        }
        subheader={
          comment.created_at ? lastModifiedTime(comment.created_at) : null
        }
        className={classes.labelCard}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {comment.text}
        </Typography>
      </CardContent>
    </Card>
  );
};

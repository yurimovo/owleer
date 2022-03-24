import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import {
  setContextIssueAction,
  setOpenIssueModalAction,
} from "../../../../actions/actions";
import { useDispatch } from "react-redux";
import { FileIssue, FileIssueData } from "../../../../types/FileTypes";
import { lastModifiedTime } from "../../../../utils/timeUtils";

interface IIssueList {
  issue: FileIssue;
  handleHoverIssue: (issue: FileIssueData | null) => void;
}

export const IssueList: React.FC<IIssueList> = ({
  issue,
  handleHoverIssue,
}) => {
  const dispatch = useDispatch();
  const handleIssueClick = (issue: FileIssue) => {
    dispatch(setContextIssueAction(issue));
    dispatch(setOpenIssueModalAction(true));
  };

  return (
    <Card
      style={{
        backgroundColor: issue.data.color,
        padding: 10,
        margin: 5,
        background: `radial-gradient(${issue.data.color}, #fff0 90%, white)`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "-100vw -75vh",
        backgroundSize: "300vw 100vh",
      }}
    >
      <CardActionArea
        onMouseOver={() => {
          handleHoverIssue(issue);
        }}
        onMouseOut={() => {
          handleHoverIssue(null);
        }}
        onClick={() => {
          handleIssueClick(issue);
        }}
      >
        <CardHeader
          avatar={<Avatar alt={issue.user.name} />}
          title={
            <div>
              {issue.user.name} | {issue.user.role}{" "}
            </div>
          }
          subheader={
            issue.created_at ? lastModifiedTime(issue.created_at) : null
          }
        />
        <CardContent>
          <Typography
            style={{ fontWeight: "bold" }}
            color="inherit"
            component="p"
          >
            {issue.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

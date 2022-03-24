import { ReactComponent as CommentOnIssue } from "../../assets/events/commentOnIssue.svg";
import { ReactComponent as FileUpload } from "../../assets/events/fileUpload.svg";

import { ReactComponent as GenerateReportEvent } from "../../assets/events/generateReportEvent.svg";

import { ReactComponent as IssueCreated } from "../../assets/events/issueCreated.svg";

import { ReactComponent as SendMailEvent } from "../../assets/events/sendMailEvent.svg";

export const handleEventPicture = (eventType: string) => {
  if (eventType == "COMMENT_PLACED") {
    return <CommentOnIssue />;
  }
  if (eventType == "FILES_UPLOADED") {
    return <FileUpload />;
  }
  if (eventType == "REPORT_GENERATED") {
    return <GenerateReportEvent />;
  }
  if (eventType == "ISSUE_CREATED") {
    return <IssueCreated />;
  }
  if (eventType == "FILES_SENT") {
    return <SendMailEvent />;
  }
};

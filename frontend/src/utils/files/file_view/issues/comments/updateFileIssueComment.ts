import { CommentData } from "../../../../../types/FileTypes";
import { fetchWrapper } from "../../../../fetchWrapper";

export const updateFileIssueComment = async (
  commentUid: string,
  data: CommentData
) => {
  const issueData = JSON.stringify(data);

  try {
    const r = await fetchWrapper(
      `/api/project/file/issue/comment/${commentUid}`,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
        body: issueData,
      }
    );
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

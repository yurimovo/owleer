import { CommentData } from "../../../../../types/FileTypes";
import { fetchWrapper } from "../../../../fetchWrapper";

export const createFileIssueComment = async (
  issueUid: string,
  data: CommentData
) => {
  const issueData = JSON.stringify(data);

  try {
    const r = await fetchWrapper(
      `/api/project/file/issue/${issueUid}/comment`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: issueData,
      }
    );
    if (!r.ok) throw new Error(r.statusText);

    return (await r.json()) as { uid: string };
  } catch (e) {
    throw e;
  }
};

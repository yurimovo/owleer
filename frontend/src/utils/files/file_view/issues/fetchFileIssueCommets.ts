import { CommentInList } from "../../../../types/FileTypes";
import { fetchWrapper } from "../../../fetchWrapper";

export const fetchFileIssueComments = async (issueUid: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/file/issue/${issueUid}/comment/list`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) throw new Error(r.statusText);
    return (await r.json()) as Array<CommentInList>;
  } catch (e) {
    throw e;
  }
};

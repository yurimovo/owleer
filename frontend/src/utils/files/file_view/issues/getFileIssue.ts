import { FileIssue } from "../../../../types/FileTypes";
import { fetchWrapper } from "../../../fetchWrapper";

export const getFileIssue = async (issueUid: string) => {
  try {
    const r = await fetchWrapper(`/api/project/file/issue/${issueUid}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) throw new Error(r.statusText);
    return (await r.json()) as FileIssue;
  } catch (e) {
    throw e;
  }
};

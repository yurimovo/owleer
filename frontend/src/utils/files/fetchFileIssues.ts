import { FileIssue, FileIssuesFilter } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchFileIssues = async (
  fileUid: string,
  filters: FileIssuesFilter = {
    user_emails: [],
    page: null,
  } as FileIssuesFilter
) => {
  try {
    const body = JSON.stringify(filters);
    const r = await fetchWrapper(`/api/project/file/${fileUid}/issue/list`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: body,
    });
    if (!r?.ok) throw new Error(r.statusText);
    return (await r.json()) as Array<FileIssue>;
  } catch (e) {
    throw e;
  }
};

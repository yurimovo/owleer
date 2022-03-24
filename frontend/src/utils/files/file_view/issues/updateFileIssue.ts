import { FileIssueData } from "../../../../types/FileTypes";
import { fetchWrapper } from "../../../fetchWrapper";

export const updateFileIssue = async (
  issueUid: string,
  data: FileIssueData
) => {
  const issueData = JSON.stringify(data);

  try {
    const r = await fetchWrapper(`/api/project/file/issue/${issueUid}`, {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      body: issueData,
    });
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

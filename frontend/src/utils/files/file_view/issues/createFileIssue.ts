import { FileIssueData } from "../../../../types/FileTypes";
import { fetchWrapper } from "../../../fetchWrapper";

export const createFileIssue = async (
  fileUid: string,
  data: FileIssueData,
  pageNumber: number | undefined | null
) => {
  const issueData = JSON.stringify({ ...data, page: pageNumber });

  try {
    const r = await fetchWrapper(`/api/project/file/${fileUid}/issue`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: issueData,
    });
    if (!r.ok) throw new Error(r.statusText);

    return (await r.json()) as { uid: string };
  } catch (e) {
    throw e;
  }
};

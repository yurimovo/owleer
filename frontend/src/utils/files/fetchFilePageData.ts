import { FileIssue, FileIssuesFilter } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchFilePageData = async (
  fileUid: string,
  pageNumber: number
) => {
  try {
    const r = await fetchWrapper(
      `/api/project/file/${fileUid}/page/${pageNumber}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r?.ok) throw new Error(r.statusText);
    return await r.json();
  } catch (e) {
    throw e;
  }
};

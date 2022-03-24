import { fetchWrapper } from "../../../../fetchWrapper";

export const deleteFileIssueComment = async (commentUid: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/file/issue/comment/${commentUid}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

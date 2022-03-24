import { fetchWrapper } from "../../../fetchWrapper";


export const deleteFileIssue = async (issueUid: string) => {

    try {
        const r = await fetchWrapper(`/api/project/file/issue/${issueUid}`, {
          method: "DELETE",
          mode: "cors",
          credentials: "include",
      });
        if (!r.ok) throw new Error(r.statusText);
      
      } catch (e) {
          throw e;
      }
}
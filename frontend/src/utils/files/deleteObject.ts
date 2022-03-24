import { ListObjects } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const deleteObject = async (
  projectUid: string,
  objectPath: string = "/"
) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${projectUid}/file_system/object?path=${objectPath}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r?.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

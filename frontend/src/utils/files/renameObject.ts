import { ListObjects } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const renameObject = async (
  projectUid: string,
  objectPath: string = "/",
  newName: string,
  objectUid: null | string
) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${projectUid}/file_system/object/rename?path=${objectPath}&new_name=${newName}&object_uid=${objectUid}`,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

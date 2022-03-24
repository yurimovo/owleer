import { ListObjects } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const listObjects = async (
  projectUid: string,
  prefix: string = "",
  delimiter: string = "/"
) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${projectUid}/file/objects?delimiter=${delimiter}&path=${prefix}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) throw new Error(r.statusText);

    const data = await r.json();
    return data as ListObjects;
  } catch (e) {
    throw e;
  }
};

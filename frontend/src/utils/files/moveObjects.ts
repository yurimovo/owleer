import { MovingObject } from "../../types/FileTypes";
import { fetchWrapper } from "../fetchWrapper";

export const moveObjects = async (
  projectUid: string,
  targetDirectory: string,
  objects: Array<MovingObject>
) => {
  const bodyData = JSON.stringify({
    target_directory: targetDirectory,
    objects: objects,
  });
  try {
    const r = await fetchWrapper(
      `/api/project/${projectUid}/file_system/object/move`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: bodyData,
      }
    );
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

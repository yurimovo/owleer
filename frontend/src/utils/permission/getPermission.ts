import { Permission } from "../../types/PermissionType";
import { fetchWrapper } from "../fetchWrapper";

export const getPermissions = async (objectUid: string, objectName: string) => {
  try {
    const r = await fetchWrapper(
      `/api/permission/list?object_name=${objectName}&object_uid=${objectUid}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) throw new Error(r.statusText);
    return (await r.json()) as Array<Permission>;
  } catch (e) {
    throw e;
  }
};

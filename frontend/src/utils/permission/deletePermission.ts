import { fetchWrapper } from "../fetchWrapper";

export const deletePermission = async (permissionUid: string) => {
  try {
    const r = await fetchWrapper(`/api/permission/${permissionUid}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

import { fetchWrapper } from "../fetchWrapper";
import { GrantPermission } from "../../types/PermissionType";

export const grantPermission = async (data: GrantPermission) => {
  const userEmail = JSON.stringify({
    object_name: data.objectName,
    object_uid: data.objectUid,
    user_email: data.userEmail,
    permission: data.permission,
  });
  console.log(userEmail)
  try {
    await fetchWrapper(`/api/permission/grant`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: userEmail,
    });
  } catch (e) {
    throw e;
  }
};

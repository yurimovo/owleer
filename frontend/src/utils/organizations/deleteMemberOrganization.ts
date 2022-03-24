import { Organization } from "../../types/OrganizationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const deleteMemberOrganization = async (uid: string, email: string) => {
  const userEmail = JSON.stringify({ email });
  try {
    const r = await fetchWrapper(`/api/company/${uid}/member`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
      body: userEmail,
    });
    const data = await r.json();
    return data as Array<Organization>;
  } catch (e) {
    throw e;
  }
};

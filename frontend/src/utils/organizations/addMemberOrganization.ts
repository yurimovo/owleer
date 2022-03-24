import { Organization } from "../../types/OrganizationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const addMemberOrganization = async (uid: string, email: string) => {
  const userEmail = JSON.stringify({ email });
  try {
    const r = await fetchWrapper(`/api/company/${uid}/member`, {
      method: "POST",
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

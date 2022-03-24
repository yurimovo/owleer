import { Organization } from "../../types/OrganizationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchOrganizationByUid = async (uid: string) => {
  try {
    const r = await fetchWrapper(`/api/company?company_uid=${uid}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    const data = await r.json();
    return data as Array<Organization>;
  } catch (e) {
    throw e;
  }
};

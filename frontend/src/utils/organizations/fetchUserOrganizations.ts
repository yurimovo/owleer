import { Organization } from "../../types/OrganizationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const fetchUserOrganization = async () => {
  try {
    const r = await fetchWrapper(`/api/company/list`, {
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

import { OrganizationInSearchList } from "../../types/OrganizationTypes";
import { fetchWrapper } from "../fetchWrapper";

export const searchCompanies = async (query: string) => {
  try {
    const r = await fetchWrapper(`/api/company/search?query=${query}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r.statusText);
    const data = await r.json();
    return data as Array<OrganizationInSearchList>;
  } catch (e) {
    throw e;
  }
};

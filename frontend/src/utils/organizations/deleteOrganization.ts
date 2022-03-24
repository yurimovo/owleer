import { fetchWrapper } from "../fetchWrapper";
import { CompanyCreateType } from "../../types/CompanyTypes";

export const deleteOrganization = async (orgUid: string) => {
  try {
    await fetchWrapper(`/api/company/${orgUid}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
  } catch (e) {
    throw e;
  }
};

import { fetchWrapper } from "../fetchWrapper";
import { OrganizationUpdate } from "../../types/OrganizationTypes";

export const updateOrganization = async (
  orgUid: string,
  data: OrganizationUpdate
) => {
  const organizationData = JSON.stringify(data);
  try {
    await fetchWrapper(`/api/company/${orgUid}`, {
      method: "PUT",
      mode: "cors",
      credentials: "include",
      body: organizationData,
    });
  } catch (e) {
    throw e;
  }
};

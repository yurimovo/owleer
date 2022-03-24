import { MondayProfile } from "../../../types/integration/mondayIntegrationType";
import { fetchWrapper } from "../../fetchWrapper";

export const fetchMondayProfile = async () => {
  try {
    const r = await fetchWrapper(`/api/integration/monday/profile`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) {
      throw Error(r.statusText);
    }
    const data = await r.json();
    return data as MondayProfile;
  } catch (e) {
    throw e;
  }
};

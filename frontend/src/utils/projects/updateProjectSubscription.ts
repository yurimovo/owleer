import { fetchWrapper } from "../fetchWrapper";

export const updateProjectSubscription = async (
  project_uid: string,
  subscribe: boolean
) => {
  try {
    return await fetchWrapper(`/api/project/${project_uid}/subscribe`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({ subscribe: subscribe }),
    });
  } catch (e) {
    throw e;
  }
};

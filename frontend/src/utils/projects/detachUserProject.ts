import { fetchWrapper } from "../fetchWrapper";

export const detachUserProject = async (uid: string, email: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${uid}/participant?email=${email}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    return await r.json();
  } catch (e) {
    throw e;
  }
};

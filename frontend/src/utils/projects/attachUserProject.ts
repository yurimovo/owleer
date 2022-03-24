import { fetchWrapper } from "../fetchWrapper";

export const attachUserProject = async (projectUid: string, email: string) => {
  try {
    const r = await fetchWrapper(
      `/api/project/${projectUid}/participant?email=${email}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    return await r.json();
  } catch (e) {
    throw e;
  }
};

import { fetchWrapper } from "../../fetchWrapper";

export const fetchMeetingList = async () => {
  try {
    const r = await fetchWrapper(`/api/integration/zoom/meeting/list`, {
      method: "GET",
      mode: "cors",
    });
    return await r.json();
  } catch (e) {
    throw e;
  }
};

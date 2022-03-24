import { fetchWrapper } from "../../fetchWrapper";
import { NewMeetingType } from "../../../types/integration/zoom/Meetings";

export const createMeeting = async (dataMeeting: NewMeetingType) => {
  try {
    const r = await fetchWrapper(`/api/integration/zoom/meeting`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: JSON.stringify(dataMeeting),
    });
    return await r.json();
  } catch (e) {
    throw e;
  }
};

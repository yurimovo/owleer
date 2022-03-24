import { fetchWrapper } from "../../fetchWrapper";

export const deleteMeeting = async (meetingId: number) => {
  try {
    return await fetchWrapper(`/api/integration/zoom/meeting/${meetingId}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
  } catch (e) {
    throw e;
  }
};

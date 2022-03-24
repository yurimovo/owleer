import { Board } from "../../../types/integration/mondayIntegrationType";
import { fetchWrapper } from "../../fetchWrapper";

export const fetchBoards = async () => {
  try {
    const r = await fetchWrapper(`/api/integration/monday/board/list`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!r.ok) {
      throw Error(r.statusText);
    }
    const data = await r.json();
    return data as Array<Board>;
  } catch (e) {
    throw e;
  }
};

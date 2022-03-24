import { BoardItem } from "../../../types/integration/mondayIntegrationType";
import { fetchWrapper } from "../../fetchWrapper";

export const fetchBoardItems = async (boardId: string) => {
  try {
    const r = await fetchWrapper(
      `/api/integration/monday/board/${boardId}/item/list`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!r.ok) {
      throw Error(r.statusText);
    }
    const data = await r.json();
    return data as {
      board_name: string;
      items: Array<BoardItem>;
      columns: Array<string>;
    };
  } catch (e) {
    throw e;
  }
};

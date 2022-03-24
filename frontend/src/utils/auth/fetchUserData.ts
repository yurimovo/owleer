import { UserData } from "../../types/AuthTypes";
import { fetchWrapper } from "../fetchWrapper";

type fetchUserType = () => Promise<UserData>;

export const fetchUserData: fetchUserType = () =>
new Promise(async (resolve, reject) => {
  try {
    const r = await fetchWrapper(`/api/user`, {
      method: "GET",
      mode: "cors",
      credentials: "include"
  });
    const data = await r.json()
    resolve(data);
  } catch (e) {
    reject(e?.code);
  }
}
)
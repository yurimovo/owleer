import { fetchWrapper } from "../fetchWrapper";

export const createUser = async (
  email: string,
  name: string,
  company: string,
  role: string,
  auth_token: string
) => {
  try {
    const r = await fetchWrapper(`/api/user/upsert`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        name: name,
        company: company,
        role: role,
        auth_token: auth_token,
      }),
      mode: "cors",
      credentials: "include",
    });
    if (!r?.ok) throw new Error(r.statusText);
  } catch (e) {
    return;
  }
};

import { fetchWrapper } from "../../../fetchWrapper";

export const sendReport = async (
  fileUid: string,
  recipientsMaila: Array<string>
) => {
  try {
    const data = JSON.stringify({ recipients_mails: recipientsMaila });

    const r = await fetchWrapper(`/api/project/file/${fileUid}/report`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: data,
    });
    if (!r.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

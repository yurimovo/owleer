import { fetchWrapper } from "../fetchWrapper";

export const upsertFilePageData = async (
  fileUid: string,
  pageNumber: number,
  data: object
) => {
  try {
    const body = JSON.stringify({ data: data });
    const r = await fetchWrapper(
      `/api/project/file/${fileUid}/page/${pageNumber}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: body,
      }
    );
    if (!r?.ok) throw new Error(r.statusText);
  } catch (e) {
    throw e;
  }
};

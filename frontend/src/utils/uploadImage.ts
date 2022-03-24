import { fetchWrapper } from "./fetchWrapper";

export async function uploadImage(file: File) {
  const data = new FormData();
  data.append("file", file);
  const r = await fetchWrapper(`/api/utils/upload_image`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!r.ok) throw new Error(r.statusText);
  const responseJson = await r.json();

  return responseJson as { file_uri: string };
}

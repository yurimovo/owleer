import { fetchWrapper } from "../fetchWrapper";

export async function createFolder(
  project_uid: string,
  path: string,
  folderName: string
) {
  try {
    await fetchWrapper(
      `/api/project/${project_uid}/folder?path=${path}&folder_name=${folderName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (e) {
    console.error(e);
    return "";
  }
}

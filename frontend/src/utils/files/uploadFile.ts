import { fetchWrapperAxios } from "../fetchWrapperAxios";

export async function uploadFile(uploadFileData: {
  file: File;
  project_uid: string;
  path: string;
  onProgressCallback: (p: any) => void;
  fileDescription: string;
}) {
  try {
    const fileData = new FormData();

    fileData.append("file", uploadFileData.file);
    fileData.append("description", uploadFileData.fileDescription);

    const res = await fetchWrapperAxios({
      url: `/api/project/${uploadFileData.project_uid}/file/upload?path=${uploadFileData.path}`,
      method: "POST",
      data: fileData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: uploadFileData.onProgressCallback,
    });
    return res as { file_name: string; uid: string };
  } catch (e) {
    throw e;
  }
}

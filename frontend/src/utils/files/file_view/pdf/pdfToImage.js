import * as PDFJS from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { getAuthUserToken } from "../../../auth/getAuthUserToken";

export const pdfToImage = async (fileUri, pageNum, setNumPages) => {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
  if (fileUri) {
    let token = getAuthUserToken();
    var parameter = {
      url: fileUri,
      httpHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    const loadedPdf = await PDFJS.getDocument(parameter).promise;
    const page = await loadedPdf.getPage(pageNum);
    setNumPages(loadedPdf.numPages);
    const viewport = page.getViewport({ scale: 2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    const pdfImage = new window.Image();
    pdfImage.src = canvas.toDataURL("image/jpeg");
    return pdfImage;
  }
};

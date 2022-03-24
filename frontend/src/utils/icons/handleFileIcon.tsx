import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import { ReactComponent as PdfIcon } from "../../assets/file-types/pdf.svg";
import { ReactComponent as DwgIcon } from "../../assets/file-types/dwg.svg";
import { ReactComponent as DocIcon } from "../../assets/file-types/doc.svg";

import { ReactComponent as TxtIcon } from "../../assets/file-types/text.svg";
import { ReactComponent as ZipIcon } from "../../assets/file-types/zip.svg";
import { ReactComponent as PngIcon } from "../../assets/file-types/png.svg";

const ICON_STYLE = { maxWidth: "30px", maxHeight: "32px" };

export const handleFileIcon = (fileExtention: string | undefined) => {
  const fileExtentionLower = fileExtention?.toLocaleLowerCase();

  if (fileExtentionLower == "pdf") {
    return <PdfIcon style={ICON_STYLE} />;
  }
  if (fileExtentionLower == "dwg") {
    return <DwgIcon style={ICON_STYLE} />;
  }
  if (fileExtentionLower == "doc" || fileExtentionLower == "docx") {
    return <DocIcon style={ICON_STYLE} />;
  }
  if (fileExtentionLower == "zip" || fileExtentionLower == "rar") {
    return <ZipIcon style={ICON_STYLE} />;
  }
  if (fileExtentionLower == "png") {
    return <PngIcon style={ICON_STYLE} />;
  }
  if (fileExtentionLower == "txt") {
    return <TxtIcon style={ICON_STYLE} />;
  }
  return <InsertDriveFileOutlinedIcon />;
};

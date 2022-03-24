import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

import { fetchFileMetadata } from "../../../utils/files/fetchFileMetadata";
import { FileMetadata } from "../../../types/FileTypes";
import { FileImageView } from "./pdf/FileImageView";
import Loader from "../../../utils/elements/Loader";
import { Grid, Typography } from "@material-ui/core";
import { DocxFilesView } from "./docx/DocxFilesView";
import {fileURLToPath} from "url";

const useStyles = makeStyles(() => ({
  projectFilesRoot: {},
}));

export const ProjectFilesPage = () => {
  const history = useHistory();
  const classes = useStyles();
  const { t } = useTranslation();
  const url = history.location.pathname.split("/");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileMeta, setFileMeta] = useState<FileMetadata>();
  const fileTypesArray = ["png", "jpeg", "jpg", "gif", "pdf"];




  useEffect(() => {
    setIsLoading(true);
    fetchFileMetadata(url[2])
      .then((r) => {
        setFileMeta(r);
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
      });
  }, [setIsLoading]);

  const calcFileType = () => {
    console.log(fileMeta)
    if (fileMeta?.name) {
      const splitedName = fileMeta?.name.split(".");
      if (splitedName.length > 1) {
        return splitedName[splitedName.length - 1];
      }
    }
  };

  const renderRouter = () => {
    const fileType = calcFileType();
    if (fileTypesArray.includes(fileType?.toLowerCase() || "")) {
      return (
        <FileImageView
          fileUid={url[2]}
          fileName={fileMeta?.name}
          fileUri={url[3] === 'version' ? `${fileMeta?.uri}?version_id=${url[4]}` : fileMeta?.uri}
          fileType={fileType}
          fileData={fileMeta?.data}
        />
      );
    }
    if (fileType === "docx") {
      return (
        <DocxFilesView filePath={fileMeta?.uri} fileName={fileMeta?.name} />
      );
    } else {
      return (
        <Grid
          container
          justifyContent="center"
          alignContent="center"
          alignItems="center"
        >
          <Typography
            style={{ paddingTop: "20%" }}
            variant="h3"
            color="textSecondary"
          >
            {fileType} is not supported
          </Typography>
        </Grid>
      );
    }
  };

  if (isLoading)
    return (
      <div>
        <Loader title={t("project-files-page.fetch-file-loader")} />
      </div>
    );

  return <div className={classes.projectFilesRoot}>{renderRouter()}</div>;
};

import React, { Component, useEffect } from "react";
import mammoth from "mammoth";

import Loader from "../../../../utils/elements/Loader";
import { Grid, Paper, Typography } from "@material-ui/core";
import { getAuthUserToken } from "../../../../utils/auth/getAuthUserToken";

interface IdocxFilesView {
  filePath: string | undefined | null;
  fileName: string | undefined | null;
}

export const DocxFilesView: React.FC<IdocxFilesView> = ({
  filePath,
  fileName,
}) => {
  useEffect(() => {
    let token = getAuthUserToken();

    const jsonFile = new XMLHttpRequest();

    jsonFile.open("GET", filePath || "", true);
    jsonFile.setRequestHeader("Authorization", `Bearer ${token}`);
    jsonFile.send();
    jsonFile.responseType = "arraybuffer";
    jsonFile.onreadystatechange = () => {
      if (jsonFile.readyState === 4 && jsonFile.status === 200) {
        mammoth
          .convertToHtml(
            { arrayBuffer: jsonFile.response },
            { includeDefaultStyleMap: true }
          )
          .then((result) => {
            const docEl = document.createElement("div");
            docEl.className = "document-container";
            docEl.innerHTML = result.value;
            // @ts-ignore
            document.getElementById("docx").innerHTML = docEl.outerHTML;
          })
          .catch((e) => e);
      }
    };
  }, []);

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      xs={12}
    >
      <Grid item xs={10}>
        <Paper style={{ padding: 20, borderRadius: 25 }}>
          <Typography align="center" component="p" variant="h6" color="primary">
            {fileName}
          </Typography>
          <div id="docx" />
        </Paper>
      </Grid>
    </Grid>
  );
};

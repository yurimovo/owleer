import { Box, Button, Grid, Input, Paper, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Loader from "../../utils/elements/Loader";
import { createOrganization } from "../../utils/organizations/createOrganization";
import { uploadImage } from "../../utils/uploadImage";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { useTranslation } from "react-i18next";

export default function CreateOrganization() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [organizationName, setOrganizationName] = useState<string>("");
  const { t, i18n } = useTranslation();
  const [creatingOrganization, setCreatingOrganization] =
    useState<boolean>(false);
  const history = useHistory();

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setUploadingFile(true);
      uploadImage(event?.target?.files[0])
        .then((response) => {
          setFileUrl(response.file_uri);
        })
        .catch((e) => {})
        .finally(() => {
          setUploadingFile(false);
        });
    }
  };

  return (
    <div>
      {creatingOrganization ? (
        <Loader />
      ) : (
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          flexDirection="column"
          padding="25px"
        >
          <h1>{t("create-organization.header")}</h1>
          <Grid
            spacing={2}
            container
            style={{ width: "300px" }}
            alignContent="center"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <input
                accept="image/*"
                id="upload-company-logo"
                type="file"
                hidden
                onChange={changeHandler}
              />
              <label htmlFor="upload-company-logo">
                {uploadingFile ? <Loader /> : null}
                <Button component="span">
                  {fileUrl ? (
                    <img
                      style={{ width: "300px", height: "300px" }}
                      src={fileUrl}
                    />
                  ) : (
                    <AddAPhotoIcon
                      style={{ width: "250px", height: "250px" }}
                    />
                  )}
                </Button>
              </label>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t("create-organization.organization-name")}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                style={{ padding: "5px" }}
                onClick={() => {
                  setCreatingOrganization(true);
                  createOrganization({
                    name: organizationName,
                    image_url: fileUrl,
                    members_emails: [],
                  }).finally(() => {
                    setCreatingOrganization(false);
                    history.push("/organizations");
                  });
                }}
                variant="contained"
                color="primary"
                fullWidth
                disabled={!organizationName}
              >
                {t("create-organization.create-button")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
}

import React, {useState} from 'react';
import {Box, Button, Grid, TextField} from "@material-ui/core";
import Loader from "../../utils/elements/Loader";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import {createOrganization} from "../../utils/organizations/createOrganization";
import {useTranslation} from "react-i18next";
import {uploadImage} from "../../utils/uploadImage";
import { useHistory } from "react-router-dom";

const CreateOrganizationDialog = () => {

    const { t, i18n } = useTranslation();
    const history = useHistory();

    const [open, setOpen] = useState<boolean>(false);
    const [creatingOrganization, setCreatingOrganization] =
        useState<boolean>(false);
    const [uploadingFile, setUploadingFile] = useState<boolean>(false);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [organizationName, setOrganizationName] = useState<string>("");

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

    const handleClose = () => {
        setOpen(false);
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
                        <Grid
                            item xs={12}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
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
                                            style={{ width: "150px", height: "150px" }}
                                            src={fileUrl}
                                        />
                                    ) : (
                                        <AddAPhotoIcon
                                            style={{ width: "150px", height: "150px" }}
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
                                        handleClose();
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
};

export default CreateOrganizationDialog;
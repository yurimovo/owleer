import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {Box, Button, Divider, Grid, List, TextField,
        Dialog, DialogContent, Fade} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { fetchUserOrganizationsActionSuccess } from "../../actions/actions";
import Loader from "../../utils/elements/Loader";
import { fetchUserOrganization } from "../../utils/organizations/fetchUserOrganizations";
import { Organization } from "../../types/OrganizationTypes";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import { OrganizationOnList } from "./OrganizationOnList";
import { deleteOrganization } from "../../utils/organizations/deleteOrganization";
import { useHistory } from "react-router-dom";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import {createOrganization} from "../../utils/organizations/createOrganization";
import {uploadImage} from "../../utils/uploadImage";


const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed",
  },
  rootOrganization: {
    display: "flex",
    paddingLeft: "5%",
    paddingRight: "5%",
    paddingTop: "1%",
  },
  cardBlock: {
    display: "flex",
    flexWrap: "wrap",
    alignContent: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  grid: {
    paddingTop: "40px"
  }
}));

export default function Organizations() {
  type rootState = any;
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const organizations = useSelector(
    (state: rootState) => state.user.organizations
  );
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [creatingOrganization, setCreatingOrganization] =
      useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");

  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      const organizations = await fetchUserOrganization();
      dispatch(fetchUserOrganizationsActionSuccess(organizations));
      setIsLoadingOrganizations(false);
    } catch (e) {
      setIsLoadingOrganizations(false);
    }
  };

  useEffect(() => {
    fetchOrganizations().then((r) => r);
  }, []);

  const handleDeleteOrganization = (orgUid: string) => {
    deleteOrganization(orgUid).then(() => {
      fetchOrganizations().then((r) => r);
    });
  };

  if (isLoadingOrganizations)
    return <Loader title={t("organizations.loader-label")} />;

  const handleClose = () => {
    setOpen(false);
    fetchOrganizations().then((r) => r);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

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
    <Grid container>
      <Grid item xs={12}>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GroupAddIcon />}
            style={{ margin: "10px", position: "fixed", zIndex: 100 }}
            onClick={handleClickOpen}
          >
            {t("organizations.create-organization-btn")}
          </Button>
          <Divider />
        </div>
      </Grid>
      <Grid item xs={12} className={classes.grid}>
        <List>
          {(organizations || []).map((organization: Organization) => (
            <div>
              <OrganizationOnList
                key={organization.uid}
                organization={organization}
                handleDeleteOrganization={handleDeleteOrganization}
              />
              <Divider />
            </div>
          ))}
        </List>
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Fade in={open}>
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
          </Fade>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

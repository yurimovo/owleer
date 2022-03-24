import React, { useState } from "react";
import { StartProject } from "../../../../../types/ProjectTypes";
import {
  Box,
  Button,
  createStyles, Dialog, DialogContent, Fade,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { useTranslation } from "react-i18next";
import { OrganizationInSearchList } from "../../../../../types/OrganizationTypes";
import { Autocomplete } from "@material-ui/lab";
import { CountiresList } from "./CountriesList";
import { searchCompanies } from "../../../../../utils/companies/searchCompanies";
import { Search } from "@material-ui/icons";

import orgImage from "../../../../../pages/organizations/resources/orgImage.svg";
import { useHistory } from "react-router-dom";
import Loader from "../../../../../utils/elements/Loader";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import {createOrganization} from "../../../../../utils/organizations/createOrganization";
import {uploadImage} from "../../../../../utils/uploadImage";

const useStyles = makeStyles(() =>
  createStyles({
    textField: {
      padding: "10px",
    },
  })
);

interface handleDataProjectFormProps {
  setProjectData: React.Dispatch<React.SetStateAction<StartProject>>;
  projectData: StartProject;
}

export const ProjectInfoForm: React.FC<handleDataProjectFormProps> = ({
  setProjectData,
  projectData,
}) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [searchedOrganizations, setSearchedOrganizations] = useState<
    Array<OrganizationInSearchList>
  >([]);

  const [open, setOpen] = useState<boolean>(false);
  const [creatingOrganization, setCreatingOrganization] =
      useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");

  const history = useHistory();

  const onFieldChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    let updateData = projectData as StartProject;

    updateData = {
      ...projectData,
      ...{ [e.target.name]: e.target.value },
    } as StartProject;

    setProjectData(updateData);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  }

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
    <form>
      <Grid container>
        <Grid item xs={10}>
          <Autocomplete
            noOptionsText={null}
            popupIcon={<Search />}
            renderOption={(option: OrganizationInSearchList) => {
              return (
                <div>
                  <IconButton>
                    <img
                      style={{ width: "50px", height: "50px" }}
                      src={option.image_url || orgImage}
                    />
                  </IconButton>
                  {option.name}
                </div>
              );
            }}
            renderInput={(params) => (
              <TextField
                required
                onChange={(e) => {
                  searchCompanies(e.target.value).then((companies) => {
                    setSearchedOrganizations(companies);
                  });
                }}
                variant="outlined"
                className={classes.textField}
                label={t("project-info-step.text-field.initiator-company")}
                {...params}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment variant="filled" position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            options={searchedOrganizations}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.name
            }
            onChange={(
              event: any,
              newValue: OrganizationInSearchList | null
            ) => {
              if (newValue) {
                const newProjectData = {
                  ...projectData,
                  ...{ initiatorCompany: newValue },
                };
                setProjectData(newProjectData);
              }
            }}
            value={projectData.initiatorCompany}
          />
        </Grid>
        <Grid item xs={2}>
          <Tooltip title="Add new organization.">
            <Button
              fullWidth
              color="primary"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleClickOpen}
            >
              {t("project-info-step.add-new-button")}
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            className={classes.textField}
            placeholder={t("project-info-step.text-field.name")}
            label={t("project-info-step.text-field.name")}
            value={projectData.name}
            variant="outlined"
            fullWidth={true}
            name={"name"}
            onChange={onFieldChanged}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            autoSelect
            renderInput={(params) => (
              <TextField
                required
                variant="outlined"
                className={classes.textField}
                {...params}
                label={t("project-info-step.text-field.country")}
              />
            )}
            {...CountiresList}
            options={CountiresList}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option
            }
            onChange={(event: any, newValue: string | null) => {
              if (newValue) {
                const newProjectData = {
                  ...projectData,
                  ...{ country: newValue },
                };
                setProjectData(newProjectData);
              }
            }}
            value={projectData.country}
          />
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
    </form>
  );
};

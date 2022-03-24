import { Button, Divider, Grid, Tooltip, Typography } from "@material-ui/core";
import { UserProjectsPerOrgItem } from "../../../types/ProjectTypes";
import CompanyTable from "./CompanyTable";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import { useTranslation } from "react-i18next";
import CreateProjectModal from "../create_modal/CreateProjectModal";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";

interface IprojectView {
  projects: Array<UserProjectsPerOrgItem>;
}

const ProjectsView: React.FC<IprojectView> = ({ projects }) => {
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const userData = useSelector((state: State) => state.user.userData);
  const { t, i18n } = useTranslation();

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LibraryAddIcon />}
              style={{ margin: "10px" }}
              onClick={() => setOpenCreateModal(true)}
            >
              {t("project-view.create-project-btn")}
            </Button>
            {/* <Tooltip title={`${t("project-view.label-btn")}`}>
              <HelpOutlineIcon color="primary" />
            </Tooltip> */}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Divider />
          {Object.entries(projects).map(([companyUID, companyProjects]) => {
            return (
              <div key={companyUID}>
                {companyProjects.company_image_url ? (
                  <div style={{ textAlign: "center", margin: "10px" }}>
                    <img
                      alt={companyProjects.company_name}
                      src={companyProjects.company_image_url}
                      style={{ maxHeight: "90px", maxWidth: "90px" }}
                    />
                  </div>
                ) : null}
                <div>
                  <Typography
                    color="secondary"
                    variant="h6"
                    style={{ textAlign: "center", margin: "5px" }}
                  >
                    {companyProjects.company_name}
                  </Typography>
                </div>
                <div>
                  <CompanyTable projects={companyProjects.projects} />
                </div>
              </div>
            );
          })}
        </Grid>
      </Grid>
      <CreateProjectModal open={openCreateModal} setOpen={setOpenCreateModal} />
    </div>
  );
};

export default ProjectsView;

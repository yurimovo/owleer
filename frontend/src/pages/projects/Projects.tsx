import { useEffect, useState } from "react";
import { UserProjectsPerOrgItem } from "../../types/ProjectTypes";
import Loader from "../../utils/elements/Loader";
import { useTranslation } from "react-i18next";
import { fetchUserProjects } from "../../utils/projects/fetchUserProjects";
import ProjectsView from "./view/ProjectsView";
import EmptyProjectsView from "./EmptyProjectsView";
import { useDispatch, useSelector } from "react-redux";
import { fetchUseProjectsActionSuccess } from "../../actions/actions";
import { State } from "../../types/ReducerTypes";

export default function Projects() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const projects = useSelector((state: State) => state.user.projects);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    fetchUserProjects()
      .then((projects: Array<UserProjectsPerOrgItem>) => {
        dispatch(fetchUseProjectsActionSuccess(projects));
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <div>
        <Loader title={t("projects.projects-loader")} />
      </div>
    );

  return <ProjectsView projects={projects} />;
}

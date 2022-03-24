import { CreateProjectData } from "../../../../../types/ProjectTypes";
import { useTranslation } from "react-i18next";
import { GroupFieldsManagement } from "./fields_management/GroupFieldsManagement";
import React from "react";

interface IparticipantsStep {
  setProjectData: React.Dispatch<React.SetStateAction<CreateProjectData>>;
  projectData: CreateProjectData;
}

const ParticipantsStep: React.FC<IparticipantsStep> = ({ projectData }) => {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <GroupFieldsManagement
        title={t("participants-step.management")}
        group={projectData.groups.management}
      />
      <GroupFieldsManagement
        title={t("participants-step.engineering")}
        group={projectData.groups.engineering}
      />
      <GroupFieldsManagement
        title={t("participants-step.field")}
        group={projectData.groups.field}
      />
    </div>
  );
};

export default ParticipantsStep;

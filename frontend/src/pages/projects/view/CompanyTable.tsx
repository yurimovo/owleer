import { Project } from "../../../types/ProjectTypes";
import ProjectsTable from "./ProjectsTable";
import React from "react";

interface IcompanyTable {
  projects: Array<Project>;
}

const CompanyTable: React.FC<IcompanyTable> = ({ projects }) => {
  return <ProjectsTable projects={projects} />;
};

export default CompanyTable;

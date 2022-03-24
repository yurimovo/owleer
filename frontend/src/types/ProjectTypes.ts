// Create Project Types.
import {
  OrganizationInSearchList,
  UserInOrhanization,
} from "./OrganizationTypes";

type ProjectMeta = {
  neighbourhood: string | null | undefined;
  zip_code: string | null | undefined;
  address: string | null | undefined;
  new_files: number | null | undefined;
  days_till_deadline: number | null | undefined;
};

type CreateProjectPhase = {
  name: string;
};

export type ProjectCompanyParticipant = {
  uid: string;
  name: string;
  role: string;
};

export type ProjectUserParticipant = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: string;
};

export type ProjectParticipantsGroup = {
  companies: Array<ProjectCompanyParticipant>;
  users: Array<ProjectUserParticipant>;
};

type ProjectGroups = {
  management: ProjectParticipantsGroup;
  engineering: ProjectParticipantsGroup;
  field: ProjectParticipantsGroup;
};

export type StartProject = {
  name: string;
  country: string;
  initiatorCompany: OrganizationInSearchList;
};

export type CreateProjectData = {
  name: string;
  type: string;
  description: string;
  status: string;
  country: string;
  city: string;
  floors_above_level: number;
  floors_behind_level: number;
  site_size: number;
  groups: ProjectGroups;
  data: ProjectMeta;
  phases: Array<CreateProjectPhase>;
  initiatorCompany: OrganizationInSearchList | null | undefined;
};

type NextDeadlineDateType = {
  deadline_date: string;
  set_date_deadline: string;
};
// User Projects Types.
type FetchProjectMeta = {
  address: string;
  neighbourhood: string;
  zip_code: string;
  new_files: number;
  days_till_deadline: number;
  next_deadline_date: NextDeadlineDateType;
};

type ProjectStats = {
  new_files_count: number;
};

type OwnerCompany = {
  uid: string;
  name: string;
  image_uri: string;
};

export type Project = {
  uid: string;
  name: string;
  type: string;
  is_admin: boolean;
  subscribe: boolean;
  status: string;
  description: string;
  users: Array<UserInOrhanization>;
  data: FetchProjectMeta;
  stats: ProjectStats;
  owner_company: OwnerCompany;
};

export type UserProjectsPerOrgItem = {
  company_uid: string;
  projects: Array<Project>;
  company_name: string;
  company_image_url: string | null;
};

// Create Project Types.

type ProjectMetaData = {
  neighbourhood: string | null | undefined;
  zip_code: string | null | undefined;
  address: string | null | undefined;
  days_till_deadline: string | null | undefined;
  next_deadline_date: string | null | undefined;
};

type ProjectRoleUser = {
  email: string;
  name: string | null | undefined;
  phone: string | null | undefined;
};

type ProjectRole = {
  name: string;
  company_uid: string | null | undefined;
  users: Array<ProjectRoleUser> | null | undefined;
};

type ProjectGroup = {
  name: string;
  roles: Array<ProjectRole> | null | undefined;
};

type ProjectPhase = {
  name: string;
  data: object;
};

export type ProjectData = {
  name: string;
  type: string;
  description: string;
  country: string;
  city: string;
  floors_above_level: number;
  floors_behind_level: number;
  site_size: number;
  groups: Array<ProjectGroup> | null | undefined;
  data: ProjectMetaData | null | undefined;
  phases: Array<ProjectPhase> | null | undefined;
  owner_company_uid: string;
};

export type FilesTreeNode = {
  name: string;
  path: string;
  etag: string;
  size: string;
  file_type: string;
  size_in_bytes: number;
  last_modified: string;
  nodes: Array<FilesTreeNode>;
};

export type UpdateProjectMetaData = {
  next_deadline_date: NextDeadlineDateType;
};

export type UpdateProjectType = {
  name?: string | null | undefined;
  status?: string | null | undefined;
  data?: UpdateProjectMetaData | null | undefined;
};

// Events
export type ProjectEventInitiator = {
  uid: string;
  name: string;
  role: string;
  email: string;
};

export type ProjectEvent = {
  uid: string;
  name: string;
  type: string;
  data: object;
  initiator: ProjectEventInitiator;
  created_at: Date;
};

// Printing Agencies
export type ProjectPrintingAgency = {
  uid: string;
  name: string;
  email: string;
  works: Array<string>;
};

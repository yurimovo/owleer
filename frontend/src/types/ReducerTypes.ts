import { UserData } from "./AuthTypes";
import { Organization } from "./OrganizationTypes";
import { Project, UserProjectsPerOrgItem } from "./ProjectTypes";
import { AlertColor } from "./SnackBar";
import { CommentInList, FileIssue } from "./FileTypes";
import { Permission } from "./PermissionType";
import {UserMeetingsType} from "./integration/zoom/Meetings";

export type UserState = {
  isLogged: boolean;
  userData: UserData;
  organizations: Array<Organization>;
  organizationByUid: object;
  projects: Array<UserProjectsPerOrgItem>;
};

export type State = {
  user: UserState;
  utils: UtilsState;
  projects: {
    contextProject: Project;
    file: {
      issues: Array<FileIssue>;
      issueComments: Array<CommentInList>;
      contextIssue: FileIssue;
      openContextIssueModal: boolean;
      permissions: Array<Permission> | null;
    };
  };
  integrations: IntegrationsType
};

export type SnackBarType = {
  open: boolean;
  text: string;
  type: AlertColor;
  time: number;
};

export type UserProfileModalType = {
  uid?: string;
  name?: string | null | undefined;
  email?: string;
  phone?: string | null | undefined;
  role?: string | null | undefined;
  open?: boolean;
};

export type UtilsState = {
  snackBar: SnackBarType;
  userProfileModal: UserProfileModalType;
  url: string;
};

type IntegrationTypeZoom = {
  userData : any;
  meetingList: Array<UserMeetingsType>
}

export type IntegrationsType = {
  zoom: IntegrationTypeZoom
}

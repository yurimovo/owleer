import { createAction } from "@reduxjs/toolkit";
import { Organization } from "../types/OrganizationTypes";
import { Project, UserProjectsPerOrgItem } from "../types/ProjectTypes";
import { AlertColor } from "../types/SnackBar";
import { CommentInList, FileIssue } from "../types/FileTypes";
import { Permission } from "../types/PermissionType";
import { UserProfileModalType } from "../types/ReducerTypes";
import { UserMeetingsType } from "../types/integration/zoom/Meetings";

export const fetchLoginUserActionsSuccess = createAction(
  "FETCH_LOGIN_USER.SUCCESS",
  function prepare(userData: any) {
    return {
      payload: {
        userData,
      },
    };
  }
);
export const fetchLoginUserActionsError = createAction(
  "FETCH_LOGIN_USER.ERROR"
);

export const fetchUserActionSuccess = createAction(
  "FETCH_USER.SUCCESS",
  function prepare(userData: any) {
    return {
      payload: {
        userData,
      },
    };
  }
);
export const fetchUserActionError = createAction("FETCH_USER.ERROR");
export const signOutUserActionSuccess = createAction("SIGN_OUT_USER.SUCCESS");

export const fetchForgotPasswordActionSuccess = createAction(
  "FETCH_FORGOT_PASSWORD.SUCCESS"
);
export const fetchForgotPasswordActionError = createAction(
  "FETCH_FORGOT_PASSWORD.ERROR"
);

export const fetchRegisterUserActionSuccess = createAction(
  "FETCH_REGISTER_USER.SUCCESS"
);
export const fetchRegisterUserActionError = createAction(
  "FETCH_REGISTER_USER.ERROR"
);

export const fetchUserOrganizationsActionRequest = createAction(
  "FETCH_USER_ORGANIZATIONS_ACTION.REQUEST"
);
export const fetchUserOrganizationsActionSuccess = createAction(
  "FETCH_USER_ORGANIZATIONS_ACTION.SUCCESS",
  function prepare(organizationsList: Array<Organization>) {
    return {
      payload: {
        organizationsList,
      },
    };
  }
);

export const fetchUserProjectsActionRequest = createAction(
  "FETCH_USER_PROJECTS_ACTION.REQUEST"
);
export const fetchUseProjectsActionSuccess = createAction(
  "FETCH_USER_PROJECTS_ACTION.SUCCESS",
  function prepare(projectsList: Array<UserProjectsPerOrgItem>) {
    return {
      payload: {
        projectsList,
      },
    };
  }
);

export const setContextProject = createAction(
  "SET_CONTEXT_PROJECT",
  function prepare(contextProject: Project) {
    return {
      payload: {
        contextProject,
      },
    };
  }
);

export const fetchOrganizationDataActionSuccess = createAction(
  "FETCH_ORGANIZATION_DATA.SUCCESS",
  function prepare(organizationData: object) {
    return {
      payload: {
        organizationData,
      },
    };
  }
);

export const setContextProjectAction = createAction(
  "SET_CONTEXT_PROJECT",
  function prepare(dataProject: Project | null) {
    return {
      payload: {
        dataProject,
      },
    };
  }
);

export const closeSnackBar = createAction("CLOSE_SNACK_BAR");

export const openSnackBar = createAction(
  "OPEN_SNACK_BAR",
  function prepare(open, text: string, type: AlertColor, time: number) {
    return {
      payload: {
        open,
        text,
        type,
        time,
      },
    };
  }
);

export const fetchIssueFileProjectAction = createAction(
  "FETCH_ISSUE_PROJECT_FILE",
  function prepare(issuesList: Array<FileIssue>) {
    return {
      payload: {
        issuesList,
      },
    };
  }
);

export const fetchFileIssueCommentsAction = createAction(
  "FETCH_FILE_ISSUE_COMMENTS",
  function prepare(issueComments: Array<CommentInList>) {
    return {
      payload: {
        issueComments,
      },
    };
  }
);

export const setContextIssueAction = createAction(
  "SET_CONTEXT_ISSUE",
  function prepare(issue: FileIssue) {
    return {
      payload: {
        issue,
      },
    };
  }
);

export const setOpenIssueModalAction = createAction(
  "SET_OPEN_ISSUE_MODAL",
  function prepare(open: boolean) {
    return {
      payload: {
        open,
      },
    };
  }
);

export const setUsersToFile = createAction(
  "SET_USERS_TO_FILE",
  function prepare(users: Array<Permission>) {
    return {
      payload: {
        users,
      },
    };
  }
);

export const openUserProfileModal = createAction(
  "OPEN_USER_PROFILE_MODAL",
  function prepare(data: UserProfileModalType) {
    return {
      payload: {
        data,
      },
    };
  }
);

export const closeUserProfileModal = createAction("CLOSE_USER_PROFILE_MODAL");

export const setWindowUrlAction = createAction(
  "SET_WINDOW_URL",
  function prepare(url: string) {
    return {
      payload: {
        url,
      },
    };
  }
);
export const fetchLoginZoomActionsSuccess = createAction(
  "FETCH_LOGIN_ZOOM.SUCCESS",
  function prepare(data: any) {
    return {
      payload: {
        data,
      },
    };
  }
);

export const fetchMeetingListActionsSuccess = createAction(
  "FETCH_MEETING_LIST.SUCCESS",
  function prepare(meetingList: Array<UserMeetingsType>) {
    return {
      payload: {
        meetingList,
      },
    };
  }
);

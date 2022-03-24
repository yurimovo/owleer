import { createReducer } from "@reduxjs/toolkit";
import {
  closeSnackBar,
  closeUserProfileModal,
  fetchFileIssueCommentsAction,
  fetchForgotPasswordActionError,
  fetchForgotPasswordActionSuccess,
  fetchIssueFileProjectAction,
  fetchLoginUserActionsError,
  fetchLoginUserActionsSuccess,
  fetchLoginZoomActionsSuccess,
  fetchMeetingListActionsSuccess,
  fetchOrganizationDataActionSuccess,
  fetchRegisterUserActionError,
  fetchRegisterUserActionSuccess,
  fetchUseProjectsActionSuccess,
  fetchUserActionError,
  fetchUserActionSuccess,
  fetchUserOrganizationsActionRequest,
  fetchUserOrganizationsActionSuccess,
  openSnackBar,
  openUserProfileModal,
  setContextIssueAction,
  setContextProjectAction,
  setOpenIssueModalAction,
  setUsersToFile,
  setWindowUrlAction,
  signOutUserActionSuccess,
} from "../actions/actions";
import { CommentInList, FileIssue } from "../types/FileTypes";
import { Project } from "../types/ProjectTypes";
import { IntegrationsType, UserState, UtilsState } from "../types/ReducerTypes";
import { Permission } from "../types/PermissionType";

interface Istate {
  user: UserState;
  utils: UtilsState;
  projects: {
    contextProject: Project | null;
    file: {
      issues: Array<FileIssue> | null;
      issueComments: Array<CommentInList> | null;
      contextIssue: FileIssue | null;
      openIssueModal: boolean;
      permissions: Array<Permission> | null;
    };
  };
  integrations: IntegrationsType;
}

const initialState = {
  user: {
    isLogged: false,
    userData: {
      name: "",
      email: "",
      phone: "",
      role: "",
      paying: false,
      data: { language: "en", company: "" },
    },
    organizations: [],
    organizationByUid: {},
    projects: [],
  },
  projects: {
    contextProject: null,
    file: {
      issues: null,
      issueComments: null,
      contextIssue: null,
      openIssueModal: false,
      permissions: null,
    },
  },
  utils: {
    snackBar: {
      open: false,
      text: "",
      type: "info",
      time: 0,
    },
    userProfileModal: {
      uid: "",
      name: "",
      email: "",
      phone: "",
      role: "",
      open: false,
    },
    url: "",
  },
  integrations: {
    zoom: {
      userData: null,
      meetingList: [],
    },
  },
} as Istate;

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchLoginUserActionsSuccess, (state, action) => {
      state.user.isLogged = true;
      state.user.userData = action.payload.userData;
    })
    .addCase(fetchLoginUserActionsError, (state) => {
      state.user.isLogged = false;
    })
    .addCase(fetchUserActionSuccess, (state, action) => {
      state.user.isLogged = true;
      state.user.userData = action.payload.userData;
    })
    .addCase(fetchUserActionError, (state) => {
      state.user.isLogged = false;
    })
    .addCase(signOutUserActionSuccess, () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return initialState;
    })
    .addCase(fetchForgotPasswordActionSuccess, () => {
      return initialState;
    })
    .addCase(fetchForgotPasswordActionError, () => {
      return initialState;
    })
    .addCase(fetchRegisterUserActionSuccess, () => {
      return initialState;
    })
    .addCase(fetchRegisterUserActionError, () => {
      return initialState;
    })
    .addCase(fetchUserOrganizationsActionRequest, (state) => {})
    .addCase(fetchUserOrganizationsActionSuccess, (state, action) => {
      state.user.organizations = action.payload.organizationsList;
    })
    .addCase(fetchUseProjectsActionSuccess, (state, action) => {
      // @ts-ignore
      state.user.projects = action.payload.projectsList;
    })
    .addCase(fetchOrganizationDataActionSuccess, (state, action) => {
      state.user.organizationByUid = action.payload.organizationData;
    })
    .addCase(openSnackBar, (state, action) => {
      state.utils.snackBar.open = action.payload.open;
      state.utils.snackBar.text = action.payload.text;
      state.utils.snackBar.type = action.payload.type;
      state.utils.snackBar.time = action.payload.time;
    })
    .addCase(closeSnackBar, (state) => {
      state.utils.snackBar.open = false;
    })
    .addCase(setContextProjectAction, (state, action) => {
      state.projects.contextProject = action.payload.dataProject;
    })
    .addCase(fetchIssueFileProjectAction, (state, action) => {
      state.projects.file.issues = action.payload.issuesList;
    })
    .addCase(fetchFileIssueCommentsAction, (state, action) => {
      state.projects.file.issueComments = action.payload.issueComments;
    })
    .addCase(setContextIssueAction, (state, action) => {
      state.projects.file.contextIssue = action.payload.issue;
    })
    .addCase(setOpenIssueModalAction, (state, action) => {
      state.projects.file.openIssueModal = action.payload.open;
    })
    .addCase(setUsersToFile, (state, action) => {
      state.projects.file.permissions = action.payload.users;
    })
    .addCase(openUserProfileModal, (state, action) => {
      state.utils.userProfileModal.open = true;
      state.utils.userProfileModal.uid = action.payload.data.uid;
      state.utils.userProfileModal.name = action.payload.data.name;
      state.utils.userProfileModal.role = action.payload.data.role;
      state.utils.userProfileModal.phone = action.payload.data.phone;
      state.utils.userProfileModal.email = action.payload.data.email;
    })
    .addCase(closeUserProfileModal, (state, action) => {
      state.utils.userProfileModal.open = false;
      state.utils.userProfileModal.uid = "";
      state.utils.userProfileModal.name = "";
      state.utils.userProfileModal.role = "";
      state.utils.userProfileModal.phone = "";
      state.utils.userProfileModal.email = "";
    })
    .addCase(setWindowUrlAction, (state, action) => {
      state.utils.url = action.payload.url;
    })
    .addCase(fetchLoginZoomActionsSuccess, (state, action) => {
      state.integrations.zoom.userData = action.payload.data;
    })
    .addCase(fetchMeetingListActionsSuccess, (state, action) => {
      state.integrations.zoom.meetingList = action.payload.meetingList;
    });
});

export default reducer;

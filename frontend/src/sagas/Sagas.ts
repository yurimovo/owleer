import { call, put, takeEvery, all } from "redux-saga/effects";
import {
  fetchUseProjectsActionSuccess,
  fetchUserOrganizationsActionRequest,
  fetchUserOrganizationsActionSuccess,
  fetchUserProjectsActionRequest,
} from "../actions/actions";
import { fetchUserOrganization } from "../utils/organizations/fetchUserOrganizations";
import { fetchUserProjectWorkerTypes } from "../types/SagaTypes";
import { fetchUserProjects } from "../utils/projects/fetchUserProjects";
import { UserProjectsPerOrgItem } from "../types/ProjectTypes";

function* fetchUserOrganizationsWorker(): fetchUserProjectWorkerTypes {
  try {
    const organizationsList = yield call(fetchUserOrganization);
    yield put(fetchUserOrganizationsActionSuccess(organizationsList));
  } catch (e) {
    throw e;
  }
}

function* fetchUserProjectsWorker(): fetchUserProjectWorkerTypes {
  try {
    const projectsList: Array<UserProjectsPerOrgItem> = yield call(
      fetchUserProjects
    );
    yield put(fetchUseProjectsActionSuccess(projectsList));
  } catch (e) {
    throw e;
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(
      fetchUserOrganizationsActionRequest,
      fetchUserOrganizationsWorker
    ),
    takeEvery(fetchUserProjectsActionRequest, fetchUserProjectsWorker),
  ]);
}

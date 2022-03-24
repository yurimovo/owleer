import React, { useEffect, useState } from "react";
import "./utils/i18/i18n";
import { Redirect, Switch, Route, useLocation } from "react-router-dom";
import Loader from "./utils/elements/Loader";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "./utils/auth/fetchUserData";
import { UserData } from "./types/AuthTypes";
import {
  fetchUserActionSuccess,
  fetchUserActionError,
  fetchUseProjectsActionSuccess,
  setWindowUrlAction,
} from "./actions/actions";
import { fetchUserProjects } from "./utils/projects/fetchUserProjects";
import { UserProjectsPerOrgItem } from "./types/ProjectTypes";
import { useTranslation } from "react-i18next";
import { State } from "./types/ReducerTypes";
import { UserProfileModal } from "./utils/elements/user-profile-modal/UserProfileModal";
import { ConfirmationDialogProvider } from "./utils/elements/confirmation-dialog/ConfirmationDialog";
import { useHistory } from "react-router";
import HOCTranslateOrientationUI from "./utils/i18/HOCTranslateOrientationUI";
import { useTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@emotion/react";
import { PolicyAndTerms } from "./pages/policy-and-terms/PolicyAndTerms";

const App = () => {
  type RootState = any;
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const userData = useSelector((state: State) => state.user.userData);
  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkAuth = () => {
    setIsLoading(true);
    fetchUserData()
      .then((userData: UserData) => {
        setIsLoading(false);
        dispatch(fetchUserActionSuccess(userData));
      })
      .catch((e) => {
        setIsLoading(false);
        dispatch(fetchUserActionError());
      });
  };

  useEffect(() => {
    fetchUserProjects()
      .then((projects: Array<UserProjectsPerOrgItem>) => {
        dispatch(fetchUseProjectsActionSuccess(projects));
      })
      .catch((e) => {});
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    i18n.changeLanguage(userData?.data?.language || "en").then((r) => {
      document.body.dir = i18n.dir();
      theme.direction = i18n.dir();
    });
  }, [userData]);

  useEffect(() => {
    history.listen(() => {
      dispatch(
        setWindowUrlAction(history.location.pathname.split("/").join("-"))
      );
    });
  }, [history]);

  if (userData?.data?.language === "he") {
    document.body.dir = "rtl";
    theme.direction = "rtl";
  }

  if (!isLogged && isLoading)
    return (
      <div>
        <Loader title="Loading..." />
      </div>
    );

  return (
    <ThemeProvider theme={theme}>
      {isLogged ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </ThemeProvider>
  );
};

const AuthenticatedApp = () => {
  type RootState = any;
  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  if (!isLogged) return <Redirect to="/login" />;

  return (
    <Switch>
      <Route exact path={["/policy-and-terms"]}>
        <PolicyAndTerms />
      </Route>
      <Route path="/">
        <ConfirmationDialogProvider>
          <UserProfileModal />
          <Home />
        </ConfirmationDialogProvider>
      </Route>
    </Switch>
  );
};

const UnauthenticatedApp = () => {
  return (
    <Switch>
      <Route exact path="/signup">
        <SignUp />
      </Route>
      <Route exact path="/forgot-password">
        <ForgotPassword />
      </Route>
      <Route exact path={["/policy-and-terms"]}>
        <PolicyAndTerms />
      </Route>
      <Route path={["/", "/login"]}>
        <Login />
      </Route>
    </Switch>
  );
};
export default HOCTranslateOrientationUI(App);

import { Button, Grid, IconButton, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { createIntegration } from "../../utils/integratons/createIntegration";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLoginZoomActionsSuccess,
  fetchMeetingListActionsSuccess,
} from "../../actions/actions";
import { State } from "../../types/ReducerTypes";
import { fetchUserZoom } from "../../utils/integratons/zoom/fetchUserZoom";
import { UserInfo } from "./UserInfo";
import { ReactComponent as ZoomIcon } from "../../utils/icons/ZoomIcon.svg";
import Loader from "../../utils/elements/Loader";
import { fetchMeetingList } from "../../utils/integratons/zoom/fetchMeetingList";

import { MeetingList } from "./MeetingList";

export const ZoomIntegrationPage = () => {
  const dispatch = useDispatch();
  const urlRedirect = `https://zoom.us/oauth/authorize?response_type=code&client_id=Axjwg7PSVCBRKIeiAchg&redirect_uri=${
    window.location.protocol + "//" + window.location.host + "/integrations/zoom"
  }`;
  const [zoomCode, setZoomCode] = useState<string>("");
  const userMeetings = useSelector(
    (state: State) => state.integrations.zoom.meetingList
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const zoomUser = useSelector(
    (state: State) => state.integrations.zoom.userData
  );

  const authZoom = async () => {
    await window.location.replace(urlRedirect);
  };

  const createIntegrationZoom = () => {
    createIntegration({
      name: "zoom",
      type: "zoom",
      payload: { code: zoomCode },
    }).then((r) => {
      fetchUserZoom().then((r) => {
        dispatch(fetchLoginZoomActionsSuccess(r));
      });
    });
  };

  useEffect(() => {
    setZoomCode(window.location.href.split("code=")[1]);
  }, [window.location.href]);

  useEffect(() => {
    if (zoomCode !== "") {
      createIntegrationZoom();
    }
  }, [zoomCode]);

  useEffect(() => {
    setIsLoading(true);
    fetchUserZoom()
      .then((r) => {
        dispatch(fetchLoginZoomActionsSuccess(r));
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      })
      .catch((e) => {
        setZoomCode(window.location.href.split("code=")[1]);
      });
    fetchMeetingList()
      .then((r) => {
        dispatch(fetchMeetingListActionsSuccess(r));
      })
      .catch((e) => e);
  }, []);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      justify="center"
    >
      {isLoading ? (
        <Loader title="Connecting to ZOOM" />
      ) : (
        <>
          {zoomUser?.account_id ? (
            <Grid
              container
              xs={12}
              justifyContent="space-between"
              style={{ marginRight: 20, marginTop: 20, marginLeft: 20 }}
            >
              <Grid container xs={9}>
                <MeetingList userMeetings={userMeetings} />
              </Grid>
              <Grid container xs={3}>
                <UserInfo
                  userMeetingsTotalRecords={userMeetings.total_records}
                />
              </Grid>
            </Grid>
          ) : (
            <IconButton
              onClick={authZoom}
              style={{
                width: 250,
                borderRadius: 25,
                backgroundColor: "#2196f3",
                display: "flex",
                justifyContent: "space-evenly",
                marginTop: "20%",
              }}
            >
              <ZoomIcon style={{ height: 40, width: 40, color: "white" }} />
              <Typography style={{ color: "white", fontWeight: "bold" }}>
                Connect to ZOOM
              </Typography>
            </IconButton>
          )}
        </>
      )}
    </Grid>
  );
};

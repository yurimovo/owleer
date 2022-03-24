import { useEffect, useState } from "react";

import Loader from "../../../utils/elements/Loader";
import { Avatar, Grid, Paper, Typography } from "@material-ui/core";

import ConnectMonday from "./ConnectMonday";
import { MondayProfile } from "../../../types/integration/mondayIntegrationType";
import { fetchMondayProfile } from "../../../utils/integratons/monday/fetchMondayProfile";
import Boards from "./boards/Boards";

export default function Monday() {
  const [profile, setProfile] = useState<MondayProfile>();
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [selectedFileUrn, setSelectedFileUrn] = useState<string | undefined>();

  useEffect(() => {
    setLoadingProfile(true);
    fetchMondayProfile()
      .then((profile: MondayProfile) => {
        setProfile(profile);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  if (loadingProfile)
    return (
      <div>
        <Loader title="Loading..." />
      </div>
    );

  return profile ? (
    <div>
      <Paper
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar src={profile.photo} style={{ margin: "20px" }} />
        <Typography align="center">{profile.name}</Typography>
      </Paper>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={1}
        direction={"row"}
        style={{ padding: 10 }}
      >
        <Grid item xs={12}>
          <Boards />
        </Grid>
      </Grid>
    </div>
  ) : (
    <ConnectMonday />
  );
}

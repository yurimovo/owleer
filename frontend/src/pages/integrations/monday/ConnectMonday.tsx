import { ReactComponent as MondayIcon } from "../../../integrations/monday/resources/Monday.svg";
import { Button, Divider, Grid, Typography } from "@material-ui/core";
import ReactJoyride from "react-joyride";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ConnectMonday() {
  const { t } = useTranslation();
  const [tour, setTour] = useState({
    run: true,
    steps: [
      {
        content: <h2>{t("connect-monday.step-0.content")}</h2>,
        placement: "center",
        target: ".start-tour",
      },
      {
        content: (
          <div>
            <Typography color="primary" variant="h5">
              {t("connect-monday.step-1.tittle")}
            </Typography>
            <Divider />
            {t("connect-monday.step-1.content")}
          </div>
        ),
        target: ".install-btn",
      },
      {
        content: (
          <div>
            <Typography color="primary" variant="h5">
              {t("connect-monday.step-2.tittle")}
            </Typography>
            <Divider />
            {t("connect-monday.step-2.content")}
          </div>
        ),
        target: ".connect-btn",
      },
    ],
  });

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ paddingTop: "20%" }}
      direction="column"
      spacing={3}
    >
      <Grid item className="start-tour">
        <img
          onClick={() =>
            window.open(
              "https://auth.monday.com/oauth2/authorize?client_id=0e6997836cb843ffee277f3a9fbde2b9&response_type=install"
            )
          }
          className="install-btn"
          alt="Add to monday.com"
          height="42"
          src="https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/uploads/Tal/4b5d9548-0598-436e-a5b6-9bc5f29ee1d9_Group12441.png"
        />
      </Grid>
      <Grid item>
        <Button
          className="connect-btn"
          variant={"contained"}
          startIcon={<MondayIcon />}
          href={`https://auth.monday.com/oauth2/authorize?client_id=0e6997836cb843ffee277f3a9fbde2b9`}
        >
          Connect To monday.com
        </Button>
      </Grid>
      <ReactJoyride
        run={tour.run}
        steps={tour.steps}
        continuous={true}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
    </Grid>
  );
}

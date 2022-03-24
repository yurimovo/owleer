import { createStyles, Grid, makeStyles, Paper } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { useTranslation } from "react-i18next";
import FormLabel from "@material-ui/core/FormLabel";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../types/ReducerTypes";
import { upsertUser } from "../../utils/auth/upsertUser";
import { fetchUserData } from "../../utils/auth/fetchUserData";
import { UserData } from "../../types/AuthTypes";
import {
  fetchUserActionError,
  fetchUserActionSuccess,
} from "../../actions/actions";
import i18n from "i18next";
import {useTheme} from "@material-ui/core/styles";
import {useLocation} from "react-router-dom";

const useStyles = makeStyles(() =>
  createStyles({
    rootGrid: {
      marginTop: "2%",
    },
    rootPaper: {
      padding: "20px",
    },
  })
);

export default function Settings() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
    const theme = useTheme();
    const location = useLocation();

    const user = useSelector((state: State) => state.user.userData);
  const [language, setLanguage] = useState(user?.data?.language);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage((event.target as HTMLInputElement).value);
    upsertUser(user.name, user.email, user.phone, user.role, {
      language: (event.target as HTMLInputElement).value,
    })
      .then((r) => {
        i18n.changeLanguage((event.target as HTMLInputElement).value).then(r => {
          fetchUserData()
              .then((userData: UserData) => {
                dispatch(fetchUserActionSuccess(userData));
              })
              .catch((e) => {
                dispatch(fetchUserActionError());
              });
        })
            .catch((e) => e);
        });
    window.location.reload();
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      className={classes.rootGrid}
    >
      <Paper className={classes.rootPaper}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t("settings.form-label")}</FormLabel>
          <RadioGroup
            aria-label="language"
            name="language"
            value={language}
            onChange={handleChange}
          >
            <FormControlLabel
              value="en"
              control={<Radio color="primary" />}
              label="English"
            />
            <FormControlLabel
              value="he"
              control={<Radio color="primary" />}
              label="עברית"
            />
            <FormControlLabel
              value="ru"
              control={<Radio color="primary" />}
              label="Русский"
            />
          </RadioGroup>
        </FormControl>
      </Paper>
    </Grid>
  );
}

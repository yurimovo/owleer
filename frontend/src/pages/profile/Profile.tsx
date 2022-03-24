import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { State } from "../../types/ReducerTypes";
import { Close, Edit, Save } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { upsertUser } from "../../utils/auth/upsertUser";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { validateEmptyField } from "../../utils/validateFields/validateFields";
import Loader from "../../utils/elements/Loader";
import { fetchUserData } from "../../utils/auth/fetchUserData";
import { UserData } from "../../types/AuthTypes";
import {
  fetchUserActionError,
  fetchUserActionSuccess,
} from "../../actions/actions";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textFields: {
      width: "250px",
      padding: 10,
    },
    buttonsEdit: {
      display: "flex",
      padding: 10,
      "& Button": {
        marginLeft: 5,
        marginRight: 5,
        width: 150,
      },
    },
    buttonEdit: {
      width: 150,
      margin: 10,
    },
    rootGrid: {
      marginTop: "2%",
    },
    rootPaper: {
      padding: 20,
    },
  })
);

export default function Profile() {
  const userData = useSelector((state: State) => state.user.userData);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { alertAction } = useSnackBar();
  const [editFields, setEditFields] = useState(false);
  const [disabledSaveButton, setDisabledSaveButton] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [newValueFields, setNewValueField] = useState({
    name: userData.name,
    nameError: false,
    nameErrorText: "",
    email: userData.email,
    emailError: false,
    emailErrorText: "",
    phone: userData.phone,
    phoneError: false,
    phoneErrorText: "",
    role: userData.role,
    roleError: false,
    roleErrorText: "",
  });

  const handleEditField = (e: any) => {
    switch (e.target.id) {
      case "name":
        if (validateEmptyField(e.target.value)) {
          setNewValueField({
            ...newValueFields,
            name: e.target.value,
            nameError: false,
            nameErrorText: "",
          });
        } else {
          setNewValueField({
            ...newValueFields,
            name: e.target.value,
            nameError: true,
            nameErrorText: t("profile.text-field.name.error-text"),
          });
        }
        break;

      case "email":
        setNewValueField({
          ...newValueFields,
          email: e.target.value,
        });
        break;

      case "phone":
        if (validateEmptyField(e.target.value)) {
          setNewValueField({
            ...newValueFields,
            phone: e.target.value,
            phoneError: false,
            phoneErrorText: "",
          });
        } else {
          setNewValueField({
            ...newValueFields,
            phone: e.target.value,
            phoneError: true,
            phoneErrorText: t("profile.text-field.phone.error-text"),
          });
        }
        break;

      case "role":
        if (validateEmptyField(e.target.value)) {
          setNewValueField({
            ...newValueFields,
            role: e.target.value,
            roleError: false,
            roleErrorText: "",
          });
        } else {
          setNewValueField({
            ...newValueFields,
            role: e.target.value,
            roleError: true,
            roleErrorText: t("profile.text-field.role.error-text"),
          });
        }
        break;

      default:
        setNewValueField({
          ...newValueFields,
          role: e.target.value.trim(),
        });
    }
  };

  const handleCancelButton = () => {
    setNewValueField({
      name: userData.name,
      nameError: false,
      nameErrorText: "",
      email: userData.email,
      emailError: false,
      emailErrorText: "",
      phone: userData.phone,
      phoneError: false,
      phoneErrorText: "",
      role: userData.role,
      roleError: false,
      roleErrorText: "",
    });
    setEditFields(false);
  };

  const handlerSave = () => {
    setDisabledSaveButton(true);
    setIsLoadingSave(true);
    upsertUser(
      newValueFields.name,
      newValueFields.email,
      newValueFields.phone,
      newValueFields.role
    )
      .then((r) => {
        setEditFields(false);
        setIsLoadingSave(false);
        setDisabledSaveButton(false);
        fetchUserData()
          .then((userData: UserData) => {
            dispatch(fetchUserActionSuccess(userData));
          })
          .catch((e) => {
            dispatch(fetchUserActionError());
          });
        alertAction.success(t("profile.alert.success"));
      })
      .catch((e) => {
        setIsLoadingSave(false);
        setDisabledSaveButton(false);
        alertAction.error(e);
      });
  };

  useEffect(() => {
    if (
      !newValueFields.nameError &&
      !newValueFields.emailError &&
      !newValueFields.phoneError &&
      !newValueFields.roleError
    ) {
      setDisabledSaveButton(false);
    } else {
      setDisabledSaveButton(true);
    }
  });

  return (
    <Grid
      className={classes.rootGrid}
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      xs={12}
    >
      <Grid item xs spacing={3}>
        <Paper className={classes.rootPaper}>
          <table>
            <tr>
              <td>
                <Typography>{t("profile.text-field.name.label")}</Typography>
              </td>
              <td>
                <TextField
                  variant="outlined"
                  id="name"
                  fullWidth
                  className={classes.textFields}
                  onChange={(e) => handleEditField(e)}
                  disabled={!editFields}
                  value={newValueFields.name}
                  placeholder={t("profile.text-field.name.label")}
                  error={newValueFields.nameError}
                  helperText={newValueFields.nameErrorText}
                />
              </td>
            </tr>

            <tr>
              <td>
                <Typography>E-mail:</Typography>
              </td>
              <td>
                <TextField
                  variant="outlined"
                  className={classes.textFields}
                  id="email"
                  onChange={(e) => handleEditField(e)}
                  disabled
                  value={newValueFields.email}
                  placeholder={"Email"}
                />
              </td>
            </tr>

            <tr>
              <td>
                <Typography>{t("profile.text-field.phone.label")}</Typography>
              </td>
              <td>
                <TextField
                  variant="outlined"
                  id="phone"
                  className={classes.textFields}
                  error={newValueFields.phoneError}
                  helperText={newValueFields.phoneErrorText}
                  onChange={(e) => handleEditField(e)}
                  disabled={!editFields}
                  value={newValueFields.phone}
                  placeholder={t("profile.text-field.phone.label")}
                />
              </td>
            </tr>

            <tr>
              <td>
                <Typography>{t("profile.text-field.role.label")}</Typography>
              </td>
              <td>
                <TextField
                  variant="outlined"
                  id="role"
                  className={classes.textFields}
                  onChange={(e) => handleEditField(e)}
                  disabled={!editFields}
                  value={newValueFields.role}
                  placeholder={t("profile.text-field.role.label")}
                  error={newValueFields.roleError}
                  helperText={newValueFields.roleErrorText}
                />
              </td>
            </tr>
          </table>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            item
          >
            {editFields ? (
              <div className={classes.buttonsEdit}>
                <Button
                  variant="contained"
                  onClick={handlerSave}
                  color="primary"
                  disabled={disabledSaveButton}
                  startIcon={isLoadingSave ? <Loader /> : <Save />}
                >
                  {isLoadingSave ? null : t("profile.btn.save")}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCancelButton}
                  color="primary"
                  endIcon={<Close />}
                >
                  {t("profile.btn.cancel")}
                </Button>
              </div>
            ) : (
              <Button
                className={classes.buttonEdit}
                variant="contained"
                onClick={() => setEditFields(true)}
                color="primary"
                startIcon={<Edit />}
              >
                {t("profile.btn.edit")}
              </Button>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { fetchOrganizationDataActionSuccess } from "../../actions/actions";
import { fetchOrganizationByUid } from "../../utils/organizations/fetchOrganizationByUid";
import { OrganizationInfoUserData } from "./organization_member/OrganizationInfoUserData";
import Loader from "../../utils/elements/Loader";
import { OrganizationAddUser } from "./organization_member/OrganizationAddUser";

const useStyles = makeStyles(() => ({
  addButton: {
    float: "right",
    marginRight: "2.5%",
    cursor: "pointer",
  },
  root: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    marginRight: "15%",
    marginLeft: "15%",
    marginTop: "3%",
    border: "1px #e9e8e8 solid",
  },
  label: {
    textAlign: "center",
    fontSize: "24px",
    color: "#3f51b5",
  },
}));

export const OrganizationInfoPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const organizationByUid = useSelector(
    (state: any) => state.user.organizationByUid
  );
  const [isLoadingOrganizationData, setIsLoadingOrganizationData] =
    useState(false);
  const url = history.location.pathname.split("/");
  const { users } = organizationByUid;

  const getDataOrganization = async () => {
    setIsLoadingOrganizationData(true);
    const organizationData = await fetchOrganizationByUid(url[2]);
    dispatch(fetchOrganizationDataActionSuccess(organizationData));
    setIsLoadingOrganizationData(false);
  };

  useEffect(() => {
    getDataOrganization()
      .then((r) => r)
      .catch((e) => e);
  }, []);

  if (isLoadingOrganizationData)
    return <Loader title="Loading organization info..." />;
  return (
    <div className={classes.root}>
      <p className={classes.label}>{organizationByUid.name}</p>
      <div>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("organization-info-page.table.name")}</TableCell>
              <TableCell>{t("organization-info-page.table.role")}</TableCell>
              <TableCell>{t("organization-info-page.table.email")}</TableCell>
              <TableCell>{t("organization-info-page.table.phone")}</TableCell>
              <TableCell align="right">
                {t("organization-info-page.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user: any) => {
              return (
                <OrganizationInfoUserData
                  key={user.uid}
                  user={user}
                  url={url}
                />
              );
            })}
          </TableBody>
        </Table>
        <div className={classes.addButton}>
          <OrganizationAddUser uid={organizationByUid.uid} />
        </div>
      </div>
    </div>
  );
};

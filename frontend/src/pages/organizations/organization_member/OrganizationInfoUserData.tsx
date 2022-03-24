import * as React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import TableCell from "@material-ui/core/TableCell";
import { Button } from "@material-ui/core";
import Loader from "../../../utils/elements/Loader";
import TableRow from "@material-ui/core/TableRow";
import { deleteMemberOrganization } from "../../../utils/organizations/deleteMemberOrganization";
import { fetchOrganizationByUid } from "../../../utils/organizations/fetchOrganizationByUid";
import { fetchOrganizationDataActionSuccess } from "../../../actions/actions";
import { UserInOrhanization } from "../../../types/OrganizationTypes";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";

interface OrganizationInfoUserDataProps {
  user: UserInOrhanization;
  url: Array<string>;
}

export const OrganizationInfoUserData: React.FC<OrganizationInfoUserDataProps> =
  ({ user, url }) => {
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { alertAction } = useSnackBar();

    const getDataOrganization = async () => {
      const organizationData = await fetchOrganizationByUid(url[2]);
      dispatch(fetchOrganizationDataActionSuccess(organizationData));
    };

    const handleDelete = async (uid: string, email: string) => {
      setIsLoadingDelete(true);
      await deleteMemberOrganization(uid, email).then((r) => r);
      setIsLoadingDelete(false);
      await getDataOrganization();
      alertAction.success(
        `${email} ${t("organization-info-user-data.alert.success")}`
      );
    };

    return (
      <TableRow>
        <TableCell>{user.user.name}</TableCell>
        <TableCell>{user.user.role}</TableCell>
        <TableCell>{user.user.email}</TableCell>
        <TableCell>{user.user.phone}</TableCell>
        <TableCell align="right">
          {user.is_admin ? null : (
            <Button onClick={() => handleDelete(url[2], user.user.email)}>
              {isLoadingDelete ? (
                <Loader />
              ) : (
                t("organization-info-user-data.remove-btn")
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

import * as React from "react";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { useTranslation } from "react-i18next";
import {
  Input,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Organization } from "../../types/OrganizationTypes";
import Edit from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import { Delete } from "@material-ui/icons";
import { deleteOrganization } from "../../utils/organizations/deleteOrganization";
import { updateOrganization } from "../../utils/organizations/updateOrganization";
import { useConfirmationDialog } from "../../utils/elements/confirmation-dialog/ConfirmationDialog";

interface IorganizationOnList {
  organization: Organization;
  handleDeleteOrganization: (orgUid: string) => void;
}

const useStyles = makeStyles(() => ({
  rootCard: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  infoBlock: {
    justifyContent: "center",
    textAlign: "center",
    maxWidth: "300px",
    borderTop: "1px #3f51b5 solid",
  },
  preViewBlock: {
    width: "300px",
    height: "50px",
  },
  maxHeight: {
    marginBottom: "20px",
  },
}));

export const OrganizationOnList: React.FC<IorganizationOnList> = ({
  organization,
  handleDeleteOrganization,
}) => {
  const classes = useStyles();
  const [isOnEdit, setIsOnEdit] = React.useState<boolean>(false);
  const [orgName, setOrgName] = React.useState<string>(organization.name);
  const { getConfirmation } = useConfirmationDialog();
  const { t, i18n } = useTranslation();

  const handleEditOrganization = () => {
    setIsOnEdit(true);
  };

  const handleSaveChanges = () => {
    updateOrganization(organization.uid, {
      name: orgName,
      image_url: null,
    }).finally(() => {
      setIsOnEdit(false);
    });
  };

  const handleDelete = async () => {
    const confirmed = await getConfirmation({
      title: t("organizations.organization-on-list.confirm.tittle"),
      message: `${t("organizations.organization-on-list.confirm.message")} ${
        organization?.name
      }`,
    });
    if (confirmed) {
      await handleDeleteOrganization(organization?.uid);
    }
  };

  return (
    <ListItem className={classes.maxHeight}>
      <ListItemAvatar>
        <Avatar aria-label="recipe">
          {organization.image_url ? (
            <img
              alt={organization.name}
              src={organization.image_url}
              style={{ maxHeight: "40px", maxWidth: "40px" }}
            />
          ) : (
            organization.name.charAt(0)
          )}
        </Avatar>
      </ListItemAvatar>
      {isOnEdit ? (
        <Input
          value={orgName}
          onChange={(e) => {
            setOrgName(e.target.value);
          }}
        />
      ) : (
        <ListItemText>{orgName}</ListItemText>
      )}
      <ListItemSecondaryAction>
        {!isOnEdit ? (
          <IconButton onClick={handleEditOrganization}>
            <Edit color="primary" />
          </IconButton>
        ) : (
          <IconButton onClick={handleSaveChanges}>
            <SaveIcon color="primary" />
          </IconButton>
        )}
        <IconButton onClick={handleDelete}>
          <Delete color="error" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

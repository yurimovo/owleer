import * as React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles } from "@material-ui/core/styles";
import {
  Organization,
  UserInOrhanization,
} from "../../types/OrganizationTypes";
import { useHistory } from "react-router";
import orgImage from "./resources/orgImage.svg";
import { UserInfo } from "os";

interface IorganizationCard {
  organization: Organization;
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

export const OrganizationCard: React.FC<IorganizationCard> = ({
  organization,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const path = `/organizations/${organization.uid}`;

  const createdDateOrganization = () => {
    const createdDate = new Date(organization.created_at);
    const year = createdDate.getFullYear();
    let month = createdDate.getMonth() + 1;
    let dt = createdDate.getDate();
    return (
      t("organization-card.organization-created") +
      dt +
      "-" +
      month +
      "-" +
      year
    );
  };

  return (
    <Card className={classes.maxHeight}>
      <CardHeader
        avatar={
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
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={organization.name}
        subheader={createdDateOrganization()}
      />
      <CardMedia component="img" height="130" image={orgImage} />
      <CardActions disableSpacing>
        <Button
          variant="outlined"
          size="small"
          onClick={() => history.push(path)}
        >
          {organization.is_admin
            ? t("organization-card.edit-btn")
            : t("organization-card.more-information-btn")}
        </Button>
      </CardActions>
    </Card>
  );
};

import React from "react";
import TableCell from "@material-ui/core/TableCell";
import {Button, IconButton, Link, Tooltip} from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import { FileVersion } from "../../../types/FileTypes";
import moment from "moment";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { openUserProfileModal } from "../../../actions/actions";
import { useDispatch } from "react-redux";
import { getAuthUserToken } from "../../../utils/auth/getAuthUserToken";
import {GetApp, Visibility} from "@material-ui/icons";

interface IFileOnList {
  version: FileVersion;
  uri: string;
  name: string;
    uid: string;
}
export const FileOnList: React.FC<IFileOnList> = ({ version, uri, name , uid}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <TableRow hover>
      <TableCell component="th" scope="row">
        {moment(version.created_at).format("lll")}
      </TableCell>
      <TableCell
        style={{ maxWidth: 200, wordWrap: "break-word" }}
        align="center"
      >
        {version.description}
      </TableCell>
      <TableCell
        style={{ cursor: "pointer" }}
        align="center"
        onClick={() => dispatch(openUserProfileModal(version.user))}
      >
        {version.user.name} - {version.user.role}
      </TableCell>
      <TableCell align="right">
        <Tooltip
          title={`${t("file-on-list.tooltip-download")}`}
          placement="right-end"
        >
          <Link
            component="a"
            variant="body2"
            href={
              uri +
              `/download?token=${getAuthUserToken()}&version_id=${
                version.external_id
              }`
            }
            download={name}
          >
            <IconButton color="primary">
              <GetApp fontSize="medium" />
            </IconButton>
          </Link>
        </Tooltip>
          <IconButton onClick={() => {
              history.push(`/files/${uid}/version/${version.external_id}`)
          }}>
              <Visibility color="primary"/>
          </IconButton>
      </TableCell>
    </TableRow>
  );
};

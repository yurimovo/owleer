import {
  Button,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Input,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { useEffect } from "react";
import { UserInOrhanization } from "../../../types/OrganizationTypes";
import { UploadedFile } from "../../../types/FileTypes";
import { useState } from "react";
import { UserOnList } from "./UserOnList";
import { FileOnList } from "./FileOnList";
import { sendFiles } from "../../../utils/files/sendFiles";
import Loader from "../../../utils/elements/Loader";
import { useTranslation } from "react-i18next";

interface IUsersSendFileModal {
  users: Array<UserInOrhanization>;
  files: Array<UploadedFile>;
  handleClose: () => void;
}

export const UsersSendFileModal: React.FC<IUsersSendFileModal> = ({
  users,
  files,
  handleClose,
}) => {
  const [selectedUsersMails, setSelectedUsersMails] = useState<Array<string>>(
    []
  );
  const [selectedFiles, setSelectedFiles] = useState<Array<UploadedFile>>([]);
  const [isSendingFiles, setIsSendingFiles] = useState<boolean>(false);
  const [sendButtonDisabled, setSendButtonDisabled] = useState<boolean>(false);
  const [selectAllFiles, setSelectAllFiles] = useState<boolean>(false);
  const [selectAllUsers, setSelecetAllUsers] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    if (!selectedFiles.length || !selectedUsersMails.length) {
      setSendButtonDisabled(true);
    } else {
      setSendButtonDisabled(false);
    }
  }, [selectedFiles, selectedUsersMails]);

  const handleAddUserEmail = (email: string) => {
    if (!selectedUsersMails.includes(email)) {
      const arr = [...selectedUsersMails];
      arr.push(email);
      setSelectedUsersMails(arr);
    } else {
      const findIndex = selectedUsersMails.indexOf(email);
      const oldArr = [...selectedUsersMails];
      const arr = [
        ...oldArr.slice(0, findIndex),
        ...oldArr.slice(findIndex + 1),
      ];
      setSelectedUsersMails(arr);
    }
  };

  const handleAddFilesSend = (file: UploadedFile) => {
    if (!selectedFiles.includes(file)) {
      const arr = [...selectedFiles];
      arr.push(file);
      setSelectedFiles(arr);
    } else {
      const findIndex = selectedFiles.indexOf(file);
      const oldArr = [...selectedFiles];
      const arr = [
        ...oldArr.slice(0, findIndex),
        ...oldArr.slice(findIndex + 1),
      ];
      setSelectedFiles(arr);
    }
  };

  const handleSendFiles = async () => {
    setIsSendingFiles(true);
    await sendFiles({
      files: selectedFiles,
      message: message,
      emails: selectedUsersMails,
    });
    setIsSendingFiles(false);
    handleClose();
  };

  const handleSelectAllUsers = () => {
    setSelecetAllUsers(!selectAllUsers);
  };

  const handleSelectAllFiles = () => {
    setSelectAllFiles(!selectAllFiles);
  };

  const selectedAllUsers = () => {
    if (selectAllUsers) {
      const arr: React.SetStateAction<string[]> = [];
      users.map((user: UserInOrhanization) => {
        arr.push(user.user.email);
      });
      setSelectedUsersMails(arr);
    } else {
      setSelectedUsersMails([]);
    }
  };

  const selectedAllFiles = () => {
    if (selectAllFiles) {
      const arr: Array<UploadedFile> = [];
      files.map((file: any) => {
        arr.push(file);
      });
      setSelectedFiles(arr);
    } else {
      setSelectedFiles([]);
    }
  };

  useEffect(() => {
    selectedAllUsers();
  }, [selectAllUsers]);

  useEffect(() => {
    selectedAllFiles();
  }, [selectAllFiles]);

  return (
    <div>
      {isSendingFiles ? (
        <Loader title={t("files.send-files-modal.send-loader-message")} />
      ) : null}
      <div>
        <div style={{ maxHeight: 700, overflow: "auto", padding: "25px" }}>
          <Typography align="center" variant="h4" color="primary">
            {t("files.send-files-modal.header")}
          </Typography>
          <FormControl error={false} component="fieldset">
            <FormGroup>
              <FormLabel
                style={{ padding: "25px" }}
                align="center"
                component={Typography}
              >
                {t("files.send-files-modal.selected-files-instruction")}
              </FormLabel>

              <FormControlLabel
                labelPlacement="start"
                style={{ margin: 0 }}
                label={t("files.send-files-modal.select-all-files")}
                onChange={() => {}}
                control={
                  <Switch
                    onClick={handleSelectAllFiles}
                    color="primary"
                    checked={selectAllFiles}
                  />
                }
              />

              {files.map((file: UploadedFile) => {
                return (
                  <FileOnList
                    file={file}
                    handleAddFilesSend={handleAddFilesSend}
                    selectAllFiles={selectAllFiles}
                  />
                );
              })}
              <FormLabel
                style={{ padding: "25px" }}
                align="center"
                component={Typography}
              >
                {t("files.send-files-modal.selected-users-emails-instruction")}
              </FormLabel>
              <FormControlLabel
                labelPlacement="start"
                style={{ margin: 0 }}
                label={t("files.send-files-modal.select-all-users")}
                onChange={() => {}}
                control={
                  <Switch
                    onClick={handleSelectAllUsers}
                    color="primary"
                    checked={selectAllUsers}
                  />
                }
              />
              {users?.map((user: UserInOrhanization) => {
                return (
                  <UserOnList
                    user={user}
                    handleAddUserEmail={handleAddUserEmail}
                    selectAllUsers={selectAllUsers}
                    selectName={false}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </div>
        <div>
          <TextField
            multiline
            placeholder={t("files.send-files-modal.message")}
            rows="3"
            name="message"
            variant="outlined"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            fullWidth
            value={message}
          />
        </div>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("files.send-files-modal.close-button")}
          </Button>
          <Button
            disabled={sendButtonDisabled}
            onClick={handleSendFiles}
            color="primary"
            variant="contained"
          >
            {t("files.send-files-modal.send-button")}
          </Button>
        </DialogActions>
      </div>
    </div>
  );
};

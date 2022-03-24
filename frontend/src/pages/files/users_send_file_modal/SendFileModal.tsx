import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { UserOnList } from "./UserOnList";
import { UserInOrhanization } from "../../../types/OrganizationTypes";
import { sendFiles } from "../../../utils/files/sendFiles";
import { SelectedFile } from "../../../types/FileTypes";
import { TextField } from "@material-ui/core";
import Loader from "../../../utils/elements/Loader";
import { useSnackBar } from "../../../utils/elements/snackbar/useSnackBar";
import { useTranslation } from "react-i18next";

interface ISendFileModal {
  openSendFileModal: boolean;
  handleCloseSendFileModal: () => void;
  selectedSendFiles: Array<SelectedFile>;
  sendFilesMode: () => void;
}

export const SendFileModal: React.FC<ISendFileModal> = ({
  openSendFileModal,
  handleCloseSendFileModal,
  selectedSendFiles,
  sendFilesMode,
}) => {
  const { t } = useTranslation();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [selectedUsersMails, setSelectedUsersMails] = useState<Array<string>>(
    []
  );
  const [message, setMessage] = useState<string>("");
  const { alertAction } = useSnackBar();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleSendFiles = () => {
    if (selectedUsersMails.length > 0) {
      setIsLoading(true);
      sendFiles({
        files: selectedSendFiles,
        message: message,
        emails: selectedUsersMails,
      })
        .then((r) => {
          setIsLoading(false);
          handleCloseSendFileModal();
          alertAction.success(t("files.send-file-loaded-modal.alert.success"));
          setMessage("");
          sendFilesMode();
        })
        .catch((e) => {
          alertAction.error(t("files.send-file-loaded-modal.alert.error"));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      alertAction.error(
        t("files.send-file-loaded-modal.alert.validation-error")
      );
    }
  };

  const handleMessage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);
  };

  const handleCloseDialog = () => {
    handleCloseSendFileModal();
    setMessage("");
    setSelectedUsersMails([]);
  };

  return (
    <Dialog
      open={openSendFileModal}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t("files.send-file-loaded-modal.tittle-sending-file")}
      </DialogTitle>
      {isLoading ? (
        <Loader />
      ) : (
        <DialogContent>
          {contextProject?.users.map((user: UserInOrhanization) => {
            return (
              <UserOnList user={user} handleAddUserEmail={handleAddUserEmail} />
            );
          })}
          <TextField
            style={{ marginTop: 20 }}
            variant="outlined"
            onChange={handleMessage}
            fullWidth
            label={t("files.send-file-loaded-modal.message-field.label")}
            multiline
            rows={4}
            value={message}
            placeholder={t(
              "files.send-file-loaded-modal.message-field.placeholder"
            )}
          />
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          {t("files.send-file-loaded-modal.cancel-button")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSendFiles}
          color="primary"
          autoFocus
        >
          {t("files.send-file-loaded-modal.send-button")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { UserInOrhanization } from "../../../../types/OrganizationTypes";
import { State } from "../../../../types/ReducerTypes";
import Loader from "../../../../utils/elements/Loader";
import { useSnackBar } from "../../../../utils/elements/snackbar/useSnackBar";
import { sendReport } from "../../../../utils/files/file_view/pdf/sendReport";
import { UserOnList } from "../../../files/users_send_file_modal/UserOnList";

interface IgenerateReportDialog {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fileUid: string;
}

export const GenerateReportDialog: React.FC<IgenerateReportDialog> = ({
  isOpen,
  setIsOpen,
  fileUid,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [selectedUsersMails, setSelectedUsersMails] = useState<Array<string>>(
    []
  );
  const { alertAction } = useSnackBar();
  const { t, i18n } = useTranslation();

  const handleSendReport = async () => {
    setIsLoading(true);
    sendReport(fileUid, selectedUsersMails)
      .then(() => {
        alertAction.success(
          `${t(
            "pdf-files-view.generate-report-modal.success-alert"
          )} ${selectedUsersMails}.`
        );
      })
      .catch((e) => {
        alertAction.error(
          `${t(
            "pdf-files-view.generate-report-modal.error-alert"
          )} ${selectedUsersMails}.`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <DialogTitle style={{ alignContent: "center" }}>
        {t("pdf-files-view.generate-report-modal.title")}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Loader />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {contextProject?.users?.map((user: UserInOrhanization) => {
                return (
                  <UserOnList
                    user={user}
                    handleAddUserEmail={handleAddUserEmail}
                  />
                );
              })}
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={handleSendReport}
                fullWidth
                color="primary"
                variant="contained"
              >
                {t("pdf-files-view.generate-report-modal.send-report-button")}
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

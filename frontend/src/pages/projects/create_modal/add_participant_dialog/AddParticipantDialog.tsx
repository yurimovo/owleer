import React from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";

import { ProjectParticipantsGroup } from "../../../../types/ProjectTypes";
import ParticipantsTabBox from "./ParticipantsTabBox";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface IaddParticipantDialog {
  group: ProjectParticipantsGroup;
  openAddForm: boolean;
  setOpenAddForm: React.Dispatch<React.SetStateAction<boolean>>;
}
export const AddParticipantDialog: React.FC<IaddParticipantDialog> = ({
  group,
  openAddForm,
  setOpenAddForm,
}) => {
  const { t, i18n } = useTranslation();

  const handleClose = () => {
    setOpenAddForm(false);
  };

  return (
    <div>
      <Dialog
        open={openAddForm}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {"Add Participant"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            className="btn-group"
          ></DialogContentText>
          <ParticipantsTabBox {...{ setOpenAddForm, group }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("add-participant-dialog.close-btn")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

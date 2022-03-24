import React, {useState} from 'react';
import {useSelector} from "react-redux";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';

import {State} from "../../../types/ReducerTypes";
import {UserOnList} from "../../files/users_send_file_modal/UserOnList";
import {NewMeetingType, ScheduledMeetingsType} from "../../../types/integration/zoom/Meetings";
import {sendInviteLink} from "../../../utils/integratons/zoom/sendInviteLink";
import {useSnackBar} from "../../../utils/elements/snackbar/useSnackBar";
import {useTranslation} from "react-i18next";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

interface IInviteUsersModal {
    openInviteUsersModal: boolean,
    handleCloseInviteUsersModal: () => void,
    newMeetingData: ScheduledMeetingsType
}

type sendInviteType = {
    invite_link: string,
    emails: Array<string>
}


export const InviteUsersModal: React.FC<IInviteUsersModal> = ({
                                                                  openInviteUsersModal,
                                                                  handleCloseInviteUsersModal,
                                                                  newMeetingData
                                                              }) => {

    const contextProject = useSelector((state: State) => state.projects.contextProject);
    const { t } = useTranslation();
    const [selectedUsersInvite, setSelectedUserInvite] = useState<Array<string>>([]);
    const { alertAction } = useSnackBar();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClose = () => handleCloseInviteUsersModal();

    const handleSendInviteMeetingLink = () => {
        setIsLoading(true);
        sendInviteLink({invite_link: newMeetingData.join_url, emails: selectedUsersInvite})
            .then(r => {
                setIsLoading(false);
                alertAction.success(t("invite-users-modal.alert.success"));
                handleCloseInviteUsersModal();
        })
            .catch(e => {
                alertAction.error(t("invite-users-modal.alert.error"));
                setIsLoading(false);
            })
    };

    const handleAddUserEmail = (email: string) => {
        if (!selectedUsersInvite.includes(email)) {
            const arr = [...selectedUsersInvite];
            arr.push(email);
            setSelectedUserInvite(arr);
        } else {
            const findIndex = selectedUsersInvite.indexOf(email);
            const oldArr = [...selectedUsersInvite];
            const arr = [
                ...oldArr.slice(0, findIndex),
                ...oldArr.slice(findIndex + 1),
            ];
            setSelectedUserInvite(arr);
        }
    };

    return (
        <div>
            <Dialog
                open={openInviteUsersModal}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
            >
                <DialogTitle>{t("invite-users-modal.tittle")}</DialogTitle>
                <DialogContent>
                    {contextProject?.users.map((user) => {
                        return <UserOnList user={user} handleAddUserEmail={handleAddUserEmail}/>
                    })}
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isLoading}
                        onClick={handleClose}
                        color="primary">
                        {t("invite-users-modal.buttons.cancel")}
                    </Button>
                    <Button
                        disabled={isLoading || !(selectedUsersInvite.length > 0)}
                        onClick={handleSendInviteMeetingLink}
                        variant="contained"
                        color="primary">
                        {t("invite-users-modal.buttons.invite")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
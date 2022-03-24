import React, {useState} from 'react';
import {useDispatch} from "react-redux";
import {useForm} from "react-hook-form";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import {Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";

import {TimeZone} from "../../../utils/elements/timeZone";
import {createMeeting} from "../../../utils/integratons/zoom/createMeeting";
import {fetchMeetingList} from "../../../utils/integratons/zoom/fetchMeetingList";
import {fetchMeetingListActionsSuccess} from "../../../actions/actions";
import {NewMeetingType, ScheduledMeetingsType} from "../../../types/integration/zoom/Meetings";
import {InviteUsersModal} from "./InviteUsersModal";
import {useTranslation} from "react-i18next";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface ICreateMeetingModal {
    handleClickCloseCreateMeetingModal: () => void;
    openCreateMeetingModal: boolean;
}

export const CreateMeetingModal: React.FC<ICreateMeetingModal> = ({
                                                                      handleClickCloseCreateMeetingModal,
                                                                      openCreateMeetingModal,
                                                                  }) =>  {

    const {register, handleSubmit, reset, formState: { errors },} = useForm();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [typeMeeting, setTypeMeeting] = useState(2);
    const [timeZoneMeeting, setTimeZoneMeeting] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openInviteUsersModal, setOpenInviteUsersModal] = useState(false);
    const [newMeetingData, setNewMeetingData] = useState<ScheduledMeetingsType>({});

    const handleTypeMeeting = (e: any) => setTypeMeeting(e.target.value);
    const handleTimeZone = (e: any) => setTimeZoneMeeting(e.target.value);
    const handleOpenInviteUsersModal = () => setOpenInviteUsersModal(true);
    const handleCloseInviteUsersModal = () => setOpenInviteUsersModal(false);

    const onSubmit = (data: any) => {
        setIsLoading(true);
        createMeeting(
        {
            agenda: data.agenda,
            default_password: false,
            duration: data.duration,
            password: data.password,
            pre_schedule: false,
            recurrence: {
            end_date_time: "2019-08-24T14:15:22Z",
                end_times: 1,
                monthly_day: 1,
                monthly_week: -1,
                monthly_week_day: 1,
                repeat_interval: 0,
                type: 1,
                weekly_days: "1"
        },
            schedule_for: "string",
            settings: {
            additional_data_center_regions: [],
                allow_multiple_devices: true,
                alternative_hosts: "string",
                alternative_hosts_email_notification: true,
                approval_type: 0,
                approved_or_denied_countries_or_regions: {},
                audio: "both",
                authentication_domains: "string",
                authentication_exception: [],
                authentication_option: "string",
                auto_recording: "local",
                breakout_room: {},
            calendar_type: 1,
                close_registration: false,
                cn_meeting: false,
                contact_email: "string",
                contact_name: "string",
                email_notification: true,
                encryption_type: "enhanced_encryption",
                focus_mode: true,
                global_dial_in_countries: [],
                host_video: "true",
                in_meeting: false,
                jbh_time: 0,
                join_before_host: false,
                language_interpretation: {},
            meeting_authentication: true,
                meeting_invitees: [],
                mute_upon_entry: false,
                participant_video: true,
                private_meeting: true,
                registrants_confirmation_email: true,
                registrants_email_notification: true,
                registration_type: 1,
                show_share_button: true,
                use_pmi: false,
                waiting_room: true,
                watermark: false
        },
            start_time: `${data.start_time}:00`,
            template_id: "string",
            timezone: data.timezone,
            topic: data.topic,
            tracking_fields: [
            {}
        ],
            type: data.type
        }
        ).then(r => {
            console.log(r)
            setNewMeetingData(r)
            fetchMeetingList()
                .then(r => {
                    dispatch(fetchMeetingListActionsSuccess(r))
                    handleClickCloseCreateMeetingModal()
                    reset();
                    handleOpenInviteUsersModal()
                })
                .catch(e => e)
        }).finally(() => {
            setIsLoading(false);
        })
    };

    return (
        <div>
            <Dialog
                open={openCreateMeetingModal}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClickCloseCreateMeetingModal}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("create-meeting-modal.tittle")}</DialogTitle>
                <DialogContent>
                        <Grid container direction="column" xs={12}  spacing={3}>
                            <DialogContentText align="center">
                                {t("create-meeting-modal.description")}
                            </DialogContentText>
                                <Grid item>
                                    <TextField
                                        required
                                        fullWidth
                                        variant="outlined"
                                        label={t("create-meeting-modal.fields.topic")}
                                        {...register("topic", { required: true })}
                                    />
                                </Grid>
                                <Grid item>
                                        <InputLabel>{t("create-meeting-modal.fields.type.tittle")} </InputLabel>
                                        <Select
                                            required
                                            variant="outlined"
                                            fullWidth
                                            {...register("type", { required: true })}
                                            onChange={handleTypeMeeting}
                                            value={typeMeeting}
                                        >
                                            <MenuItem value={1}>{t("create-meeting-modal.fields.type.instant")}</MenuItem>
                                            <MenuItem value={2}>{t("create-meeting-modal.fields.type.scheduled")}</MenuItem>
                                        </Select>
                                </Grid>
                                    {typeMeeting === 2 &&
                                    <Grid item>
                                        <TextField
                                            fullWidth
                                            required
                                            variant="outlined"
                                            type="datetime-local"
                                            defaultValue={new Date()}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            {...register("start_time", { required: true })}
                                        />
                                        <InputLabel>{t("create-meeting-modal.fields.time-zone")}</InputLabel>
                                        <Select
                                            fullWidth
                                            required
                                            variant="outlined"
                                            {...register("timezone", { required: true })}
                                            onChange={handleTimeZone}
                                            value={timeZoneMeeting}
                                        >
                                            {TimeZone.map(zone => {
                                                return <MenuItem value={zone.id}>{zone.name}</MenuItem>
                                            })}
                                        </Select>
                                    </Grid>
                                    }
                                <Grid item>
                                    <TextField
                                        type="number"
                                        required
                                        variant="outlined"
                                        fullWidth
                                        label={t("create-meeting-modal.fields.duration")}
                                        {...register("duration", { required: true })}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        required
                                        variant="outlined"
                                        fullWidth
                                        label={t("create-meeting-modal.fields.password")}
                                        {...register("password", { required: true })}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        required
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label={t("create-meeting-modal.fields.agenda")}
                                        {...register("agenda", { required: true })}
                                    />
                                </Grid>
                        </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClickCloseCreateMeetingModal}>
                        {t("create-meeting-modal.buttons.cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        disabled={isLoading}
                        type="submit"
                        color="primary">
                        {t("create-meeting-modal.buttons.create")}
                    </Button>
                </DialogActions>
                </form>
            </Dialog>
            <InviteUsersModal
                newMeetingData={newMeetingData}
                openInviteUsersModal={openInviteUsersModal}
                handleCloseInviteUsersModal={handleCloseInviteUsersModal}
            />
        </div>
    );
}
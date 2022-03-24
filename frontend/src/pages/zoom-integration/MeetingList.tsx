import {UserMeetingsType} from "../../types/integration/zoom/Meetings";
import React, {useState} from "react";
import {
    Button,
    Divider, Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@material-ui/core";
import {deleteMeeting} from "../../utils/integratons/zoom/deleteMeeting";
import {fetchMeetingList} from "../../utils/integratons/zoom/fetchMeetingList";
import {fetchMeetingListActionsSuccess} from "../../actions/actions";
import {useDispatch} from "react-redux";
import moment from "moment";
import Loader from "../../utils/elements/Loader";
import {useConfirmationDialog} from "../../utils/elements/confirmation-dialog/ConfirmationDialog";
import i18n from "i18next";
import {useTranslation} from "react-i18next";

interface IMeetingList {
    userMeetings: UserMeetingsType
}

export const MeetingList: React.FC<IMeetingList> = ({userMeetings}) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const { getConfirmation } = useConfirmationDialog();

    const handleDeleteMeeting = async (id: number, topic: string) => {

        const confirmed = await getConfirmation({
            title: "Deleting meeting",
            message: `Remove meeting ${topic}?`,
        });
        if (confirmed) {
            setIsLoading(true);
            deleteMeeting(id).then(r => {
                fetchMeetingList()
                    .then(r => {
                        dispatch(fetchMeetingListActionsSuccess(r))
                        setIsLoading(false)
                    })
                    .catch(e => e)
            })
        }
    };

    return (
        <Grid item xs={12} component={Paper} elevation={7}>
            <Typography align="center" color="primary">{t("meeting-list.tittle")}</Typography>
            <Divider/>
            {userMeetings?.total_records !== 0 ?
                        <TableContainer>
                            {isLoading ? <Loader  contained/> : <>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{fontWeight: "bold"}} align="left">
                                                {t("meeting-list.table.topic")}
                                            </TableCell>
                                            <TableCell style={{fontWeight: "bold"}} align="center">
                                                {t("meeting-list.table.start-time")}
                                            </TableCell>
                                            <TableCell style={{fontWeight: "bold"}} align="center">
                                                {t("meeting-list.table.duration")}
                                            </TableCell>
                                            <TableCell style={{fontWeight: "bold"}} align="right"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(userMeetings?.meetings || []).map((meeting) => {
                                            return (
                                                <TableRow hover>
                                                    <TableCell align="left">{meeting?.topic}</TableCell>
                                                    <TableCell align="center">{moment(meeting?.start_time).format('llll')}</TableCell>
                                                    <TableCell align="center">{meeting?.duration}</TableCell>
                                                    <TableCell  align="right">
                                                        <Button
                                                            variant="contained"
                                                            style={{borderRadius: 25}}
                                                            color="primary"
                                                            onClick={() => window.open(meeting?.join_url)}>
                                                            {t("meeting-list.table.buttons.join")}
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            style={{borderRadius: 25, marginInlineStart: 10}}
                                                            color="primary"
                                                            onClick={() => handleDeleteMeeting(meeting.id, meeting.topic)}>
                                                            {t("meeting-list.table.buttons.delete")}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </>}
                        </TableContainer>
                        :
                        <Typography align="center" variant="h4" style={{fontWeight: "bold", color: "#bdbebd"}}>
                            {t("meeting-list.no-meetings-message")}
                        </Typography>
                    }
        </Grid>
    )
}

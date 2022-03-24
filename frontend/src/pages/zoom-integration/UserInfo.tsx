import {useSelector} from "react-redux";
import {State} from "../../types/ReducerTypes";
import {Avatar, Badge, Button, Card, CardContent, CardMedia, Grid, Paper, Typography} from "@material-ui/core";
import {AddCircle, ListAlt, Phone} from "@material-ui/icons";
import PersonIcon from "@material-ui/icons/Person";
import MailIcon from "@material-ui/icons/Mail";
import React, {useState} from "react";
import {CreateMeetingModal} from "./create-meeting/CreateMeetingModal";
import {InviteUsersModal} from "./create-meeting/InviteUsersModal";
import {useTranslation} from "react-i18next";

interface IUserInfo {
    userMeetingsTotalRecords: number
}

export const UserInfo: React.FC <IUserInfo> = ({userMeetingsTotalRecords}) => {

    const { t } = useTranslation();
    const userData = useSelector((state: State) => state.integrations.zoom.userData);
    const [openCreateMeetingModal, setOpenCreateMeetingModal] = useState(false);

    const handleClickOpenCreateMeetingModal = () => setOpenCreateMeetingModal(true);
    const handleClickCloseCreateMeetingModal = () => setOpenCreateMeetingModal(false);


    return (
        <Grid container justifyContent="center">
            <Grid item>
                <Paper  elevation={7}>
                    <Card>
                        <CardContent>
                            <CardMedia style={{ display: "flex", justifyContent: "center" }}>
                                <Avatar src={userData.pic_url || ""} style={{ width: 100, height: 100, marginBottom: 20 }}>
                                    {userData?.first_name ? userData.first_name[0] : ""}
                                </Avatar>
                            </CardMedia>
                            <Typography
                                align="center"
                                gutterBottom
                                variant="h5"
                                component="h2"
                            >
                                {userData?.first_name} {userData?.last_name}
                            </Typography>
                            {userData?.phone_number ? (
                                <Typography
                                    variant="body1"
                                    color="textSecondary"
                                    component="p"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: 10,
                                    }}
                                >
                                    <Phone color="primary" />
                                    <div style={{
                                        borderLeft: "1px solid #828282",
                                        height: "30px",
                                        marginLeft: 10,
                                        paddingRight: 10,
                                    }} />{" "}
                                    {userData?.phone_number}
                                </Typography>
                            ) : null}
                            {userData?.email ? (
                                <Typography
                                    variant="body1"
                                    color="textSecondary"
                                    component="p"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: 10,
                                    }}
                                >
                                    <MailIcon color="primary" />{" "}
                                    <div style={{
                                        borderLeft: "1px solid #828282",
                                        height: "30px",
                                        marginLeft: 10,
                                        paddingRight: 10,
                                    }} /> {userData?.email}
                                </Typography>
                            ) : null}
                            {userData?.role_name ? (
                                <Typography
                                    align="left"
                                    variant="body1"
                                    color="textSecondary"
                                    component="p"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: 10,
                                    }}
                                >
                                    <PersonIcon color="primary" />{" "}
                                    <div style={{
                                        borderLeft: "1px solid #828282",
                                        height: "30px",
                                        marginLeft: 10,
                                        paddingRight: 10,
                                    }} />{t("user-info-zoom.zoom-role")}: {userData?.role_name}
                                </Typography>
                            ) : null}
                                <Typography
                                    variant="body1"
                                    color="textSecondary"
                                    component="p"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: 10,
                                    }}
                                >
                                    <Badge color="secondary" badgeContent={userMeetingsTotalRecords || 0}>
                                        <ListAlt color="primary"/>{" "}
                                    </Badge>{" "}
                                    <div style={{
                                        borderLeft: "1px solid #828282",
                                        height: "30px",
                                        marginLeft: 11,
                                        paddingRight: 10,
                                    }} /> {t("user-info-zoom.scheduled-meetings")}
                                </Typography>
                            <Button
                                style={{borderRadius: 25}}
                                onClick={handleClickOpenCreateMeetingModal} startIcon={<AddCircle/>} color="primary" variant="contained">
                                {t("user-info-zoom.create-meeting-btn")}
                            </Button>
                        </CardContent>
                    </Card>
                </Paper>
            </Grid>
            <CreateMeetingModal
                openCreateMeetingModal={openCreateMeetingModal}
                handleClickCloseCreateMeetingModal={handleClickCloseCreateMeetingModal}
            />

        </Grid>
    )
}
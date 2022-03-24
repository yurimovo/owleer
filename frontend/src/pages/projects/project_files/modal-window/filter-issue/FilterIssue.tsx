import Backdrop from "@material-ui/core/Backdrop";
import { Divider, Fade, Typography} from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import * as React from "react";
import {useSelector} from "react-redux";
import {makeStyles} from "@material-ui/core/styles";
import {State} from "../../../../../types/ReducerTypes";
import {ChangeEvent} from "react";
import {UserOnList} from "./UserOnList";
import {useTranslation} from "react-i18next";

interface IFilterIssue {
    openFilterIssueModal: boolean,
    handleOpenFilterIssueModal: () => void,
    handleCloseFilterIssueModal: () => void,
    addEmailsOnFilter: (email:string) => void,
    emailsOnFilter: Array<string>
}

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: 25,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(1, 1, 1),
    },
}));


export const FilterIssue: React.FC<IFilterIssue> = ({openFilterIssueModal,
                                                        handleOpenFilterIssueModal,
                                                        handleCloseFilterIssueModal,
                                                        addEmailsOnFilter,
                                                        emailsOnFilter}) => {

    const contextProject = useSelector((state:State) => state.projects.contextProject)
    const classes = useStyles();
    const { t, i18n } = useTranslation();

    const handleAddEmail = (e: ChangeEvent<HTMLInputElement>) => {
        addEmailsOnFilter(e.target.value)
    }

    return(
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={openFilterIssueModal}
            onClose={handleCloseFilterIssueModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={openFilterIssueModal}>
                <div className={classes.paper}>
                        <div style={{maxHeight: 500, minWidth:300, maxWidth:450, overflow: "auto"}}>
                            <Typography align="center" color="primary">{t('issue-list.filter-issue')}</Typography>
                            {contextProject?.users.map(user => {
                                return (
                                    <>
                                        <UserOnList
                                            emailsOnFilter={emailsOnFilter}
                                            name={user.user.name}
                                            email={user.user.email}
                                            role={user.user.role}
                                            handleAddEmail={handleAddEmail}
                                        />
                                        <Divider/>
                                    </>
                                )
                            })}
                        </div>
                </div>
            </Fade>
        </Modal>
    )
}
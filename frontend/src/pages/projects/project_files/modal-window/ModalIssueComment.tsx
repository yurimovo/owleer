import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import Backdrop from "@material-ui/core/Backdrop";
import { useTranslation } from "react-i18next";
import Fade from "@material-ui/core/Fade";
import { Comment } from "./comments/Comment";
import {
  DialogContent,
  Grid,
  IconButton,
  Input,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { Cancel, Delete, Edit, Save } from "@material-ui/icons";
import AddCommentIcon from "@material-ui/icons/AddComment";
import { NewComment } from "./comments/NewComment";
import { CommentInList, FileIssue } from "../../../../types/FileTypes";
import { deleteFileIssue } from "../../../../utils/files/file_view/issues/deleteFileIssue";
import { useDispatch, useSelector } from "react-redux";
import { fetchFileIssues } from "../../../../utils/files/fetchFileIssues";
import {
  fetchFileIssueCommentsAction,
  fetchIssueFileProjectAction,
  setContextIssueAction,
} from "../../../../actions/actions";
import { useSnackBar } from "../../../../utils/elements/snackbar/useSnackBar";
import { fetchFileIssueComments } from "../../../../utils/files/file_view/issues/fetchFileIssueCommets";
import { State } from "../../../../types/ReducerTypes";
import { updateFileIssue } from "../../../../utils/files/file_view/issues/updateFileIssue";
import { getFileIssue } from "../../../../utils/files/file_view/issues/getFileIssue";
import {useConfirmationDialog} from "../../../../utils/elements/confirmation-dialog/ConfirmationDialog";

interface IModalComment {
  pageNumber: number | undefined | null;
  openModal: boolean;
  handleCloseModal: () => void;
  selectIssue: FileIssue;
  fileUid: string;
}

const styles = (theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "25px",
    },
    buttons: {
      display: "flex",
      width: "100%",
      justifyContent: "flex-end",
      paddingBottom: "1%",
      maxHeight: 60,
      "& Button": {
        minWidth: "170px",
        margin: "5px",
      },
    },
    answer: {
      width: "100%",
    },
    newCommit: {
      width: "100%",
    },
    issueName: {
      marginRight: "auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    actionButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    textFields: {
      textAlign: "center",
      color: "#3f51b5",
      fontWeight: "bold",
      fontSize: 18,
    },
  });

const useStyles = makeStyles(styles);

export const ModalIssueComment: React.FC<IModalComment> = ({
  pageNumber,
  openModal,
  handleCloseModal,
  selectIssue,
  fileUid,
}) => {
  const classes = useStyles();
  const { alertAction } = useSnackBar();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [showCommentSection, setShowCommentSection] = useState(false);
  const { getConfirmation } = useConfirmationDialog();
  const [isLoadingHandleDelete, setIsLoadingHandleDelete] = useState(false);
  const [editIssue, setEditIssue] = useState(false);
  const [issueData, setIssueData] = useState({
    name: selectIssue?.name,
    description: selectIssue?.description,
  });
  const issueComments = useSelector(
    (state: State) => state.projects.file.issueComments
  );
  const handleClose = () => {
    setShowCommentSection(false);
    setEditIssue(false);
    handleCloseModal();
  };
  const buttomRef = useRef(null);

  const handleDeleteIssue = async () => {
    const confirmed = await getConfirmation({
      title: t("modal-issue-comment.confirm.tittle"),
      message: t("modal-issue-comment.confirm.message"),
    });
    if (confirmed) {
      setIsLoadingHandleDelete(true);
      deleteFileIssue(selectIssue.uid)
          .then((r) => {
            fetchFileIssues(fileUid, { page: pageNumber, user_emails: [] })
                .then((r) => {
                  dispatch(fetchIssueFileProjectAction(r));
                  setIsLoadingHandleDelete(false);
                  handleCloseModal();
                  alertAction.success(
                      `${t("modal-issue-comment.alert.success")}${selectIssue.name}`
                  );
                })
                .catch((e) => alertAction.error(e));
          })
          .catch((e) => {
            alertAction.error(`${e}`);
            setIsLoadingHandleDelete(false);
          });
    }
  };

  const handleNewComment = () => {
    setShowCommentSection(true);
    if (buttomRef && buttomRef.current) {
      // @ts-ignore
      buttomRef.current.scrollIntoView();
    }
  };

  const handleEditIssue = () => {
    setEditIssue(!editIssue);
    setShowCommentSection(false);
  };

  const handleEditIssueData = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIssueData({
      ...issueData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveIssue = () => {
    if (
      issueData?.name?.trim() !== "" &&
      issueData?.description?.trim() !== ""
    ) {
      updateFileIssue(selectIssue?.uid, {
        name: issueData?.name,
        description: issueData?.description,
      })
        .then((r) => {
          alertAction.success(t("modal-issue-comment.alert.success-update"));
          setEditIssue(false);
          fetchFileIssues(fileUid, { page: pageNumber, user_emails: [] })
            .then((r) => {
              dispatch(fetchIssueFileProjectAction(r));
              getFileIssue(selectIssue?.uid).then((r) => {
                dispatch(setContextIssueAction(r));
              });
            })
            .catch((e) => alertAction.error(e));
        })
        .catch((e) => {
          alertAction.error(t("modal-issue-comment.alert.success-update"));
        });
    } else {
      alertAction.error(t("modal-issue-comment.alert.success-error-empty"));
    }
  };

  useEffect(() => {
    if (selectIssue?.uid) {
      fetchFileIssueComments(selectIssue?.uid)
        .then((r) => dispatch(fetchFileIssueCommentsAction(r)))
        .catch((e) => e);
    }
  }, [openModal, selectIssue, dispatch]);

  useEffect(() => {
    setIssueData({
      name: selectIssue?.name,
      description: selectIssue?.description,
    });
  }, [selectIssue]);

  interface DialogTitleProps extends WithStyles<typeof styles> {
    children: React.ReactNode;
    isLoadingHandleDelete: boolean;
    handleDeleteIssue: () => void;
    handleNewComment: () => void;
  }

  const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const {
      children,
      classes,
      isLoadingHandleDelete,
      handleDeleteIssue,
      handleNewComment,
    } = props;
    return (
      <MuiDialogTitle disableTypography>
        <Typography variant="h5">{children}</Typography>
        <div className={classes.actionButton}>
          <Grid container>
            <Grid item xs={5}>
              {editIssue ? (
                <Grid container>
                  <Grid item xs={11}>
                    <Tooltip
                      title={`${t("modal-issue-comment.save-edit-issue")}`}
                    >
                      <IconButton color="primary" onClick={handleEditIssue}>
                        <Save onClick={handleSaveIssue} color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip
                      title={`${t("modal-issue-comment.cancel-edit-issue")}`}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditIssue(false);
                        }}
                      >
                        <Cancel color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
            {editIssue ? null : (
              <Grid container xs={6} spacing={4}>
                <Grid item xs={4}>
                  <Tooltip title={`${t("modal-issue-comment.edit-issue")}`}>
                    <IconButton color="primary" onClick={handleEditIssue}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip
                    title={`${t("modal-issue-comment.add-new-comment-btn")}`}
                  >
                    <IconButton
                      disabled={isLoadingHandleDelete}
                      color="secondary"
                      onClick={handleNewComment}
                    >
                      <AddCommentIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip
                    title={`${t("modal-issue-comment.delete-issue-btn")}`}
                  >
                    <IconButton
                      disabled={isLoadingHandleDelete}
                      color="secondary"
                      onClick={handleDeleteIssue}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            )}
          </Grid>
        </div>
      </MuiDialogTitle>
    );
  });

  return (
    <div>
      <Dialog
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        PaperProps={{
          style: { borderRadius: 25, minWidth: "500px" },
        }}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <div>
            <DialogTitle
              {...{
                isLoadingHandleDelete,
                handleDeleteIssue,
                handleNewComment,
              }}
            ></DialogTitle>
            <Typography color="primary" variant="h5" align="center">
              {editIssue ? (
                <div style={{ width: "80%" }}>
                  <TextField
                    placeholder={t("modal-issue-comment.name-issue")}
                    inputProps={{
                      className: classes.textFields,
                    }}
                    fullWidth
                    name="name"
                    onChange={handleEditIssueData}
                    value={issueData?.name}
                  />
                </div>
              ) : (
                selectIssue?.name
              )}
            </Typography>
            <DialogContent dividers>
              <Grid container>
                <Grid item xs={12}>
                  {editIssue ? (
                    <TextField
                      inputProps={{
                        className: classes.textFields,
                      }}
                      multiline
                      placeholder={t("modal-issue-comment.description-issue")}
                      rows="3"
                      name="description"
                      onChange={handleEditIssueData}
                      fullWidth
                      value={issueData?.description}
                    />
                  ) : (
                    <Typography
                      style={{ padding: "20px" }}
                      color="primary"
                      align="center"
                    >
                      {selectIssue?.description}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              {(issueComments || []).map((comment: CommentInList) => {
                return <Comment comment={comment} />;
              })}
              {showCommentSection ? (
                <NewComment selectIssueUid={selectIssue?.uid} />
              ) : null}
            </DialogContent>
          </div>
        </Fade>
        <div ref={buttomRef} />
      </Dialog>
    </div>
  );
};

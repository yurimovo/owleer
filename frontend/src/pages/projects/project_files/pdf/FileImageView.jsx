import * as React from "react";
import { useEffect, useState } from "react";
import ControlPanel from "./ControlPanel";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Button, Grid, Input, Paper, Typography } from "@material-ui/core";
import { ImageCanvas } from "./ImageCanvas";
import { pdfToImage } from "../../../../utils/files/file_view/pdf/pdfToImage";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../../utils/elements/Loader";

import { GenerateReportDialog } from "./GenerateReportDialog";
import { IssueList } from "./IssueList";
import { FileIssueData } from "../../../../types/FileTypes";
import { fetchFileIssues } from "../../../../utils/files/fetchFileIssues";
import Modal from "@material-ui/core/Modal";
import { FilterIssue } from "../modal-window/filter-issue/FilterIssue";
import { FilterList, Sort } from "@material-ui/icons";
import { getAuthUserToken } from "../../../../utils/auth/getAuthUserToken";

const useStyles = makeStyles((theme) => ({
  rootPdfView: {
    backgroundColor: "#eeeeee",
    display: "block",
    position: "fixed",
    maxWidth: "100%",
    Height: "100%",
    justifyContent: "center",
    alignItems: "center",
    bottom: "auto",
  },
  root: {},
}));

export const FileImageView = ({
  fileUid,
  fileName,
  fileUri,
  fileType,
  fileData,
}) => {
  const classes = useStyles();
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const { t, i18n } = useTranslation();
  const [addNewIssue, setAddNewIsue] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [showEditMode, setShowEditMode] = useState();
  const [rendering, setRendering] = useState(false);
  const [fileImage, setFileImage] = useState();
  const [undoFlag, setUndoFlag] = useState(0);
  const [hoverIssue, setHoverIssue] = useState();
  const [openReportModal, setOpenReportModal] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [emailsOnFilter, setEmailsOnFilter] = useState([]);
  const [filterIssues, setFilterIssues] = useState([]);
  const issuesList = useSelector((state) => state.projects.file.issues);
  const imageTypeFiles = ["png", "jpeg", "jpg", "gif"];
  const [openFilterIssueModal, setOpenFilterIssueModal] = useState(false);

  const addEmailsOnFilter = (email) => {
    if (!emailsOnFilter.includes(email)) {
      const arr = [...emailsOnFilter];
      arr.push(email);
      setEmailsOnFilter(arr);
    } else {
      const findIndex = emailsOnFilter.indexOf(email);
      const oldArr = [...emailsOnFilter];
      const arr = [
        ...oldArr.slice(0, findIndex),
        ...oldArr.slice(findIndex + 1),
      ];
      setEmailsOnFilter(arr);
    }
  };

  const handleOpenFilterIssueModal = () => {
    setOpenFilterIssueModal(true);
  };

  const handleCloseFilterIssueModal = () => {
    setOpenFilterIssueModal(false);
  };

  const handleAddNewIssue = () => {
    if (addNewIssue) {
      setAddNewIsue(false);
    } else {
      setAddNewIsue(true);
    }
  };

  const handleHoverIssue = (issue) => {
    setHoverIssue(issue);
  };

  const handleDrawMode = () => {
    if (drawMode) {
      setDrawMode(false);
    } else {
      setDrawMode(true);
    }
  };

  useEffect(() => {
    if (addNewIssue) {
      setShowIssues(false);
      setDrawMode(false);
    }
  }, [addNewIssue]);

  useEffect(() => {
    if (!showEditMode) {
      setAddNewIsue(false);
      setDrawMode(false);
    }
  }, [showEditMode]);

  const fetchImage = async (fileUri) => {
    const image = new window.Image();
    let token = getAuthUserToken();

    const r = await fetch(fileUri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let blob = await r.blob();

    image.src = URL.createObjectURL(blob);

    return image;
  };

  useEffect(() => {
    setRendering(true);
    if (fileType === "pdf") {
      pdfToImage(fileUri, pageNumber, setNumPages)
        .then((imagePdf) => {
          setFileImage(imagePdf);
        })
        .finally(() => {
          setRendering(false);
        });
    }
    if (imageTypeFiles.includes(fileType?.toLowerCase() || "")) {
      fetchImage(fileUri)
        .then((image) => {
          setFileImage(image);
        })
        .finally(() => {
          setRendering(false);
        });
    }
  }, [fileUri, pageNumber]);

  useEffect(() => {
    fetchFileIssues(fileUid, { user_emails: emailsOnFilter, page: pageNumber })
      .then((r) => setFilterIssues(r))
      .catch((e) => e);
  }, [emailsOnFilter, openFilterIssueModal]);

  const handleShowIssue = () => {
    setShowIssues(!showIssues);
  };

  if (rendering)
    return (
      <div>
        <Loader title={t("pdf-files-view.file-loader")} />
      </div>
    );

  return (
    <Paper className={classes.root}>
      <FilterIssue
        handleOpenFilterIssueModal={handleOpenFilterIssueModal}
        handleCloseFilterIssueModal={handleCloseFilterIssueModal}
        openFilterIssueModal={openFilterIssueModal}
        addEmailsOnFilter={addEmailsOnFilter}
        emailsOnFilter={emailsOnFilter}
      />
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12}>
          <ControlPanel
            undoFlag={undoFlag}
            setUndoFlag={setUndoFlag}
            handleAddNewIssue={handleAddNewIssue}
            addNewIssue={addNewIssue}
            handleDrawMode={handleDrawMode}
            drawMode={drawMode}
            showEditMode={showEditMode}
            setShowEditMode={setShowEditMode}
            name={fileName}
            numPages={numPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            handleShowIssue={handleShowIssue}
            setOpenReportModal={setOpenReportModal}
            showIssues={showIssues}
          />
        </Grid>
      </Grid>
      <section className={classes.rootPdfView} id="pdf-section">
        <Grid container>
          {issuesList?.length && !showIssues ? (
            <Grid
              xs={2}
              style={{ overflowY: "scroll", height: "calc(100vh - 130px)" }}
            >
              <Paper>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    endIcon={<Sort />}
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleOpenFilterIssueModal}
                  >
                    {t("issue-list.filter-issue")}
                  </Button>
                </div>
                {(
                  (emailsOnFilter.length > 0 ? filterIssues : issuesList) || []
                ).map((issue: FileIssueData) => {
                  return (
                    <IssueList
                      issue={issue}
                      handleHoverIssue={handleHoverIssue}
                    />
                  );
                })}
              </Paper>
            </Grid>
          ) : null}
          <Grid xs={issuesList?.length ? 10 : 12}>
            <ImageCanvas
              undoFlag={undoFlag}
              pageNumber={pageNumber}
              addNewIssue={addNewIssue}
              drawMode={drawMode}
              fileImage={fileImage}
              hoverIssue={hoverIssue}
              showIssues={showIssues}
              fileData={fileData}
              emailsOnFilter={emailsOnFilter}
              filterIssues={filterIssues}
            />
          </Grid>
        </Grid>
      </section>
      <GenerateReportDialog
        isOpen={openReportModal}
        setIsOpen={setOpenReportModal}
        fileUid={fileUid}
      />
    </Paper>
  );
};

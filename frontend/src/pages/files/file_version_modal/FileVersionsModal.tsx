import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import { listFileVersions } from "../../../utils/files/listFileVersions";
import { FileSystemObject, FileVersion } from "../../../types/FileTypes";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { IconButton, Typography } from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { FileOnList } from "./FileOnList";
import { useHistory } from "react-router";
import Loader from "../../../utils/elements/Loader";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

interface IFIleVersionModal {
  file: FileSystemObject;
  openFileVersionModal: boolean;
  handleCloseFileVersionModal: () => void;
}

export const FileVersionModal: React.FC<IFIleVersionModal> = ({
  file,
  openFileVersionModal,
  handleCloseFileVersionModal,
}) => {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<Array<FileVersion>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (openFileVersionModal) {
      setLoading(true);
      listFileVersions(file.uid)
        .then((resultVersions: Array<FileVersion>) => {
          setVersions(resultVersions);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  }, [openFileVersionModal]);

  return (
    <Dialog
      maxWidth="lg"
      open={openFileVersionModal}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleCloseFileVersionModal}
    >
      <DialogTitle>{t("file-version-modal.tittle")}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Loader contained />
        ) : (
          <>
            {versions.length === 0 ? (
              <Typography variant="h5">
                {t("file-version-modal.no-version")}
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {t("file-version-modal.table.created")}
                      </TableCell>
                      <TableCell align="center">
                        {t("file-version-modal.table.description")}
                      </TableCell>
                      <TableCell align="center">
                        {t("file-version-modal.table.user")}
                      </TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version) => {
                      return (
                        <FileOnList
                          uri={file.uri}
                          uid={file.uid}
                          name={file.Name}
                          version={version}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseFileVersionModal} color="primary">
          {t("file-version-modal.close-btn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

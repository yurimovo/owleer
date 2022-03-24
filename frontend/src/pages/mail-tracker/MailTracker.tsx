import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { Divider, Grid, IconButton, Typography } from "@material-ui/core";
import { Cached, Check, DoneAll } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { paginateMails } from "../../utils/communication/paginateMails";
import { Email } from "../../types/CommunicationTypes";
import Loader from "../../utils/elements/Loader";
import { lastModifiedTime } from "../../utils/timeUtils";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {},
});

export const MailTracker = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const { t } = useTranslation();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [mails, setMails] = useState<Array<Email>>([]);
  const successColor = "#4BB543";
  const pendingColor = "#808080";

  const loadMails = () => {
    setLoading(true);
    paginateMails(page, rowsPerPage)
      .then((r) => {
        setMails(r.emails);
        setTotal(r.total);
      })
      .catch((e) => e)
      .finally(() => {
        setLoading(false);
      });
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    loadMails();
  }, [page, rowsPerPage]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <Grid container xs={12} justifyContent="center">
          <Grid xs={11} container justifyContent="flex-end" alignItems="center">
            <Typography>{t("mail-tracker.refresh-mail-data")}</Typography>
            <IconButton onClick={loadMails}>
              <Cached fontSize="large" color="primary" />
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <Paper className={classes.root}>
              <TableContainer className={classes.container}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        {t("mail-tracker.table.subject")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.recipient")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.created_date")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.delivered")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.delivery_date")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.opened")}
                      </TableCell>
                      <TableCell align="center">
                        {t("mail-tracker.table.open_date")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mails.map((row: Email) => {
                      return (
                        <TableRow
                          key={row.uid}
                          hover
                          role="checkbox"
                          tabIndex={-1}
                        >
                          <TableCell align="center">{row.subject}</TableCell>
                          <TableCell align="center">
                            {row.recipient.name}{" "}
                            <Divider orientation="vertical" />{" "}
                            {row.recipient.email}
                          </TableCell>
                          <TableCell align="center">
                            {lastModifiedTime(row.created_at) || "—"}
                          </TableCell>
                          <TableCell align="center">
                            <Check
                              style={{
                                color: row?.delivered
                                  ? successColor
                                  : pendingColor,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {row.delivery_date || "—"}
                          </TableCell>
                          <TableCell align="center">
                            <DoneAll
                              style={{
                                color: row?.opened
                                  ? successColor
                                  : pendingColor,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {lastModifiedTime(row.open_date) || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

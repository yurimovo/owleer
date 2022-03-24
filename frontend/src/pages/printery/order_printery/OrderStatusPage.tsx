import {
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { OrderRecord } from "./OrderRecord";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { fetchProjectOrder } from "../../../utils/files/orders/fetchProjectOrder";
import { OrderOnList } from "../../../types/OrderTypes";
import { useTranslation } from "react-i18next";
import Loader from "../../../utils/elements/Loader";

const useStyles = makeStyles({
  table: {
    minWidth: "160vh",
  },
});
export const ProjectOrderPrintery = () => {
  const classes = useStyles();
  const contextProject = useSelector(
    (state: State) => state.projects?.contextProject
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [projectOrder, setProjectOrder] = useState<Array<OrderOnList>>([]);
  const [hideApprovedOrder, setHideApprovedOrder] = useState(false);
  const { t, i18n } = useTranslation();

  const reloadOrders = () => {
    setLoading(true);
    if (contextProject?.uid) {
      fetchProjectOrder(contextProject?.uid)
        .then((r) => {
          setProjectOrder(r);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    reloadOrders();
  }, [contextProject]);

  return (
    <div>
      {!loading ? (
        <Grid
          container
          direction="column"
          justifyContent="center"
          style={{ marginTop: 20 }}
        >
          {projectOrder.length ? (
            <Grid container justifyContent="center">
              <Grid container justifyContent="center">
                <Paper>
                  <TableContainer component={Paper}>
                    <Table className={classes.table} size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">
                            {t("orders.order-record.name")}
                          </TableCell>
                          <TableCell align="center">
                            {t("orders.order-record.office")}
                          </TableCell>
                          <TableCell align="center">
                            {t("orders.order-record.phone")}
                          </TableCell>
                          <TableCell align="center">
                            {t("orders.order-record.date")}
                          </TableCell>
                          <TableCell align="center">
                            {t("orders.order-record.status.status")}
                          </TableCell>
                          <TableCell align="right">
                            <FormControlLabel
                              onChange={() =>
                                setHideApprovedOrder(!hideApprovedOrder)
                              }
                              control={
                                <Switch
                                  color="primary"
                                  value={hideApprovedOrder}
                                />
                              }
                              labelPlacement="start"
                              label={t("orders.hide-approved-btn")}
                            />
                          </TableCell>
                          {/*                          {contextProject?.is_admin ? (
                            <TableCell align="center" />
                          ) : null}*/}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(Array.from(projectOrder) || []).map(
                          (order: OrderOnList) => {
                            if (hideApprovedOrder) {
                              if (!order?.approved) {
                                return (
                                  <OrderRecord
                                    reloadOrders={reloadOrders}
                                    userOrder={false}
                                    order={order}
                                  />
                                );
                              }
                            } else {
                              return (
                                <OrderRecord
                                  reloadOrders={reloadOrders}
                                  userOrder={false}
                                  order={order}
                                />
                              );
                            }
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography
              variant="h4"
              color="secondary"
              align="center"
              style={{ paddingTop: "20%", color: "#D3D3D3" }}
            >
              {t("orders.no-orders-available")}
            </Typography>
          )}
        </Grid>
      ) : (
        <Loader title={t("orders.loading-orders")} />
      )}
    </div>
  );
};

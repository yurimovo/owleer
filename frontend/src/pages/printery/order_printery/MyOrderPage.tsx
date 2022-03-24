import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@material-ui/core";
import { fetchUserOrder } from "../../../utils/files/orders/fetchUserOrder";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { OrderOnList } from "../../../types/OrderTypes";
import { OrderRecord } from "./OrderRecord";
import Loader from "../../../utils/elements/Loader";
import { useForm } from "react-hook-form";

const useStyles = makeStyles({
  table: {
    minWidth: "160vh",
  },
});

export const MyOrderPage = () => {
  const classes = useStyles();
  const [orders, setOrders] = useState<Array<OrderOnList>>([]);
  const [hideApprovedOrder, setHideApprovedOrder] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const contextProject = useSelector(
    (state: State) => state.projects?.contextProject
  );

  const reloadOrders = () => {
    setLoading(true);
    fetchUserOrder(contextProject?.uid)
      .then((r) => {
        setOrders(r);
      })
      .finally(() => {
        setLoading(false);
      });
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
          <Grid container justifyContent="center">
            <Grid container justifyContent="center">
              {orders.length ? (
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(Array.from(orders) || []).map(
                          (order: OrderOnList) => {
                            if (hideApprovedOrder) {
                              if (!order?.approved) {
                                return (
                                  <OrderRecord
                                    reloadOrders={reloadOrders}
                                    userOrder={true}
                                    order={order}
                                  />
                                );
                              }
                            } else {
                              return (
                                <OrderRecord
                                  reloadOrders={reloadOrders}
                                  userOrder={true}
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
              ) : (
                <Typography
                  variant="h4"
                  align="center"
                  style={{ paddingTop: "20%", color: "#D3D3D3" }}
                >
                  {t("orders.no-orders-available")}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Loader title={t("orders.loading-orders")} />
      )}
    </div>
  );
};

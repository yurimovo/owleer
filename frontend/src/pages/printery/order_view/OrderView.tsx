import React, { useEffect, useState, useCallback } from "react";
import { FileFetchOnOrder, OrderType } from "../../../types/OrderTypes";
import { fetchOrderByUid } from "../../../utils/files/orders/fetchOrderByUid";
import {
  Button,
  Divider,
  Grid,
  List,
  Paper,
  Table,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
import { FileOnOrder } from "./fileOnOrder";
import { approveOrder } from "../../../utils/files/orders/approveOrder";
import { useTranslation } from "react-i18next";
import Loader from "../../../utils/elements/Loader";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { lastModifiedTime } from "../../../utils/timeUtils";

export const OrderView = () => {
  const { t, i18n } = useTranslation();
  const isAdmin = useSelector(
    (state: State) => state.projects?.contextProject?.is_admin
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderType>({
    address: {
      name: "",
      address: "",
      description: "",
    },
    approved: false,
    customer_details: {
      name: "",
      office: "",
      phone: "",
    },
    files: [],
    order_type: "",
    creation_time: "",
  });
  const uidOrder = window.location.pathname.split("/")[2];

  const loadOrder = () => {
    if (uidOrder.length > 0) {
      setLoading(true);
      fetchOrderByUid(uidOrder)
        .then((r) => {
          setOrder(r);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleApprove = () => {
    setLoading(true);
    approveOrder(uidOrder)
      .then((r) => r)
      .finally(() => {
        loadOrder();
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrder();
  }, [uidOrder]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <Grid container xs={12} justifyContent="space-around">
          <Grid
            component={Paper}
            elevation={7}
            style={{ margin: 10, borderRadius: 10 }}
            alignItems="center"
            container
            justifyContent="space-evenly"
            xs={12}
          >
            <Grid item>
              <Table>
                <TableRow>
                  <TableCell align="center">{t("order-view.sender")}</TableCell>
                  <TableCell align="center">{t("order-view.office")}</TableCell>
                  <TableCell align="center">{t("order-view.phone")}</TableCell>
                  <TableCell align="center">{t("order-view.date")}</TableCell>
                  <TableCell align="center">{t("order-view.status")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">
                    {order?.customer_details?.name}
                  </TableCell>
                  <TableCell align="center">
                    {order?.customer_details?.office}
                  </TableCell>
                  <TableCell align="center">
                    {order?.customer_details?.phone}
                  </TableCell>
                  <TableCell align="center">
                    {lastModifiedTime(order?.creation_time)}
                  </TableCell>
                  <TableCell align="center">
                    {!order.approved ? (
                      <Grid item>
                        {isAdmin ? (
                          <Button
                            onClick={handleApprove}
                            style={{ color: "green", fontWeight: "bold" }}
                            variant="contained"
                          >
                            {t("order-view.approve")}
                          </Button>
                        ) : (
                          <div>{t("order-view.pending")}</div>
                        )}
                      </Grid>
                    ) : (
                      <Typography color="primary">
                        {t("order-view.approved")}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              </Table>
            </Grid>
          </Grid>
          <Grid
            component={Paper}
            xs={12}
            container
            style={{ margin: 10, borderRadius: 10 }}
            elevation={7}
          >
            <Grid item xs={12}>
              <Typography
                style={{ fontSize: 18, fontWeight: "bold" }}
                align="center"
                color="primary"
              >
                {t("order-view.files-in-order")}
              </Typography>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <List>
                {(order?.files || []).map((file: FileFetchOnOrder) => {
                  return <FileOnOrder file={file} />;
                })}
              </List>
            </Grid>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

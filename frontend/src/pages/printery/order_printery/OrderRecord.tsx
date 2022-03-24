import TableCell from "@material-ui/core/TableCell";
import { Button } from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { OrderOnList } from "../../../types/OrderTypes";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { approveOrder } from "../../../utils/files/orders/approveOrder";
import { lastModifiedTime } from "../../../utils/timeUtils";

interface IOrderOnLise {
  order: OrderOnList;
  userOrder: boolean;
  reloadOrders: () => void;
}

export const OrderRecord: React.FC<IOrderOnLise> = ({
  userOrder,
  order,
  reloadOrders,
}) => {
  const isAdmin = useSelector(
    (state: State) => state.projects?.contextProject?.is_admin
  );
  const history = useHistory();
  const { t, i18n } = useTranslation();

  const handleApprove = () => {
    approveOrder(order.uid)
      .then(() => {})
      .finally(() => {
        reloadOrders();
      });
  };

  return (
    <TableRow>
      <TableCell align="center">{order?.customer_details?.name}</TableCell>
      <TableCell align="center">{order?.customer_details?.office}</TableCell>
      <TableCell align="center">{order?.customer_details?.phone}</TableCell>
      <TableCell align="center">
        {lastModifiedTime(order?.creation_time)}
      </TableCell>
      <TableCell align="center">
        {order.approved
          ? t("orders.order-record.status.approved")
          : t("orders.order-record.status.pending")}
      </TableCell>
      {isAdmin && !userOrder ? (
        <TableCell align="right">
          <Button
            color="primary"
            style={{ marginRight: 7, fontSize: 10 }}
            variant="contained"
            onClick={() => {
              history.push(`/order/${order.uid}`);
            }}
          >
            {t("orders.order-record.view")}
          </Button>
          {!order.approved ? (
            <Button
              onClick={handleApprove}
              style={{ color: "green", fontSize: 10 }}
              variant="contained"
            >
              {t("orders.order-record.approve")}
            </Button>
          ) : null}
        </TableCell>
      ) : null}
      {userOrder ? (
        <TableCell align="right">
          <Button
            color="primary"
            style={{ marginRight: 7, fontSize: 10 }}
            variant="contained"
            onClick={() => {
              history.push(`/order/${order.uid}`);
            }}
          >
            {t("orders.order-record.view")}
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  );
};

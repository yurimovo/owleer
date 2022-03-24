import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { closeSnackBar } from "../../../actions/actions";
import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

/*===types Alert===
success
error
warning
info
success*/

export const SnackBarCustomize = () => {
  const vertical = "top";
  const horizontal = "center";
  const dispatch = useDispatch();
  const open = useSelector((state: State) => state.utils.snackBar.open);
  const text = useSelector((state: State) => state.utils.snackBar.text);
  const type = useSelector((state: State) => state.utils.snackBar.type);
  const time = useSelector((state: State) => state.utils.snackBar.time);

  const handleCloseSnackBar = () => {
    dispatch(closeSnackBar());
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      autoHideDuration={time}
      onClose={handleCloseSnackBar}
    >
      <MuiAlert onClose={handleCloseSnackBar} severity={type}>
        {text}
      </MuiAlert>
    </Snackbar>
  );
};

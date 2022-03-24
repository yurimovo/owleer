import { useDispatch } from "react-redux";
import { openSnackBar } from "../../../actions/actions";
import { AlertColor } from "../../../types/SnackBar";

export const useSnackBar = () => {
  const dispatch = useDispatch();

  const createAlert =
    (type: AlertColor) =>
    (text: string, time: number = 5000) => {
      dispatch(openSnackBar(true, text, type, time));
    };

  const alertAction = {
    success: createAlert("success"),
    error: createAlert("error"),
    info: createAlert("info"),
  };

  return {
    alertAction,
  };
};

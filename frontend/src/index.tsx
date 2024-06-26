import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App  from "./App";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { SnackBarCustomize } from "./utils/elements/snackbar/SnackBar";

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <SnackBarCustomize />
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

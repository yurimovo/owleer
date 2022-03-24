import React from "react";
import { CircularProgress, Typography } from "@material-ui/core";
import { Spinner } from "./Spinner";

interface ILoader {
  color?: string;
  size?: number;
  title?: JSX.Element | string;
  background?: string;
  width?: string;
  height?: string;
  contained?: boolean;
}

export type LoaderParams = ILoader | string;

const defaultParams = {
  height: "100%",
  width: "100%",
  background: "inherit",
  size: 32,
  color: "inherit",
};

const Loader = (p: LoaderParams) => {
  const data =
    typeof p === "string"
      ? {
          ...defaultParams,
          title: <Typography variant="body2">{p}</Typography>,
        }
      : {
          ...defaultParams,
          ...p,
          title:
            typeof p.title === "string" ? (
              <Typography variant="body2">{p.title}</Typography>
            ) : (
              p.title
            ),
        };
  return (
    <div
      style={{
        height: data.height,
        width: data.width,
        position: data.contained ? "relative" : "absolute",
        display: "flex",
        top: 0,
        left: 0,
        justifyContent: "center",
        zIndex: 9999,
        alignItems: "center",
        background: data.background,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Spinner />
        <div style={{ height: "16px" }} />
        {data.title}
      </div>
    </div>
  );
};

export default Loader;

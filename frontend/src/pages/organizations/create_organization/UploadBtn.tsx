import * as React from "react";
import { styled } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

const Input = styled("input")({
  display: "none",
});

export const UploadBtn = () => {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <label htmlFor="contained-button-file">
        <Input
          accept="image/*"
          id="contained-button-file"
          multiple
          type="file"
        />
        <Button endIcon={<PhotoCamera />} variant="contained" component="span">
          {t("organization-upload-btn")}
        </Button>
      </label>
    </div>
  );
};

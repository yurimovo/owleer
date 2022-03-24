import React, {useEffect, useState} from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  ListItemText,
} from "@material-ui/core";
import { UploadedFile } from "../../../types/FileTypes";

interface IFileOnList {
  file: UploadedFile;
  handleAddFilesSend: (file: UploadedFile) => void;
    selectAllFiles: boolean;
}
export const FileOnList: React.FC<IFileOnList> = ({
  file,
  handleAddFilesSend,
                                                      selectAllFiles
}) => {
  const [selected, setSelected] = useState(false);

    useEffect(() => {
        if (selectAllFiles) {
            setSelected(true);
        } else {
            setSelected(false);
        }
    },[selectAllFiles])

  return (
    <>
      <FormControl error={false} component="fieldset">
        <FormGroup>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <ListItemText primary={file.file_name} />
            </div>
            <FormControlLabel
              style={{ margin: 0 }}
              label={null}
              onChange={() => {
                setSelected(!selected);
                handleAddFilesSend(file);
              }}
              control={<Checkbox color="primary" checked={selected} />}
            />
          </div>
        </FormGroup>
      </FormControl>
    </>
  );
};

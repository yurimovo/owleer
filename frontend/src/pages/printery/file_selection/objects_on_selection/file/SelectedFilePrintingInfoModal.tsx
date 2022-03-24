import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Input,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSystemObject } from "../../../../../types/FileTypes";
import { FileToPrint, PrintingOrder } from "../../../../../types/PrintaryTypes";
import { ProjectPrintingAgency } from "../../../../../types/ProjectTypes";

interface ISelectedFilePrintingInfoModal {
  prinitingOrder: PrintingOrder;
  setPrintingOrder: React.Dispatch<React.SetStateAction<PrintingOrder>>;
  file: FileSystemObject;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contextAgency: ProjectPrintingAgency;
}

const SelectedFilePrintingInfoModal: React.FC<
  ISelectedFilePrintingInfoModal
> = ({
  open,
  setOpen,
  prinitingOrder,
  file,
  setPrintingOrder,
  contextAgency,
}) => {
  const { t, i18n } = useTranslation();
  const [description, setDescription] = useState<string>("");
  const [pageSize, setPageSize] = useState<string>("");
  const [copies, setCopies] = useState<number>(1);
  const [foldingType, setFoldingType] = useState<string>("");
  const [selectWork, setSelectWork] = useState<string>("");

  const handleCloseModal = async () => {
    setOpen(false);
  };

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      fullWidth
      style={{ minWidth: "500px" }}
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <div>
        <DialogTitle>
          <Typography align="center" variant="h5" color="primary">
            {t("printery.file-selection.add-modal.header")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              paddingBottom: 10,
              alignItems: "center",
            }}
          >
            <Typography color="primary" variant="h6">
              {t("printery.file-selection.add-modal.select-work")}
            </Typography>
            <FormControl style={{ minWidth: "30%" }}>
              <InputLabel>
                {t("printery.file-selection.add-modal.work")}
              </InputLabel>
              <Select
                value={selectWork}
                onChange={(e) => setSelectWork(e.target.value)}
              >
                {(contextAgency?.works || []).map((work) => {
                  return <MenuItem value={work}>{work}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              paddingBottom: 10,
              alignItems: "center",
            }}
          >
            <Typography color="primary" variant="h6">
              {t("printery.file-selection.add-modal.page-size")}
            </Typography>
            <FormControl style={{ minWidth: "30%" }}>
              <InputLabel>
                {t("printery.file-selection.add-modal.page-size")}
              </InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
              >
                <MenuItem value={"0"}>{"0"}</MenuItem>
                <MenuItem value={"A1"}>{"A1"}</MenuItem>
                <MenuItem value={"A2"}>{"A2"}</MenuItem>
                <MenuItem value={"A3"}>{"A3"}</MenuItem>
                <MenuItem value={"A4"}>{"A4"}</MenuItem>
                <MenuItem value={"A5"}>{"A5"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <Divider />
          <Typography
            align="center"
            variant="h5"
            color="primary"
            style={{ padding: 15 }}
          >
            {t("printery.file-selection.add-modal.inputs.folding-types.header")}
          </Typography>
          <RadioGroup
            aria-label="folding"
            defaultChecked={true}
            name="radio-buttons-group"
            onChange={(e, v) => {
              setFoldingType(v);
            }}
          >
            <FormControlLabel
              value={t(
                "printery.file-selection.add-modal.inputs.folding-types.options.folded"
              )}
              control={<Radio />}
              label={t(
                "printery.file-selection.add-modal.inputs.folding-types.options.folded"
              )}
            />
            <FormControlLabel
              value={t(
                "printery.file-selection.add-modal.inputs.folding-types.options.rolled"
              )}
              control={<Radio />}
              label={t(
                "printery.file-selection.add-modal.inputs.folding-types.options.rolled"
              )}
            />
          </RadioGroup>
          <Typography
            align="center"
            variant="h5"
            color="primary"
            style={{ padding: 25 }}
          >
            {t("printery.file-selection.add-modal.inputs.copies")}
          </Typography>
          <FormControl style={{ minWidth: "30%" }}>
            <Input
              value={copies}
              onChange={(e) => {
                setCopies(e.target.value);
              }}
              type="number"
            />
          </FormControl>
          <Typography
            align="center"
            variant="h5"
            color="primary"
            style={{ padding: 25 }}
          >
            {t("printery.file-selection.add-modal.inputs.description.header")}
          </Typography>
          <TextField
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            fullWidth
            variant="outlined"
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!(selectWork.length > 0)}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              const fileToAdd: FileToPrint = {
                file: file,
                workType: selectWork,
                foldingType: foldingType,
                description: description,
                pageSize: pageSize,
                copies: copies,
              };

              if (!prinitingOrder.files.includes(fileToAdd)) {
                const updatedOrder = { ...prinitingOrder };
                updatedOrder.files = [...prinitingOrder.files, fileToAdd];
                setPrintingOrder(updatedOrder);
                setOpen(false);
              }
            }}
          >
            {t("printery.file-selection.add-modal.add-button-text")}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default SelectedFilePrintingInfoModal;

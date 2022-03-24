import {
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem, Paper,
  Select, Table, TableBody, TableCell, TableHead, TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import { fetchFilterFiles } from "../../../utils/files/fetchFilterFiles";
import Loader from "../../../utils/elements/Loader";
import {
  FilteredFilesDataType,
  FilteredFileType,
} from "../../../types/FileTypes";
import { FileViewRecord } from "./FileViewRecord";
import { useSelector } from "react-redux";
import { State } from "../../../types/ReducerTypes";
import { useTranslation } from "react-i18next";
import Fuse from "fuse.js";
import { Search } from "@material-ui/icons";
import TableContainer from '@material-ui/core/TableContainer';


export const FilesView = () => {
  const { t } = useTranslation();
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [lastFilesData, setLastFilesData] = useState<Array<FilteredFileType>>(
    []
  );
  const [filterValue, setFilterValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [daysBack, setDaysBack] = useState<string>("7");

  const options = {
    includeScore: false,
    keys: ["user.name", "Name"],
  };

  const filterFilesData = new Fuse(lastFilesData, options);

  const handleDaysBack = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setDaysBack(e.target.value);
  };

  useEffect(() => {
    if (contextProject?.uid) {
      setIsLoading(true);
      fetchFilterFiles(contextProject?.uid, daysBack)
        .then((r) => {
          setLastFilesData(r);
        })
        .catch((e) => e)
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [contextProject, daysBack]);

  const handleFilterValue = (e: React.ChangeEvent<{ value: string }>) => {
    setFilterValue(e.target.value);
  };

  return (
    <>
      {lastFilesData.length !== 0 && (
        <Grid container direction="column" justifyContent="center">
          <Grid container xs={12}>
            <Grid item xs={12}>
              <Typography align="center" color="primary">
                {t("dashboard.last-files-week.tittle")}
              </Typography>
            </Grid>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <FormControlLabel
                  label={t("dashboard.last-files-week.days-back")}
                  control={
                    <Select
                      style={{ marginTop: "3%", marginRight: 15 }}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={daysBack}
                      onChange={handleDaysBack}
                    >
                      <MenuItem value="7">7</MenuItem>
                      <MenuItem value="25">25</MenuItem>
                      <MenuItem value="100">100</MenuItem>
                    </Select>
                  }
                />

                <TextField
                  variant="outlined"
                  margin="dense"
                  placeholder={t("dashboard.last-files-week.search-field")}
                  style={{ marginRight: 10 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        <Search style={{ color: "#3f51b5" }} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleFilterValue}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ marginTop: 5 }} />
          {isLoading ? (
            <Loader contained />
          ) : (
            <Grid item style={{ maxHeight: "370px", overflow: "auto" }}>
              <TableContainer>
                <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell scope="2">{t("dashboard.last-files-week.table.file-name")}</TableCell>
                  <TableCell align="center">{t("dashboard.last-files-week.table.created")}</TableCell>
                  <TableCell align="center">{t("dashboard.last-files-week.table.description")}</TableCell>
                  <TableCell align="center">{t("dashboard.last-files-week.table.user")}</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
                  <TableBody>
                    {filterValue.length > 0 ? (
                        <>
                          {(filterFilesData.search(filterValue) || []).map(
                              (file: FilteredFilesDataType) => {
                                return <FileViewRecord file={file.item} />;
                              }
                          )}
                          {!(filterFilesData.search(filterValue).length > 0) && (
                              <Typography
                                  align="center"
                                  variant="h6"
                                  style={{ color: "#747474", padding: "20px" }}
                              >
                                {t("dashboard.last-files-week.files-not-found")}
                              </Typography>
                          )}
                        </>
                    ) : (
                        <>
                          {lastFilesData.map((file: FilteredFileType) => {
                            return <FileViewRecord file={file} />;
                          })}
                        </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
};

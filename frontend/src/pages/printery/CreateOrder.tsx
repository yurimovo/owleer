import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { State } from "../../types/ReducerTypes";
import NoProjectSelectedView from "../files/NoProjectSelectedView";
import { FilesSelection } from "./file_selection/FilesSelection";
import { SelectedFile } from "./selected_files/SelectedFile";
import { OrderCreateFile, OrderType } from "../../types/OrderTypes";
import { useForm } from "react-hook-form";
import { createOrder } from "../../utils/files/orders/createOrder";
import Loader from "../../utils/elements/Loader";
import { useSnackBar } from "../../utils/elements/snackbar/useSnackBar";
import { fetchProjectPrintingAgencies } from "../../utils/projects/fetchProjectPrintingAgencies";
import { ProjectPrintingAgency } from "../../types/ProjectTypes";
import { FileToPrint } from "../../types/PrintaryTypes";

export default function CreateOrder() {
  const { t } = useTranslation();
  const user = useSelector((state: State) => state.user);

  const { alertAction } = useSnackBar();

  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const [creating, setCreating] = useState<boolean>(false);
  const [userPhone, setUserPhone] = useState<string | undefined>(
    user.userData.phone
  );
  const [userName, setUserName] = useState<string | undefined>(
    user.userData.name
  );
  const [office, setOffice] = useState<string | undefined>(
    user.userData.data.company
  );
  const [onAccount, setOnAccount] = useState<string | undefined>(
    contextProject?.owner_company.name
  );
  const [agencies, setAgencies] = useState<Array<ProjectPrintingAgency>>([]);
  const [contextAgency, setContextAgency] = useState<ProjectPrintingAgency>({});

  const orderInit = {
    customer_details: {
      name: userName,
      office: office,
      phone: userPhone,
      onAccount: onAccount,
    },
    agency: {
      name: "",
      uid: "",
    },
    approved: false,
    files: [],
    address: {
      name: "",
      address: "",
      description: "",
    },
    creation_time: "",
  } as OrderType;

  const [printingOrder, setPrintingOrder] = useState<OrderType>(orderInit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    const newFiles: Array<OrderCreateFile> = [];
    setCreating(true);
    printingOrder.files.map((file: FileToPrint) => {
      newFiles.push({
        uid: file.file.uid,
        data: {
          workType: file?.workType,
          folding: file.foldingType,
          copies: file.copies,
          pageSize: file.pageSize,
          description: file.description,
        },
      });
    });
    createOrder(contextProject?.uid, {
      customer_details: {
        name: userName,
        office: office,
        phone: userPhone,
        onAccount: onAccount,
      },
      agency: { uid: contextAgency?.uid, name: contextAgency?.name },
      files: newFiles,
      address: {
        name: data.address.name,
        description: data.address.description,
        address: `${data.address.city}, ${data.address.street}  ${data.address.number}`,
      },
    })
      .then((r) => {
        alertAction.success(t("printery.create.success"));
      })
      .catch((e) => {
        alertAction.error(t("printery.create.error"));
      })
      .finally(() => {
        setCreating(false);
        setPrintingOrder(orderInit);
      });
  };

  useEffect(() => {
    setPrintingOrder(orderInit);
    setContextAgency({});
    fetchProjectPrintingAgencies(contextProject?.uid).then(
      (agencies: Array<ProjectPrintingAgency>) => {
        setAgencies(agencies);
      }
    );
  }, [contextProject]);

  useEffect(() => {
    printingOrder.agency.uid = contextAgency.uid;
    printingOrder.agency.name = contextAgency.name;
  }, [contextAgency]);

  const handleContextAgencie = (
    e: ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const findAgency = agencies.find(
      (agencies) => agencies.uid === e.target.value
    );
    setContextAgency(findAgency || {});
  };

  return (
    <div>
      {creating ? (
        <Loader />
      ) : (
        <div>
          {contextProject ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                style={{ alignSelf: "center", padding: "25px" }}
                spacing={3}
              >
                <Grid item xs={12}>
                  <Paper style={{ padding: 25 }} elevation={7}>
                    <Typography color="primary" align="center" variant="h4">
                      {t("printery.header")}
                    </Typography>
                    <Divider />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  {agencies.length > 0 && (
                    <Paper style={{ padding: 25 }} elevation={7}>
                      <Typography color="primary" align="center" variant="h4">
                        {t("printery.agency")}
                      </Typography>
                      <Divider />
                      <div style={{ padding: 25 }}>
                        <FormControl fullWidth>
                          <InputLabel>{t("printery.agency")}</InputLabel>
                          <Select
                            variant="outlined"
                            onChange={handleContextAgencie}
                          >
                            {agencies.map((agencies) => {
                              return (
                                <MenuItem value={agencies?.uid}>
                                  {agencies.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </div>
                    </Paper>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Paper style={{ padding: 25 }} elevation={7}>
                    <Grid
                      container
                      alignItems="center"
                      alignContent="center"
                      spacing={3}
                    >
                      <Grid item xs={12}>
                        <Typography color="primary" align="center" variant="h4">
                          {t("printery.customer-details.header")}
                        </Typography>
                        <Divider />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          autoComplete="Phone"
                          name="Phone"
                          variant="outlined"
                          required
                          fullWidth
                          id="Phone"
                          label={t("printery.customer-details.inputs.phone")}
                          value={userPhone}
                          onChange={(e) => {
                            setUserPhone(e.target.value);
                          }}
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          autoComplete="Ordering Office"
                          name="Ordering Office"
                          variant="outlined"
                          value={office}
                          onChange={(e) => {
                            setOffice(e.target.value);
                          }}
                          required
                          fullWidth
                          id="Ordering Office"
                          label={t(
                            "printery.customer-details.inputs.ordering-office"
                          )}
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          autoComplete="Name"
                          name="Name"
                          variant="outlined"
                          required
                          fullWidth
                          id="Name"
                          label={t("printery.customer-details.inputs.name")}
                          value={userName}
                          onChange={(e) => {
                            setUserName(e.target.value);
                          }}
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          autoComplete="OnAccount"
                          name="OnAccount"
                          variant="outlined"
                          required
                          fullWidth
                          id="OnAccount"
                          label={t(
                            "printery.customer-details.inputs.on-account"
                          )}
                          value={onAccount}
                          onChange={(e) => {
                            setOnAccount(e.target.value);
                          }}
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          disabled
                          autoComplete="Project"
                          name="Project"
                          variant="outlined"
                          required
                          fullWidth
                          id="Project"
                          label={t("printery.customer-details.inputs.project")}
                          value={contextProject.name}
                          autoFocus
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={5}>
                  <Paper style={{ padding: 25, height: "100%" }} elevation={7}>
                    <Typography color="primary" align="center" variant="h4">
                      {t("printery.selected-files.header")}
                    </Typography>
                    <Divider />
                    <div>
                      {!printingOrder.files.length ? (
                        <div>
                          <Typography
                            color="secondary"
                            variant="h6"
                            align="center"
                            style={{ paddingTop: 25 }}
                          >
                            {t("printery.selected-files.no-files-message")}
                          </Typography>
                        </div>
                      ) : (
                        <div style={{maxHeight: 500}}>
                          <TableContainer  style={{maxHeight: 500}}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{fontSize: 11}}>{t("printery.selected-files.table.name")}</TableCell>
                                  <TableCell style={{fontSize: 11}} align="left">{t("printery.selected-files.table.folder-type")}</TableCell>
                                  <TableCell style={{fontSize: 11}} align="left">{t("printery.selected-files.table.work")}</TableCell>
                                  <TableCell style={{fontSize: 11}} align="left">{t("printery.selected-files.table.page-size")}</TableCell>
                                  <TableCell style={{fontSize: 11}} align="left">{t("printery.selected-files.table.copies")}</TableCell>
                                  <TableCell style={{fontSize: 11}} align="right"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {printingOrder.files.map((file: FileToPrint) => {
                                  return (
                                      <SelectedFile
                                          fileToPrint={file}
                                          printingOrder={printingOrder}
                                          setPrintingOrder={setPrintingOrder}
                                      />
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </div>
                      )}
                    </div>
                  </Paper>
                </Grid>
                <Grid item xs={7}>
                  <Paper style={{ padding: 25 }} elevation={7}>
                    <Typography color="primary" align="center" variant="h4">
                      {t("printery.file-selection.header")}
                    </Typography>
                    <Divider />
                    <FilesSelection
                      printingOrder={printingOrder}
                      setPrintingOrder={setPrintingOrder}
                      contextAgency={contextAgency}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper style={{ padding: 25 }} elevation={7}>
                    <Typography color="primary" align="center" variant="h4">
                      {t("printery.receivers-addresses.header")}
                    </Typography>
                    <Divider />
                    <Grid
                      container
                      alignItems="center"
                      alignContent="center"
                      style={{ alignSelf: "center", padding: "25px" }}
                      spacing={3}
                    >
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        alignContent="center"
                        xs={12}
                        spacing={3}
                      >
                        <Grid item xs={12}>
                          <TextField
                            id="address.name"
                            fullWidth
                            required
                            variant="outlined"
                            label={t(
                              "printery.receivers-addresses.inputs.name"
                            )}
                            {...register("address.name", { required: true })}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            id="address.city"
                            fullWidth
                            required
                            variant="outlined"
                            label={t(
                              "printery.receivers-addresses.inputs.city"
                            )}
                            {...register("address.city", { required: true })}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            id="address.street"
                            fullWidth
                            required
                            variant="outlined"
                            label={t(
                              "printery.receivers-addresses.inputs.street"
                            )}
                            {...register("address.street", { required: true })}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            id="address.number"
                            fullWidth
                            required
                            variant="outlined"
                            label={t(
                              "printery.receivers-addresses.inputs.number"
                            )}
                            {...register("address.number", { required: true })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            id="address.description"
                            required
                            multiline
                            fullWidth
                            variant="outlined"
                            label={t(
                              "printery.receivers-addresses.inputs.description"
                            )}
                            {...register("address.description", {
                              required: true,
                            })}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper style={{ padding: 25 }} elevation={7}>
                    <Button
                        disabled={!(contextAgency?.works?.length > 0)}
                      type="submit"
                      fullWidth
                      color="primary"
                      variant="contained"
                    >
                      {t("printery.place-order-button")}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </form>
          ) : (
            <NoProjectSelectedView />
          )}{" "}
        </div>
      )}
    </div>
  );
}

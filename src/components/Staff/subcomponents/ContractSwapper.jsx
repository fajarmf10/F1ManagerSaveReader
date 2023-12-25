import {BasicInfoContext, DatabaseContext, MetadataContext} from "@/js/Contexts";
import {getDriverName} from "@/js/localization";
import {Autocomplete, Box, Button, Divider, Grid, Modal, TextField, Typography} from "@mui/material";
import * as React from "react";
import {useContext, useState} from "react";
import {assignRandomRaceNumber, fireDriverContract, getStaff} from "../commons/drivers";

export default function ContractSwapper(props) {
  const { swapRow, setSwapRow, refresh } = props;
  const database = useContext(DatabaseContext);
  const {version, gameVersion} = useContext(MetadataContext)
  const metadata = useContext(MetadataContext);
  const basicInfo = useContext(BasicInfoContext);

  const ctx = { database, version, basicInfo };
  const [swapDriver, setSwapDriver] = useState(null);
  if (!swapRow) return null;

  const [_, _drivers] = getStaff(ctx, swapRow.StaffType);

  /* swap contracts */
  const swapContracts = (staff1, staff2) => {

    const season = basicInfo.player.CurrentSeason;
    const staff1ID = staff1.StaffID;
    const staffType = staff1.StaffType;
    const staff2ID = staff2.StaffID;
    let results;

    /* contracts */
    database.exec(`UPDATE Staff_Contracts SET StaffID = ${staff1ID}, ContractType = 1, Accepted = 10 WHERE StaffID = ${staff2ID} AND ContractType = 0`);
    database.exec(`UPDATE Staff_Contracts SET StaffID = ${staff2ID}, ContractType = 1, Accepted = 10 WHERE StaffID = ${staff1ID} AND ContractType = 0`);

    database.exec(`UPDATE Staff_Contracts SET StaffID = ${staff1ID}, ContractType = 1, Accepted = 30 WHERE StaffID = ${staff2ID} AND ContractType = 3`);
    database.exec(`UPDATE Staff_Contracts SET StaffID = ${staff2ID}, ContractType = 1, Accepted = 30 WHERE StaffID = ${staff1ID} AND ContractType = 3`);

    database.exec(`UPDATE Staff_Contracts SET Accepted = 1, ContractType = 0 WHERE ContractType = 1 AND Accepted = 10`);
    database.exec(`UPDATE Staff_Contracts SET Accepted = 1, ContractType = 3 WHERE ContractType = 1 AND Accepted = 30`);

    if (staffType === 0) {
      let [{values: [[AssignedCarNumberA]]}] = database.exec(`SELECT AssignedCarNumber FROM Staff_DriverData WHERE StaffID = ${staff1ID}`);
      let [{values: [[AssignedCarNumberB]]}] = database.exec(`SELECT AssignedCarNumber FROM Staff_DriverData WHERE StaffID = ${staff2ID}`);

      /* car numbers */
      database.exec(`UPDATE Staff_DriverData SET AssignedCarNumber = :acn WHERE StaffID = ${staff2ID}`, {":acn": AssignedCarNumberA});
      database.exec(`UPDATE Staff_DriverData SET AssignedCarNumber = :acn WHERE StaffID = ${staff1ID}`, {":acn": AssignedCarNumberB});

      const driverPairs = [[staff1ID, staff2ID, AssignedCarNumberA], [staff2ID, staff1ID, AssignedCarNumberB]]
      for(const [A, B, acn] of driverPairs) {

        /* race engineers */
        results = database.exec(`SELECT RaceEngineerID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND DriverID = ${A}`);
        if (results.length) {
          let [{values: [[engineerA]]}] = results;
          database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE RaceEngineerID = ${engineerA} AND DriverID = ${A}`);

          /* check if paired before */
          results = database.exec(`SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE RaceEngineerID = ${engineerA} AND DriverID = ${B}`);
          if (results.length) {
            database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 3 WHERE RaceEngineerID = ${engineerA} AND DriverID = ${B}`);
          } else {
            database.exec(`INSERT INTO Staff_RaceEngineerDriverAssignments VALUES (${engineerA}, ${B}, 0, 50, 3)`);
          }
        }

        /* standings */
        // TODO: 3rd driver in F1 does not need to be included
        if (acn) {

          if (version === 2) {
            results = database.exec(`SELECT 1 FROM Races_DriverStandings WHERE DriverID = ${A} AND SeasonID = ${season}`);
            if (results.length) {
              for(let {values: [[RaceFormula]]} of results) {
                results = database.exec(`SELECT 1 FROM Races_DriverStandings WHERE DriverID = ${B} AND SeasonID = ${season}`);
                if (!results.length) { // to be added
                  let [{values: [[Position]]}] = database.exec(`SELECT MAX(Position) + 1 FROM Races_DriverStandings WHERE SeasonID = ${season}`);
                  database.exec(`INSERT INTO Races_DriverStandings VALUES (${season}, ${B}, 0, ${Position}, 0, 0)`);
                }
              }
            }
          } else {
            results = database.exec(`SELECT RaceFormula FROM Races_DriverStandings WHERE DriverID = ${A} AND SeasonID = ${season}`);
            if (results.length) {
              for(let {values: [[RaceFormula]]} of results) {
                results = database.exec(`SELECT RaceFormula FROM Races_DriverStandings WHERE DriverID = ${B} AND SeasonID = ${season} AND RaceFormula = ${RaceFormula}`);
                if (!results.length) { // to be added
                  let [{values: [[Position]]}] = database.exec(`SELECT MAX(Position) + 1 FROM Races_DriverStandings WHERE SeasonID = ${season} AND RaceFormula = ${RaceFormula}`);
                  database.exec(`INSERT INTO Races_DriverStandings VALUES (${season}, ${B}, 0, ${Position}, 0, 0, ${RaceFormula})`);
                }
              }
            }
          }
        }
      }

      database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE IsCurrentAssignment = 3`);
    } else if (staffType === 2) { // race engineer
      const raceEngineerPairs = [[staff1ID, staff2ID], [staff2ID, staff1ID]]
      for(const [A, B] of raceEngineerPairs) {
        /* race engineers */
        results = database.exec(`SELECT DriverID FROM Staff_RaceEngineerDriverAssignments WHERE IsCurrentAssignment = 1 AND RaceEngineerID = ${A}`);
        if (results.length) {
          let [{values: [[engineerA]]}] = results;
          database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 0 WHERE DriverID = ${engineerA} AND RaceEngineerID = ${A}`);
          /* check if paired before */
          results = database.exec(`SELECT DaysTogether FROM Staff_RaceEngineerDriverAssignments WHERE DriverID = ${engineerA} AND RaceEngineerID = ${B}`);
          if (results.length) {
            database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 3 WHERE DriverID = ${engineerA} AND RaceEngineerID = ${B}`);
          } else {
            database.exec(`INSERT INTO Staff_RaceEngineerDriverAssignments VALUES (${B}, ${engineerA}, 0, 50, 3)`);
          }
        }
      }
      database.exec(`UPDATE Staff_RaceEngineerDriverAssignments SET IsCurrentAssignment = 1 WHERE IsCurrentAssignment = 3`);
    }
  }



  return (
    <Modal
      open={swapRow}
      onClose={() => setSwapRow(null)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#333',
        border: '2px solid #000',
        boxShadow: 24,
        padding: 15,
        borderRadius: 20,
      }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Contract Swap for {getDriverName(swapRow)}
        </Typography>

        <Divider variant="fullWidth" sx={{ my: 2 }} />

        <Grid direction="row-reverse" container spacing={1}>
          <Grid item>
            <Button color="warning" variant="contained" sx={{ m: 1 }} onClick={() => {
              if (swapDriver && (swapRow.StaffID !== swapDriver.id)) {
                if (swapRow.StaffType === 0 && !swapDriver.number) {
                  assignRandomRaceNumber(ctx, swapDriver.id);
                }
                if (swapRow.StaffType === swapRow.StaffType) {
                  swapContracts(swapRow, swapDriver.driver);
                }
                refresh();
              }
            }} disabled={!swapDriver || (swapRow.StaffID === swapDriver.id)}>Swap</Button>
          </Grid>
          <Grid item>
          </Grid>
          <Grid item style={{ flex: 1 }}>
            <Autocomplete
              disablePortal
              options={_drivers.filter(x => x.StaffID !== swapRow.StaffID).map(r => ({
                label: getDriverName(r), id: r.StaffID, number: r.CurrentNumber, driver: r
              }))}
              value={swapDriver}
              sx={{ width: 240, m: 0, display: "inline-block" }}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              onChange={ (e, nv) => setSwapDriver(nv)}
              renderInput={(params) => <TextField {...params} label="Swap with" autoComplete="off" />}
            />
          </Grid>
        </Grid>
        <Divider variant="fullWidth" sx={{ my: 2 }} />
        <div style={{ margin: 10 }}>
          <Button color="error" variant="contained" onClick={() => {
            fireDriverContract(ctx, swapRow.StaffID);
            refresh();
          }}>Fire {getDriverName(swapRow)}</Button>
        </div>
      </Box>
    </Modal>
  )
}
import {Button, Divider, Typography} from "@mui/material";
import * as React from "react";
import {dump, repack} from "../../js/fileAnalyzer";
import ContractView from "../Modding/Contracts";
import DriverView from "../Modding/Drivers";
import DataBrowser from "../Modding/SQL";
import Toolbox from "../Modding/Toolbox";
import {VTabs} from "../Tabs";


export default function Modding({ database, basicInfo, metadata }) {
  const { player } = basicInfo;

  return (
    <div>
      <Typography variant="h5" component="h5">
        Database Modding
      </Typography>
      <Typography variant="p" component="p" sx={{ color: "orange" }}>
        Use at your own risk. Always make a backup before changing anything.
      </Typography>
      <Divider variant="fullWidth" sx={{ my: 2 }} />
      <Button color="warning" variant="contained" sx={{ mr: 2 }} onClick={() => repack(database, metadata)}>Re-export Savefile</Button>
      <Button variant="contained" sx={{ mr: 2 }} onClick={() => dump(database, metadata)}>Dump Database</Button>
      <Divider variant="fullWidth" sx={{ my: 2 }} />
      <VTabs options={[
        {name: "Driver Database", tab: <DriverView database={database} metadata={metadata} basicInfo={basicInfo} />},
        // {name: "Contracts", tab: <ContractView database={database} metadata={metadata} basicInfo={basicInfo} />},
        {name: "Data Browser", tab: <DataBrowser database={database} metadata={metadata} basicInfo={basicInfo} />},
        {name: "Tools / Cheats", tab: <Toolbox database={database} metadata={metadata} basicInfo={basicInfo} />},
      ]} />

    </div>
  );
}
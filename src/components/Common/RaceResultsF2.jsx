import {Divider, Typography} from "@mui/material";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {yearToDateRange} from "../../js/localization";
import {BasicInfoContext, DatabaseContext, MiscContext, VersionContext} from "../Contexts";
import ResultsTable from "./subcomponents/ResultsTable";


export default function RaceResultsF2() {

  const database = useContext(DatabaseContext);
  const version = useContext(VersionContext);
  const basicInfo = useContext(BasicInfoContext);
  const misc = useContext(MiscContext);

  const { driverMap, player } = basicInfo;

  const [championDriverID, setChampionDriverID] = useState(0);
  const [raceSchedule, setRaceSchedule] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [driverResults, setDriverResults] = useState([]);
  const [driverTeams, setDriverTeams] = useState({});
  const [fastestLapOfRace, setFastestLapOfRace] = useState([]);

  const [formulae, setFormulae] = useState(2);

  const [season, setSeason] = useState(player.CurrentSeason);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    let seasonList = [];
    for(let s = player.StartSeason; s <= player.CurrentSeason; s++) {
      seasonList.push(s);
    }
    setSeasons(seasonList);
    setSeason(player.CurrentSeason);
  }, [player.CurrentSeason, player.StartSeason]);

  const teamNumbers = (
    formulae === 2
  ) ? (
    misc.has_hubert ? [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
      [11, 12],
      [14, 15],
      [16, 17],
      [18, 19],
      [20, 21],
      [22, 23],
    ] : [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
      [11, 12],
      [14, 15],
      [16, 17],
      [20, 21],
      [22, 23],
      [24, 25],
    ]
  ) : (
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [14, 15, 16],
      [17, 18, 19],
      [20, 21, 22],
      [23, 24, 25],
      [26, 27, 28],
      [29, 30, 31],
    ]
  )




  useEffect(() => {

    // let season = player.CurrentSeason;

    let columns, values;
    let results;

    let raceSchedule = [];
    [{ columns, values }] = database.exec(
      `select * from Races JOIN Races_Tracks ON Races.TrackID = Races_Tracks.TrackID WHERE SeasonID = ${season} AND IsF${formulae}Race = 1 order by Day ASC`
    );
    for(const r of values) {
      let race = {};
      r.map((x, _idx) => {
        race[columns[_idx]] = x;
      })
      raceSchedule.push({ type: "sprint", race, span: 0 })
      raceSchedule.push({ type: "feature", race, span: 2 })
    }

    let driverTeams = {};
    let driverResults = {};
    let driverStandings = [];
    let fastestLapOfRace = {};
    let polePositionPoints = {};
    let teamStandings = {};
    try {

      [{ columns, values }] = database.exec(
        `SELECT TeamID, Position FROM 'Races_TeamStandings' WHERE SeasonID = ${season - 1} AND RaceFormula = ${formulae}`
      );

      for(const [TeamID, Position] of values) {
        teamStandings[TeamID] = Position;
      }

      [{ columns, values }] = database.exec(
        version === 3 ?
          `SELECT * FROM 'Races_DriverStandings' WHERE SeasonID = ${season} AND RaceFormula = ${formulae} ORDER BY Position ASC` :
          `SELECT * FROM 'Races_DriverStandings' WHERE SeasonID = ${season} ORDER BY Position ASC`
      );



      for(const r of values) {
        let driverStanding = {};
        r.map((x, _idx) => {
          driverStanding[columns[_idx]] = x;
        });
        driverStandings.push(driverStanding);
      }


      results = database.exec(
        `SELECT RaceID, DriverID, ChampionshipPoints FROM 'Races_QualifyingResults' 
WHERE SeasonID = ${season} AND RaceFormula = ${formulae} AND QualifyingStage = 1 AND ChampionshipPoints > 0 ORDER BY RaceID ASC` // only F1 has Q3
      );
      if (results.length) {
        [{ columns, values }] = results;
        for(const [RaceID, DriverID, ChampionshipPoints] of values) {
          polePositionPoints[RaceID] = [DriverID, ChampionshipPoints]
        }
      }

      results = database.exec(
        `SELECT * FROM 'Races_FeatureRaceResults' WHERE SeasonID = ${season} AND RaceFormula = ${formulae} ORDER BY RaceID ASC`
      );
      if (results.length) {
        [{ columns, values }] = results;
        for(const r of values) {
          let raceResult = {};
          r.map((x, _idx) => {
            raceResult[columns[_idx]] = x;
          });
          if (!fastestLapOfRace[raceResult.RaceID] || fastestLapOfRace[raceResult.RaceID] > raceResult.FastestLap && raceResult.FastestLap > 0) {
            fastestLapOfRace[raceResult.RaceID] = raceResult.FastestLap
          }
          if (!driverResults[raceResult.DriverID]) {
            driverResults[raceResult.DriverID] = {
              feature: {},
              sprint: {},
            }
          }
          raceResult.Points = raceResult.ChampionshipPoints
          if (polePositionPoints[raceResult.RaceID] && polePositionPoints[raceResult.RaceID][0] === raceResult.DriverID) {
            raceResult.PolePositionPoints = polePositionPoints[raceResult.RaceID][1];
            raceResult.Points += polePositionPoints[raceResult.RaceID][1];
          }
          driverResults[raceResult.DriverID].feature[raceResult.RaceID] = raceResult;
          driverTeams[raceResult.DriverID] = raceResult.TeamID;
        }
      }


      try {
        [{columns, values}] = database.exec(
          `SELECT *, ChampionshipPoints as Points FROM 'Races_SprintResults' WHERE SeasonID = ${season} AND RaceFormula = ${formulae} ORDER BY RaceID ASC`
        );
        for (const r of values) {
          let raceResult = {};
          r.map((x, _idx) => {
            raceResult[columns[_idx]] = x;
          });
          if (!driverResults[raceResult.DriverID]) {
            driverResults[raceResult.DriverID] = {
              feature: {},
              sprint: {},
            }
          }
          driverResults[raceResult.DriverID].sprint[raceResult.RaceID] = raceResult;
          driverTeams[raceResult.DriverID] = raceResult.TeamID;
        }

        for(const d of driverStandings) {

          let [sd, ed] = yearToDateRange(season);

          d.DriverAssignedNumber = "N/A";

          if (season === player.CurrentSeason) {
            try {
              [{ columns, values }] = database.exec(
                `SELECT TeamID, PosInTeam FROM 'Staff_Contracts' WHERE StaffID = ${d.DriverID} AND ContractType = 0 AND StartDay <= ${sd} AND EndSeason >= ${season} ORDER BY StartDay DESC`
              );
              // console.log(`SELECT TeamID, PosInTeam FROM 'Staff_CareerHistory' WHERE StaffID = ${d.DriverID} AND EndDay <= ${e} ORDER BY StartDay DESC`);
              const [TeamID, Position] = values[0];
              const teamOrder = teamStandings[TeamID] - 1;
              if (!Position) {
                d.DriverAssignedNumber = teamNumbers[teamOrder].join("/");
              } else {
                d.DriverAssignedNumber = teamNumbers[teamOrder][Position - 1];
              }
              driverTeams[d.DriverID] = TeamID;
            } catch (e) {
              const TeamID = driverTeams[d.DriverID];
              const teamOrder = teamStandings[TeamID] - 1;
              d.DriverAssignedNumber = teamNumbers[teamOrder].join("/");
            }
          } else {
            try {
              [{ columns, values }] = database.exec(
                `SELECT TeamID, PosInTeam FROM 'Staff_CareerHistory' WHERE StaffID = ${d.DriverID} AND StartDay <= ${sd} AND EndDay >= ${ed} ORDER BY StartDay DESC`
              );
              // console.log(`SELECT TeamID, PosInTeam FROM 'Staff_CareerHistory' WHERE StaffID = ${d.DriverID} AND EndDay <= ${e} ORDER BY StartDay DESC`);
              const [TeamID, Position] = values[0];
              const teamOrder = teamStandings[TeamID] - 1;
              if (!Position) {
                d.DriverAssignedNumber = teamNumbers[teamOrder].join("/");
              } else {
                d.DriverAssignedNumber = teamNumbers[teamOrder][Position - 1];
              }
              driverTeams[d.DriverID] = TeamID;
            } catch (e) {
              const TeamID = driverTeams[d.DriverID];
              const teamOrder = teamStandings[TeamID] - 1;
              d.DriverAssignedNumber = teamNumbers[teamOrder].join("/");
            }
          }
        }

      } catch (e) {

      }



      setRaceSchedule(raceSchedule);
      setDriverStandings(driverStandings);
      setDriverResults(driverResults);
      setDriverTeams(driverTeams);
      setFastestLapOfRace(fastestLapOfRace);


    } catch (e) {
      console.error(e);
    }

  }, [database, season, formulae])

  return (
    <div>
      <Typography variant="h5" component="h5">
        Drivers Championship Overview for <FormControl variant="standard" sx={{ minWidth: 120, m: -0.5, p: -0.5, ml: 2 }}>
        <InputLabel id="demo-simple-select-standard-label">Season</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={season}
          onChange={(event) => setSeason(event.target.value)}
          label="Season"
        >
          {seasons.map(s => <MenuItem value={s} key={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
        <FormControl variant="standard" sx={{ minWidth: 120, m: -0.5, p: -0.5, ml: 2 }}>
          <InputLabel id="demo-simple-select-standard-label">Formulae</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={formulae}
            onChange={(event) => setFormulae(event.target.value)}
            label="Season"
          >
            <MenuItem value={2} key={2}>Formula 2</MenuItem>
            <MenuItem value={3} key={3}>Formula 3</MenuItem>
          </Select>
        </FormControl>
      </Typography>
      <Divider variant="fullWidth" sx={{ my: 2 }} />
      <div style={{ overflowX: "auto" }}>
        <ResultsTable
          version={version}
          {...{ driverTeams, formulae, championDriverID, raceSchedule, driverStandings, driverResults, fastestLapOfRace }}
        />
      </div>
    </div>
  );
}
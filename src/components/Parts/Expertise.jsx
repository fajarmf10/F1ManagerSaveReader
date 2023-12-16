import {Button, Tabs} from "@mui/material";
import Tab from "@mui/material/Tab";
import {DataGrid} from "@mui/x-data-grid";
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {teamNames} from "../../js/localization";
import {BasicInfoContext, DatabaseContext, MetadataContext, VersionContext} from "../Contexts";
import {PartStats2023} from "./consts";


const PartStatsList = {
  2: PartStats2023,
  3: PartStats2023
}

export default function ExpertiseView() {

  const database = useContext(DatabaseContext);
  const version = useContext(VersionContext);
  const metadata = useContext(MetadataContext);
  const basicInfo = useContext(BasicInfoContext);
  const [updated, setUpdated] = useState(0);
  const refresh = () => setUpdated(+new Date());

  const [partStats, setPartStats] = useState([]);
  const [partPanel, setPartPanel] = useState(1);

  const PartStatsListPage = PartStatsList[version][partPanel].stats;



  useEffect(() => {
    const partStats = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    try {
      let [{ columns, values }] = database.exec(
        version === 2 ? (
          `Select TeamID, PartType, StatID, Expertise, NextSeasonExpertise, SeasonStartExpertise from Parts_TeamExpertise`
        ) : (
          `Select TeamID, PartType, PartStat, Expertise, NextSeasonExpertise, SeasonStartExpertise from Parts_TeamExpertise`
        )
      );
      for(const r of values) {
        partStats[r[0] /* TeamID */ ]["stat_" + r[1] + "_" + r[2] /* PartStat */ ] = r[3];
        // partStats[r[0] /* TeamID */ ]["stat_" + r[1] + "_" + r[2] /* PartStat */ ] = r[4];
        partStats[r[0] /* TeamID */ ]["season_start_stat_" + r[1] + "_" + r[2] /* PartStat */ ] = r[5];
      }
      setPartStats(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
          teamIndex => ({
            id: teamIndex,
            TeamID: teamIndex,
            ...partStats[teamIndex]
          })
        )
      );

    } catch {

    }

  }, [database, updated])

  return (
    <div>
      <Tabs value={partPanel} onChange={(event, newValue) => {
        setPartPanel(newValue);
      }} aria-label="basic tabs example">
        {
          PartStatsList[version].map(p => (
            <Tab label={p.category} key={p.id} />
          ))
        }
      </Tabs>
      <DataGrid
        rows={partStats}
        getRowId={r => r.TeamID}
        onProcessRowUpdateError={e => console.error(e)}
        processRowUpdate={(newRow, oldRow) => {
          for (const stat of PartStatsListPage) {
            const [partType, partStat] = stat.id.split("_");

            database.exec(
              version === 2 ? (
                `UPDATE Parts_TeamExpertise SET Expertise = :value WHERE TeamID = :teamID AND PartType = :partType AND StatID = :partStat`
              ) : (
                `UPDATE Parts_TeamExpertise SET Expertise = :value WHERE TeamID = :teamID AND PartType = :partType AND PartStat = :partStat`
              ), {
              ":teamID": newRow.TeamID,
              ":value": newRow['stat_' + stat.id],
              ":partType": partType,
              ":partStat": partStat,
            })
          }
          refresh();
          return newRow;
        }}
        columns={[
          {
            field: 'id',
            headerName: "#",
            width: 50,
          },
          {
            field: 'TeamID',
            headerName: "Team",
            width: 120,
            renderCell: ({ value }) => {
              return (
                <div style={{color: `rgb(var(--team${value}-triplet)`}}>
                  {teamNames(value, metadata.version)}
                  <div>
                    <div style={{
                      width: 12, height: 12, borderRadius: 6,
                      display: "inline-block", marginRight: 3,
                      background: `var(--team${value}-fanfare1)`,
                    }}/>
                    <div style={{
                      width: 12, height: 12, borderRadius: 6,
                      display: "inline-block", marginRight: 3,
                      background: `var(--team${value}-fanfare2)`,
                    }}/>
                  </div>
                </div>
              )
            }
          },
          ...PartStatsListPage.filter(x => !x.hideInExpertise).map(stat => ({
            field: `stat_` + stat.id,
            headerName: stat.name,
            type: 'number',
            width: 140,
            valueGetter: ({value}) => Number(value).toFixed(stat.digits),
            renderCell: ({row, value}) => {
              const delta = value - row["season_start_stat_" + stat.id];
              return (
                <div style={{textAlign: "right", padding: 6, fontVariantNumeric: 'tabular-nums'}}>
                  <span>{Number(value).toFixed(stat.displayDigits)}</span>
                  <br />
                  {
                    (version !== 2 && delta) ? (
                      <span style={{
                        fontSize: "90%",
                        color: (stat.negative ? delta < 0 : delta >= 0) ? "lightgreen" : "pink"
                      }}>{
                        delta > 0 ? "▲" : "▼"
                      } {Number(Math.abs(delta)).toFixed(3)}</span>
                    ) : (
                      "-"
                    )
                  }
                </div>
              )
            },
            editable: true,
          })),
          {
            field: '_',
            headerName: '',
            flex: 1,
          },
          {
            field: '__',
            headerName: 'Commands',
            width: 140,
            renderCell: ({ row }) => {
              return (
                <div>
                  <Button variant="outlined" color="warning" onClick={
                    () => {
                      for (const stat of PartStatsListPage) {
                        const [partType, partStat] = stat.id.split("_");
                        database.exec(`UPDATE Parts_TeamExpertise SET Expertise = :value WHERE PartType = :partType AND PartStat = :partStat`, {
                          ":value": row['stat_' + stat.id],
                          ":partType": partType,
                          ":partStat": partStat,
                        })
                      }
                      refresh();
                    }
                  }>equalize</Button>
                </div>
              )
            }
          },
        ]}
        hideFooter
      />
    </div>
  );
}
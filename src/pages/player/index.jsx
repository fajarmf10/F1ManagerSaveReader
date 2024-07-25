import LogoEditor from "@/components/MyTeam/LogoEditor/LogoEditor";
import Preview from "@/components/MyTeam/Preview";
import Rename from "@/components/Player/Rename";
import TeamSwitch from "@/components/Player/TeamSwitch";
import TimeMachine from "@/components/Player/TimeMachine";
import {VTabs} from "@/components/Tabs";
import * as React from "react";

export default function Page() {

  return (
    <VTabs options={[
      {name: "Switch Teams", tab: <TeamSwitch />},
      {name: "Rename", tab: <Rename />},
      {name: "Time Machine", tab: <TimeMachine />},
    ]} />
  );
}

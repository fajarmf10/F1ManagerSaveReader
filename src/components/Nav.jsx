import Facilities from "@/pages/facilities";
import Finance from "@/pages/finance";
import Modding from "@/pages/modding";
import Parts from "@/components/Parts";
import Regulations from "@/pages/regulations";
import Results from "@/pages/results";
import Staff from "@/components/Staff/Staff";
import Weekend from "@/pages/weekend";
import {VTabs} from "./Tabs";
import People from "@/components/People/Staff";
import Customize from "@/components/Customize";
import PluginDev from "@/components/Plugin/PluginDev";
import Plugins from "@/components/Plugin/Plugins";

export default function MainNav() {
  return (
    <VTabs options={[
      {name: "Weekend", tab: <Weekend />},
      {name: "Customize", tab:  <Customize />},
      {name: "Results", tab: <Results />},
      {name: "Regulations", tab: <Regulations />},
      {name: "Finance", tab: <Finance />},
      {name: "People", tab: <People />},
      {name: "Staff", tab: <Staff />},
      {name: "Facilities", tab: <Facilities />},
      {name: "Parts", tab: <Parts />},
      {name: "Modding", tab: <Modding />},
      {name: "Plugins", tab: <Plugins />},
      {name: "Plugin Development", tab: <PluginDev />, devOnly: true},
    ]} />
  )
}
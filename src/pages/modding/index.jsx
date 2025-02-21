import MetadataEditor from "@/components/Modding/Metadata";
import * as React from "react";
import ReplaceDB from "@/components/Modding/ReplaceDB";
import DataBrowser from "@/components/Modding/SQL";
import Toolbox from "@/components/Modding/Toolbox";
import { VTabs } from "@/components/Tabs";
import ErrorBoundary from "@/components/Modding/ErrorBoundary";

export default function Page() {
  return (
    <VTabs
      options={[
        {
          name: "SQL Editor",
          tab: (
            <ErrorBoundary>
              <DataBrowser />
            </ErrorBoundary>
          ),
        },
        {
          name: "Replace Database",
          tab: (
            <ErrorBoundary>
              <ReplaceDB />
            </ErrorBoundary>
          ),
        },
        {
          name: "Metadata Editor",
          tab: (
            <ErrorBoundary>
              <MetadataEditor />
            </ErrorBoundary>
          ),
        },
        {
          name: "Toolbox",
          tab: (
            <ErrorBoundary>
              <Toolbox />
            </ErrorBoundary>
          ),
          devOnly: true,
        },
      ]}
    />
  );
}

import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { Router } from "./Router";

import "@mantine/notifications/styles.css";

import React from "react";
import { ReactFlowProvider } from "reactflow";
import { Notifications } from "@mantine/notifications";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { ConnectionStatusProvider } from "@/providers/ConnectionStatusProvider/ConnectionStatusProvider";
import { DialogProvider } from "@/providers/DialogProvider/DialogProvider";
import { MediaQueryProvider } from "@/providers/MediaQueryProvider/MediaQueryProvider";
import { MobileHeaderProvider } from "@/providers/PageTitleProvider/MobileHeaderProvider";
import { useServerSync } from "@/services/bookSyncService";
import { useNotesServerSync } from "@/services/noteSyncService";

function AppContent() {
  const { user } = useAuth();
  useServerSync(user?.token);
  useNotesServerSync(user?.token);

  return (
    <MantineProvider defaultColorScheme="light" datesLocale="ru">
      <Notifications />
      <DialogProvider>
        <MobileHeaderProvider>
          <ErrorBoundary>
            <ConnectionStatusProvider>
              <ReactFlowProvider>
                <MediaQueryProvider>
                  <Router />
                </MediaQueryProvider>
              </ReactFlowProvider>
            </ConnectionStatusProvider>
          </ErrorBoundary>
        </MobileHeaderProvider>
      </DialogProvider>
    </MantineProvider>
  );
}

export default function App() {
  return <AppContent />;
}

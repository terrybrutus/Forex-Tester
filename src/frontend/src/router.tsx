import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ScannerPage } from "@/pages/ScannerPage";
import { CurrencyStrengthPage } from "@/pages/CurrencyStrengthPage";
import { JournalPage } from "@/pages/JournalPage";
import { SettingsPage } from "@/pages/SettingsPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const scannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scanner",
  component: ScannerPage,
});

const strengthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/strength",
  component: CurrencyStrengthPage,
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journal",
  component: JournalPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  scannerRoute,
  strengthRoute,
  journalRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

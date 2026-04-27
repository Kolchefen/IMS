import { createBrowserRouter } from "react-router";
import Root from "./pages/root";
import Dashboard from "./pages/dashboard";
import Configuration from "./pages/configuration";
import ManualUpdate from "./pages/manual-update";
import ManifestReport from "./pages/manifest-report";

import InventoryReport from "./pages/inventory-report";
import RestoreInventory from "./pages/restore-inventory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "configuration", Component: Configuration },
      { path: "manual-update", Component: ManualUpdate },
      { path: "manifest-report", Component: ManifestReport },
      { path: "inventory-report", Component: InventoryReport },
      { path: "restore-inventory", Component: RestoreInventory },
    ],
  },
]);

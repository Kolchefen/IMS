import { createBrowserRouter } from "react-router";
import Root from "./pages/root";
import Dashboard from "./pages/dashboard";
import Configuration from "./pages/configuration";
import ManualUpdate from "./pages/manual-update";
import PurchaseManifest from "./pages/purchase-manifest";
import InventoryReport from "./pages/inventory-report";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "configuration", Component: Configuration },
      { path: "manual-update", Component: ManualUpdate },
      { path: "purchase-manifest", Component: PurchaseManifest },
      { path: "inventory-report", Component: InventoryReport },
    ],
  },
]);

import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { History } from "./pages/History";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/analytics",
    Component: Analytics,
  },
  {
    path: "/history",
    Component: History,
  },
]);
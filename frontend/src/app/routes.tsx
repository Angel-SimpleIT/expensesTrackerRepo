import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { RootRedirect } from "./components/RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RootRedirect,
  },
  {
    path: "/dashboard",
    Component: () => (
      <ProtectedRoute allowedRoles={['user']}>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    Component: () => (
      <ProtectedRoute allowedRoles={['user']}>
        <Layout>
          <History />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    Component: () => (
      <ProtectedRoute allowedRoles={['user']}>
        <Layout>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#09090b]">Chat Bot</h1>
            <p className="text-[#6B7280] mt-2">Chat interface coming soon...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    Component: () => (
      <ProtectedRoute allowedRoles={['admin_b2b']}>
        <Layout>
          <Analytics />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/insights",
    Component: () => (
      <ProtectedRoute allowedRoles={['admin_b2b']}>
        <Layout>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#09090b]">Market Insights</h1>
            <p className="text-[#6B7280] mt-2">Market insights dashboard coming soon...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/global-data",
    Component: () => (
      <ProtectedRoute allowedRoles={['admin_b2b']}>
        <Layout>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#09090b]">Global Data</h1>
            <p className="text-[#6B7280] mt-2">Global data dashboard coming soon...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    Component: () => (
      <ProtectedRoute allowedRoles={['admin_b2b']}>
        <Layout>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#09090b]">User Management</h1>
            <p className="text-[#6B7280] mt-2">User management dashboard coming soon...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    ),
  },
]);

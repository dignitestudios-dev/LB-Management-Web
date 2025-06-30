import Dashboard from "../../pages/app/Dashboard";
import UserDashboard from "../../pages/app/UserDashboard";


export const AppRoutes=[
       {
        url: "dashboard",
        page: <Dashboard />,
        name: "Dashboard",
        isPublic: true,
      },
       {
        url: "userdashboard",
        page: <UserDashboard />,
        name: "Dashboard",
        isPublic: true,
      },
]
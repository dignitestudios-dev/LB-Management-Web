import Dashboard from "../../pages/app/Dashboard";
import TimesheetTable from "../../pages/app/TimeSheet";
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
       {
        url: "timesheet",
        page: <TimesheetTable />,
        name: "Time Sheet",
        isPublic: true,
      },
]
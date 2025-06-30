import Dashboard from "../../pages/app/Dashboard";
import DummyLogin from "../../pages/authentication/DummyLogin";
import Login from "../../pages/authentication/Login";


export const AuthRoute=[
    {
        url: "login",
        page: <Login />,
        name: "Login",
        isPublic: true,
      },
      {
        url: "loginpage",
        page: <DummyLogin />,
        name: "Login Page",
        isPublic: true,
      },
       {
        url: "dashboard",
        page: <Dashboard />,
        name: "Dashboard",
        isPublic: true,
      },
]
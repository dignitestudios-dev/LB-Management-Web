import { Route, Routes } from "react-router";
import "./App.css";
import DummyHome from "./pages/app/DummyHome";
import DummyLogin from "./pages/authentication/DummyLogin";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/authentication/Login";
import { AppRoutes } from "./routes/app/AppRoutes";

function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={<Login/>}
      />

      <Route path="app">
        {AppRoutes?.map((Link , i) => (
          <Route path={Link.url} key={i} element={Link.page} />
        ))}
      </Route>
  

    
    </Routes>
  );
}

export default App;

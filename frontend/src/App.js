import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Dashboard from "./Components/Dashboard";
import MixiSubscription from "./Components/MixiSubscribe";
import MAISubscribe from "./Components/MAISubscribe";
import CreatePlan from "./Components/CreatePlan";
import EditWorkspace from "./Components/EditWorkspace";
import Admin from "./Components/Admin";
import { ToastProvider } from "./context/ToastContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./config/msalConfig";

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <MsalProvider instance={msalInstance}>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/mixi-subscribe" element={<MixiSubscription />} />
                <Route path="/mai-subscribe" element={<MAISubscribe />} />
                <Route path="/create-plan" element={<CreatePlan />} />
                <Route path="/edit-workspace/:id" element={<EditWorkspace />} />
              </Routes>
            </Router>
          </MsalProvider>
        </GoogleOAuthProvider>
      </ToastProvider>
    </div>
  );
}

export default App;

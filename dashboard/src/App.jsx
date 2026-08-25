import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Overview from "./pages/Overview";
import MLEngine from "./pages/MLEngine";
import AIDiagnosis from "./pages/AIDiagnosis";
import PolicyEngine from "./pages/PolicyEngine";
import Recovery from "./pages/Recovery";
import Analytics from "./pages/Analytics";
import Audit from "./pages/Audit";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <Sidebar />

        <main className="main">

          <Topbar />

          <div className="page-content">

            <Routes>

              <Route
                path="/"
                element={<Overview />}
              />

              <Route
                path="/ml"
                element={<MLEngine />}
              />

              <Route
                path="/ai"
                element={<AIDiagnosis />}
              />

              <Route
                path="/policy"
                element={<PolicyEngine />}
              />

              <Route
                path="/recovery"
                element={<Recovery />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              <Route
                path="/audit"
                element={<Audit />}
              />

            </Routes>

          </div>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;
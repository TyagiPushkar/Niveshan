import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/Login";
import Asset from "./scenes/asset";
import AssetDetail from "./scenes/asset/AssetDetail";
import AddAsset from "./scenes/form/AddAsset";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <div className="app">
          {/* Define routes and conditionally render Sidebar and Topbar */}
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* All other routes render Sidebar and Topbar */}
            <Route
              path="*"
              element={
                <>
                  <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                    <Sidebar isSidebar={isSidebarCollapsed} setIsSidebar={setIsSidebarCollapsed} />
                  </div>
                  <main className="content" style={{marginBottom:"50px"}}>
                    <Topbar setIsSidebar={setIsSidebarCollapsed} />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/asset" element={<Asset />} />
                      <Route path="/asset/:assetId" element={<AssetDetail />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/add-employee" element={<Form />} />
                      <Route path="/add-asset" element={<AddAsset />} />
                      <Route path="/bar" element={<Bar />} />
                      <Route path="/pie" element={<Pie />} />
                      <Route path="/line" element={<Line />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/geography" element={<Geography />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

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
import ProtectedRoute from "./ProtectedRoute"; // Import the ProtectedRoute component

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <div className="app">
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
                  <main className="content" style={{ marginBottom: "50px" }}>
                    <Topbar setIsSidebar={setIsSidebarCollapsed} />
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/team" 
                        element={
                          <ProtectedRoute>
                            <Team />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/asset" 
                        element={
                          <ProtectedRoute>
                            <Asset />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/asset/:assetId" 
                        element={
                          <ProtectedRoute>
                            <AssetDetail />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/contacts" 
                        element={
                          <ProtectedRoute>
                            <Contacts />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/invoices" 
                        element={
                          <ProtectedRoute>
                            <Invoices />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/add-employee" 
                        element={
                          <ProtectedRoute>
                            <Form />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/add-asset" 
                        element={
                          <ProtectedRoute>
                            <AddAsset />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/bar" 
                        element={
                          <ProtectedRoute>
                            <Bar />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/pie" 
                        element={
                          <ProtectedRoute>
                            <Pie />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/line" 
                        element={
                          <ProtectedRoute>
                            <Line />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/faq" 
                        element={
                          <ProtectedRoute>
                            <FAQ />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/calendar" 
                        element={
                          <ProtectedRoute>
                            <Calendar />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/geography" 
                        element={
                          <ProtectedRoute>
                            <Geography />
                          </ProtectedRoute>
                        } 
                      />
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

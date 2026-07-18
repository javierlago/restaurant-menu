import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import AdminDashboard from './pages/AdminDashboard';
import { MenuProvider } from './context/MenuContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfigProvider } from './context/ConfigContext';
import { NotificationProvider } from './context/NotificationContext';
import { LocaleProvider } from './context/LocaleContext';

function AuthHashRedirect() {
  const location = useLocation();
  if (location.pathname === '/' && /type=(invite|recovery)/.test(location.hash)) {
    return <Navigate to={`/admin${location.hash}`} replace />;
  }
  return null;
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <LocaleProvider>
          <ConfigProvider>
            <ThemeProvider>
              <MenuProvider>
                <Layout>
                  <AuthHashRedirect />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:id" element={<CategoryView />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </Layout>
              </MenuProvider>
            </ThemeProvider>
          </ConfigProvider>
        </LocaleProvider>
      </NotificationProvider>
    </Router>
  )
}

export default App

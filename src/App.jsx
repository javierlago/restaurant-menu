import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import AdminDashboard from './pages/AdminDashboard';
import { MenuProvider } from './context/MenuContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <MenuProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:id" element={<CategoryView />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </MenuProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

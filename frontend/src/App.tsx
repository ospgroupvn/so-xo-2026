// Main Application Entry
// React app with routing

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="text-xl font-bold text-foreground">
                Xổ Số Max 3D+
              </Link>
              <div className="flex items-center gap-6">
                <NavLink to="/register">Đăng Ký</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/admin">Admin</NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            Hệ Thống Theo Dõi Xổ Số Max 3D+ &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// Navigation Link Component
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

export default App;

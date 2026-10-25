import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../pages/auth/Login';
import ChangePassword from '../pages/auth/ChangePassword';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageVolunteers from '../pages/admin/ManageVolunteers';
import ManageActivities from '../pages/admin/ManageActivities';
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import Applicants from '../pages/supervisor/Applicants';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import AvailableSessions from '../pages/volunteer/AvailableSessions';
import Unauthorized from '../pages/Unauthorized';

export const AppRoutes = () => {
  const { user, token, fetchUser } = useAuth();

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ====== مسار تغيير كلمة المرور (متاح للجميع مؤقتاً للتجربة) ====== */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* الهيكل الموحد لكل الأدوار */}
        <Route element={<DashboardLayout />}>
          
          {/* مسارات المدير */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/volunteers" element={<ManageVolunteers />} />
            <Route path="/admin/activities" element={<ManageActivities />} />
          </Route>

          {/* مسارات المشرف */}
          <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/applicants" element={<Applicants />} />
          </Route>

          {/* مسارات المتطوع */}
          <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}>
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/sessions" element={<AvailableSessions />} />
          </Route>

        </Route>

        {/* التوجيه الافتراضي */}
        <Route path="*" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
          user.role === 'supervisor' ? <Navigate to="/supervisor/dashboard" /> :
          <Navigate to="/volunteer/dashboard" />
        } />
      </Routes>
    </BrowserRouter>
  );
};
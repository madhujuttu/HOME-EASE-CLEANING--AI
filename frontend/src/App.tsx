import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CrmProvider, useCrm } from './context/CrmContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Admin / Manager Pages
import { Overview } from './pages/admin/Overview';
import { LeadManagement } from './pages/admin/LeadManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { SalesManagement } from './pages/admin/SalesManagement';
import { MeetingManagement } from './pages/admin/MeetingManagement';
import { AICallingCenter } from './pages/admin/AICallingCenter';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { ProviderManagement } from './pages/admin/ProviderManagement';
import { BookingManagement } from './pages/admin/BookingManagement';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { AIIntelligenceCenter } from './pages/admin/AIIntelligenceCenter';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { SettingsPage } from './pages/admin/SettingsPage';

// Sales Employee Pages
import { SalesDashboard } from './pages/sales/SalesDashboard';
import { SalesLeads } from './pages/sales/SalesLeads';
import { SalesCustomers } from './pages/sales/SalesCustomers';
import { SalesMeetings } from './pages/sales/SalesMeetings';
import { SalesFollowUps } from './pages/sales/SalesFollowUps';
import { SalesAICalling } from './pages/sales/SalesAICalling';
import { SalesCallHistory } from './pages/sales/SalesCallHistory';
import { SalesMeetingIntelligence } from './pages/sales/SalesMeetingIntelligence';
import { SalesCopilot } from './pages/sales/SalesCopilot';
import { SalesTasks } from './pages/sales/SalesTasks';
import { SalesNotifications } from './pages/sales/SalesNotifications';
import { SalesPerformance } from './pages/sales/SalesPerformance';

// Customer Portal Pages
import { CustomerHome } from './pages/customer/CustomerHome';
import { CustomerServices } from './pages/customer/CustomerServices';
import { CustomerEnquiries } from './pages/customer/CustomerEnquiries';
import { CustomerAppointments } from './pages/customer/CustomerAppointments';
import { CustomerBookings } from './pages/customer/CustomerBookings';
import { CustomerAIAssistant } from './pages/customer/CustomerAIAssistant';
import { CustomerPayments } from './pages/customer/CustomerPayments';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Authentication & Login Pages
import { StandardLogin } from './pages/auth/StandardLogin';
import { SignupPage } from './pages/auth/SignupPage';
import { AdminLogin } from './pages/auth/AdminLogin';

const RootRedirect: React.FC = () => {
  const { role, isAuthenticated } = useCrm();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'customer') return <Navigate to="/customer/home" replace />;
  if (role === 'sales') return <Navigate to="/sales/dashboard" replace />;
  return <Navigate to="/admin/overview" replace />;
};

export const App: React.FC = () => {
  return (
    <CrmProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Gateways */}
          {/* Dedicated separate login for admin only */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Standard login for all other users (Customer, Sales, Provider) */}
          <Route path="/login" element={<StandardLogin />} />
          <Route path="/sales/login" element={<StandardLogin />} />
          <Route path="/login/sales" element={<StandardLogin />} />
          <Route path="/customer/login" element={<StandardLogin />} />
          <Route path="/login/customer" element={<StandardLogin />} />

          {/* Dedicated signup screen for Customer, Sales, and Provider with custom properties */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/customer/register" element={<SignupPage />} />

          <Route path="/" element={<RootRedirect />} />

          {/* Unified App Layout */}
          <Route element={<DashboardLayout />}>
            {/* Admin and Manager Routes */}
            <Route path="/admin/overview" element={<Overview />} />
            <Route path="/admin/leads" element={<LeadManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/sales" element={<SalesManagement />} />
            <Route path="/admin/meetings" element={<MeetingManagement />} />
            <Route path="/admin/ai-calling" element={<AICallingCenter />} />
            <Route path="/admin/services" element={<ServiceManagement />} />
            <Route path="/admin/providers" element={<ProviderManagement />} />
            <Route path="/admin/bookings" element={<BookingManagement />} />
            <Route path="/admin/payments" element={<PaymentManagement />} />
            <Route path="/admin/ai-intelligence" element={<AIIntelligenceCenter />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/reports" element={<ReportsAnalytics />} />
            <Route path="/admin/settings" element={<SettingsPage />} />

            {/* Sales Employee Workspace Routes */}
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/leads" element={<SalesLeads />} />
            <Route path="/sales/customers" element={<SalesCustomers />} />
            <Route path="/sales/meetings" element={<SalesMeetings />} />
            <Route path="/sales/follow-ups" element={<SalesFollowUps />} />
            <Route path="/sales/ai-calling" element={<SalesAICalling />} />
            <Route path="/sales/call-history" element={<SalesCallHistory />} />
            <Route path="/sales/meeting-intelligence" element={<SalesMeetingIntelligence />} />
            <Route path="/sales/copilot" element={<SalesCopilot />} />
            <Route path="/sales/tasks" element={<SalesTasks />} />
            <Route path="/sales/notifications" element={<SalesNotifications />} />
            <Route path="/sales/performance" element={<SalesPerformance />} />

            {/* Customer Portal Routes */}
            <Route path="/customer/home" element={<CustomerHome />} />
            <Route path="/customer/services" element={<CustomerServices />} />
            <Route path="/customer/enquiries" element={<CustomerEnquiries />} />
            <Route path="/customer/appointments" element={<CustomerAppointments />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
            <Route path="/customer/assistant" element={<CustomerAIAssistant />} />
            <Route path="/customer/payments" element={<CustomerPayments />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </CrmProvider>
  );
};

export default App;

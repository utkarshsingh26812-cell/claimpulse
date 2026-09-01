import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { CreateClaimPage } from '@/pages/CreateClaimPage';
import { ClaimDetailsPage } from '@/pages/ClaimDetailsPage';
import { BatchIntelligencePage } from '@/pages/BatchIntelligencePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AIActivityPage } from '@/pages/AIActivityPage';

function ProtectedRoutes() {
  const { user } = useApp();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/claims/new" element={<CreateClaimPage />} />
        <Route path="/claims/:id" element={<ClaimDetailsPage />} />
        <Route path="/batch" element={<BatchIntelligencePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/activity" element={<AIActivityPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ProtectedRoutes />
      </HashRouter>
    </AppProvider>
  );
}

export default App;

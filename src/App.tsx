import { lazy, Suspense, useState } from 'react';
import { AppShell } from './components/shell/AppShell';
import { Header } from './components/shell/Header';
import { BottomNav } from './components/shell/BottomNav';
import { GarageSwitcher } from './components/shell/GarageSwitcher';
import { Toast } from './components/Toast';
import { ServiceSheet } from './components/maintenance/ServiceSheet';
import { BikeProvider, useBikes } from './state/BikeContext';
import { ToastProvider } from './state/ToastContext';
import { LogFuelSheet } from './components/costs/LogFuelSheet';
import { BackupSheet } from './components/vault/BackupSheet';
import { InstallBanner } from './components/InstallBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { BackupReminderBanner } from './components/BackupReminderBanner';
import { useSWUpdate } from './state/swUpdate';

const DashboardTab = lazy(() => import('./components/dashboard/DashboardTab').then((m) => ({ default: m.DashboardTab })));
const MaintenanceTab = lazy(() => import('./components/maintenance/MaintenanceTab').then((m) => ({ default: m.MaintenanceTab })));
const ModsTab = lazy(() => import('./components/mods/ModsTab').then((m) => ({ default: m.ModsTab })));
const CostsTab = lazy(() => import('./components/costs/CostsTab').then((m) => ({ default: m.CostsTab })));
const VaultTab = lazy(() => import('./components/vault/VaultTab').then((m) => ({ default: m.VaultTab })));

export type TabType = 'dash' | 'maint' | 'mods' | 'cost' | 'vault';

function TabFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-20" role="status" aria-label="Loading">
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin motion-reduce:animate-none" />
    </div>
  );
}

function AppBody() {
  const [activeTab, setActiveTab] = useState<TabType>('dash');
  const { needRefresh, applyUpdate } = useSWUpdate();
  const {
    activeBike, serviceSheet, closeServiceSheet, logFuelSheet, closeLogFuelSheet,
    backupSheetOpen, openBackupSheet, closeBackupSheet,
  } = useBikes();

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <DashboardTab onNavigate={setActiveTab} />;
      case 'maint': return <MaintenanceTab />;
      case 'mods': return <ModsTab />;
      case 'cost': return <CostsTab />;
      case 'vault': return <VaultTab />;
      default: return null;
    }
  };

  return (
    <AppShell>
      <Header />
      <main className="flex-1 overflow-y-auto p-[14px] pb-[22px] flex flex-col gap-[14px]">
        <Suspense fallback={<TabFallback />}>
          {renderContent()}
        </Suspense>
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <GarageSwitcher />
      <ServiceSheet
        open={serviceSheet.open}
        onClose={closeServiceSheet}
        bike={activeBike}
        initialPartKey={serviceSheet.partKey}
        editing={serviceSheet.editing}
      />
      <LogFuelSheet open={logFuelSheet.open} onClose={closeLogFuelSheet} bike={activeBike} editing={logFuelSheet.editing} />
      <BackupSheet open={backupSheetOpen} onClose={closeBackupSheet} />
      <InstallBanner suppressed={needRefresh} />
      <UpdateBanner needRefresh={needRefresh} applyUpdate={applyUpdate} />
      <BackupReminderBanner suppressed={needRefresh} onOpenBackup={openBackupSheet} />
      <Toast />
    </AppShell>
  );
}

function App() {
  return (
    <ToastProvider>
      <BikeProvider>
        <AppBody />
      </BikeProvider>
    </ToastProvider>
  );
}

export default App;

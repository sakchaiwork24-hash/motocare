import { useState } from 'react';
import { AppShell } from './components/shell/AppShell';
import { Dashboard } from './components/dashboard/Dashboard';
import { MaintenanceTab } from './components/maintenance/MaintenanceTab';
import { Header } from './components/shell/Header';
import { BottomNav } from './components/shell/BottomNav';
import { GarageSwitcher } from './components/shell/GarageSwitcher';
import { Toast } from './components/Toast';
import { ServiceSheet } from './components/maintenance/ServiceSheet';
import { BikeProvider } from './state/BikeContext';
import { ToastProvider } from './state/ToastContext';
import { CostsTab } from './components/costs/CostsTab';
import { LogFuelSheet } from './components/costs/LogFuelSheet';
import { ModsTab } from './components/mods/ModsTab';
import { VaultTab } from './components/vault/VaultTab';
import { InstallBanner } from './components/InstallBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { useSWUpdate } from './state/swUpdate';

export type TabType = 'dash' | 'maint' | 'mods' | 'cost' | 'vault';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dash');
  const { needRefresh, applyUpdate } = useSWUpdate();

  const renderContent = () => {
    switch (activeTab) {
      case 'dash': return <Dashboard onNavigate={setActiveTab} />;
      case 'maint': return <MaintenanceTab />;
      case 'mods': return <ModsTab />;
      case 'cost': return <CostsTab />;
      case 'vault': return <VaultTab />;
      default: return null;
    }
  };

  return (
    <ToastProvider>
      <BikeProvider>
        <AppShell>
          <Header />
          <main className="flex-1 overflow-y-auto p-[14px] pb-[22px] flex flex-col gap-[14px]">
            {renderContent()}
          </main>
          <BottomNav activeTab={activeTab} onChange={setActiveTab} />
          <GarageSwitcher />
          <ServiceSheet />
          <LogFuelSheet />
          <InstallBanner suppressed={needRefresh} />
          <UpdateBanner needRefresh={needRefresh} applyUpdate={applyUpdate} />
          <Toast />
        </AppShell>
      </BikeProvider>
    </ToastProvider>
  );
}

export default App;

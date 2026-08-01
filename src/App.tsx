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

export type TabType = 'dash' | 'maint' | 'mods' | 'cost' | 'vault';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dash');

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
    <BikeProvider>
      <ToastProvider>
        <AppShell>
          <Header />
          <main className="flex-1 overflow-y-auto p-[14px] pb-[22px] flex flex-col gap-[14px]">
            {renderContent()}
            {/* Placeholder blocks to enable scrolling */}
            {activeTab !== 'dash' && activeTab !== 'maint' && activeTab !== 'mods' && activeTab !== 'cost' && activeTab !== 'vault' && Array.from({ length: 15 }).map((_, i) => (
               <div key={i} className="min-h-[76px] bg-surface border border-border rounded-16 p-4 text-ink-400 font-sans flex items-center justify-center">
                 Scroll placeholder {i + 1}
               </div>
            ))}
          </main>
          <BottomNav activeTab={activeTab} onChange={setActiveTab} />
          <GarageSwitcher />
          <ServiceSheet />
          <LogFuelSheet />
          <InstallBanner />
          <Toast />
        </AppShell>
      </ToastProvider>
    </BikeProvider>
  );
}

export default App;

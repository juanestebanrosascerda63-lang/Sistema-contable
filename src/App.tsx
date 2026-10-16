import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { TopBar } from './components/layout/TopBar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { SystemNotificationDrawer } from './components/layout/SystemNotificationDrawer';
import { AuthLogin } from './components/modules/AuthLogin';
import { MainHub } from './components/modules/MainHub';
import { SIISyncModule } from './components/modules/SIISyncModule';
import { AccountingModule } from './components/modules/AccountingModule';
import { TaxesAndClosingModule } from './components/modules/TaxesAndClosingModule';
import { FinancialStatementsIFRS } from './components/modules/FinancialStatementsIFRS';
import { PayrollModule } from './components/modules/PayrollModule';
import { SalesAndDTEModule } from './components/modules/SalesAndDTEModule';
import { LogisticsAndStockModule } from './components/modules/LogisticsAndStockModule';
import { ClientPortalModule } from './components/modules/ClientPortalModule';
import { ConstructionModule } from './components/modules/ConstructionModule';
import { CashFlowModule } from './components/modules/CashFlowModule';
import { FixedAssetsModule } from './components/modules/FixedAssetsModule';
import { DTEModal } from './components/modals/DTEModal';
import { JournalEntryModal } from './components/modals/JournalEntryModal';
import { PayslipModal } from './components/modals/PayslipModal';

const AppContent: React.FC = () => {
  const { isLoggedIn, activeRealm } = useERP();

  if (!isLoggedIn || activeRealm === 'login') {
    return <AuthLogin />;
  }

  const renderActiveModule = () => {
    switch (activeRealm) {
      case 'hub':
        return <MainHub />;
      case 'sii':
        return <SIISyncModule />;
      case 'contabilidad':
      case 'config_contabilidad':
      case 'gestion_bancaria':
      case 'oblig_pagar':
      case 'oblig_cobrar':
        return <AccountingModule />;
      case 'flujo_caja':
        return <CashFlowModule />;
      case 'activo_fijo':
        return <FixedAssetsModule />;
      case 'impuestos':
        return <TaxesAndClosingModule />;
      case 'eeff':
        return <FinancialStatementsIFRS />;
      case 'remuneraciones':
        return <PayrollModule />;
      case 'ventas':
        return <SalesAndDTEModule />;
      case 'logistica':
        return <LogisticsAndStockModule />;
      case 'portal_cliente':
        return <ClientPortalModule />;
      case 'construccion':
        return <ConstructionModule />;
      default:
        return <MainHub />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col text-slate-800">
      <TopBar />
      <Breadcrumbs />
      
      <main className="flex-1 pb-16">
        {renderActiveModule()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0E0E0] py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            MUERRO / Tributa Educa ERP · Adaptado a la normativa SII, Dirección del Trabajo y Normas IFRS
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            Sincronización RCV 6 Horas · Timbre Electrónico DTE Certificado
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <DTEModal />
      <JournalEntryModal />
      <PayslipModal />

      {/* Floating System Notification Banner Drawer */}
      <SystemNotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <AppContent />
    </ERPProvider>
  );
}

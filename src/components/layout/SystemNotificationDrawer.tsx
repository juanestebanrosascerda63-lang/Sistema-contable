import React from 'react';
import { useERP } from '../../context/ERPContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const SystemNotificationDrawer: React.FC = () => {
  const { notifications, dismissNotification } = useERP();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-50 max-w-md w-full space-y-2 pointer-events-none no-print">
      {notifications.slice(0, 3).map((notif) => {
        const iconMap = {
          info: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
          alert: <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
        };

        const bgMap = {
          info: 'bg-white border-blue-200 text-slate-800 shadow-lg',
          warning: 'bg-amber-50 border-amber-300 text-amber-950 shadow-lg',
          success: 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-lg',
          alert: 'bg-red-50 border-red-300 text-red-950 shadow-lg',
        };

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 text-xs rounded-lg border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${bgMap[notif.type]}`}
          >
            {iconMap[notif.type]}
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-relaxed">{notif.message}</p>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                {notif.timestamp}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

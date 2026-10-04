import React, { useState } from 'react';
import { X, CheckCheck, AlertCircle, AlertTriangle, Info, Bell, Check } from 'lucide-react';
import { NotificationItem } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.severity === 'urgent';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-slate-900 border-s border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t('notifications')}</h3>
              <p className="text-[11px] text-slate-400">Compliance & Operations Alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              title={t('markAllRead')}
              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:text-white"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t('markAllRead')}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-2.5 bg-slate-950/30 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filter === 'all' ? 'bg-emerald-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filter === 'unread' ? 'bg-emerald-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filter === 'urgent' ? 'bg-emerald-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Urgent ({notifications.filter((n) => n.severity === 'urgent').length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t('noNotifications')}
            </div>
          ) : (
            filtered.map((item) => {
              const isUrgent = item.severity === 'urgent';
              const isWarning = item.severity === 'warning';

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3.5 transition-all space-y-2 ${
                    item.read
                      ? 'border-slate-800/80 bg-slate-950/40 opacity-75'
                      : isUrgent
                      ? 'border-rose-500/30 bg-rose-950/20'
                      : isWarning
                      ? 'border-amber-500/30 bg-amber-950/20'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isUrgent ? (
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-sky-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => onMarkRead(item.id)}
                        title="Mark read"
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <span className="uppercase">{item.entityType}: {item.entityId}</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

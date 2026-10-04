import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Bus, User, FileText, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (category: string, item: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    vehicles: any[];
    drivers: any[];
    contracts: any[];
    trips: any[];
    invoices: any[];
  }>({
    vehicles: [],
    drivers: [],
    contracts: [],
    trips: [],
    invoices: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ vehicles: [], drivers: [], contracts: [], trips: [], invoices: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally or trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ vehicles: [], drivers: [], contracts: [], trips: [], invoices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchGlobal(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.vehicles.length +
    results.drivers.length +
    results.contracts.length +
    results.trips.length +
    results.invoices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 bg-slate-900/90">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fleet (e.g. BUS-1002), drivers (Ahmed), contracts, routes..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>Type at least 2 characters to search across the enterprise database.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300">
                  BUS-1001
                </span>
                <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300">
                  King Saud
                </span>
                <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300">
                  Al-Mutairi
                </span>
                <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300">
                  TRP-2026
                </span>
              </div>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vehicles */}
              {results.vehicles.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Vehicles & Buses ({results.vehicles.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectResult('vehicle', v);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bus className="h-4 w-4 text-emerald-400" />
                          <div>
                            <span className="text-xs font-semibold text-white font-mono">
                              {v.vehicleNumber}
                            </span>
                            <span className="text-xs text-slate-400 ms-2 font-mono">
                              ({v.plateNumber})
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {v.make} {v.model} · {v.branchName} · Driver: {v.assignedDriverName || 'None'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers */}
              {results.drivers.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Drivers & Operators ({results.drivers.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.drivers.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onSelectResult('driver', d);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-sky-400" />
                          <div>
                            <span className="text-xs font-semibold text-white">{d.name}</span>
                            <span className="text-xs text-slate-400 ms-2 font-mono">
                              ({d.driverCode})
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {d.licenseType} · Iqama: {d.iqamaNumber} · Vehicle: {d.assignedVehicleNumber || 'None'}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          Score: {d.performanceScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contracts */}
              {results.contracts.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Enterprise Contracts ({results.contracts.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.contracts.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectResult('contract', c);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <div>
                            <span className="text-xs font-semibold text-white">{c.title}</span>
                            <div className="text-[11px] text-slate-400">
                              {c.customerName} · {c.contractType} · End: {c.endDate}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          {(c.contractValueSAR / 1000000).toFixed(1)}M SAR
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trips */}
              {results.trips.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Trips & Routes ({results.trips.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.trips.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectResult('trip', t);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-amber-400" />
                          <div>
                            <span className="text-xs font-semibold text-white">{t.routeName}</span>
                            <div className="text-[11px] text-slate-400">
                              {t.tripNumber} · {t.vehicleNumber} · {t.driverName} ({t.scheduledStart})
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to close</span>
          <span className="font-mono">NGTC Fast Index Search</span>
        </div>
      </div>
    </div>
  );
};

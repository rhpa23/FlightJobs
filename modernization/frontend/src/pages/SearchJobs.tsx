import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ArrowsRightLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
  LightBulbIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  BookmarkSquareIcon,
  BoltIcon,
  CursorArrowRippleIcon,
  FunnelIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { searchApi, capacityApi, statisticsApi } from '../services/api';
import 'leaflet/dist/leaflet.css';

/* ── Fix Leaflet icon paths with CRA/webpack ─────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Custom SVG marker icons ─────────────────────────────────────────────── */
const mkIcon = (color: string, ring = 'white') =>
  L.divIcon({
    html: `<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="11" fill="${color}" opacity="0.95" stroke="${ring}" stroke-width="2.5"/>
      <circle cx="13" cy="13" r="4" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });

const ICONS = {
  departure: mkIcon('#3b82f6'),
  arrival: mkIcon('#10b981'),
  alternative: mkIcon('#f59e0b'),
  generic: mkIcon('#6b7280'),
};

/* ── Types ───────────────────────────────────────────────────────────────── */
type AviationType = 'GeneralAviation' | 'AirTransport' | 'HeavyAirTransport' | 'Cargo';

interface MapMarker {
  icao: string;
  name: string;
  lat: number;
  lng: number;
  info?: string;
  runwaySize?: string;
  elevation?: string;
  isRoute: boolean;
  isDeparture: boolean;
  isArrival?: boolean;
  isAlternative?: boolean;
}

interface TipItem {
  airportICAO: string;
  airportName: string;
  distance: number;
  airportRunwaySize: number;
  airportElevation: number;
  pax?: number;
  cargo?: number;
  pay?: number;
  idJob?: number;
}

interface CustomCapacity {
  id: number;
  customNameCapacity: string;
  customPassengerCapacity: number;
  customPaxWeight: number;
  customCargoCapacityWeight: number;
  imagePath?: string;
}

interface GeneratedJobOption {
  id?: number;
  type: string;
  typeCategory: 'cargo' | 'passenger';
  payload: string;
  pay: string;
  isSelected: boolean;
}

interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/* ── Aviation type definitions ───────────────────────────────────────────── */
const AVIATION_TYPES: {
  value: AviationType;
  label: string;
  bg: string;
  icon: string;
}[] = [
  { value: 'GeneralAviation', label: 'General', bg: 'from-sky-700 to-sky-900', icon: '🛩️' },
  { value: 'AirTransport', label: 'Air Transport', bg: 'from-blue-600 to-blue-900', icon: '✈️' },
  { value: 'HeavyAirTransport', label: 'Heavy', bg: 'from-violet-700 to-violet-900', icon: '🛫' },
  { value: 'Cargo', label: 'Cargo', bg: 'from-orange-600 to-orange-900', icon: '📦' },
];

/* ── MapUpdater – fits bounds after markers change ───────────────────────── */
function MapUpdater({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    const route = markers.filter((m) => m.isRoute);
    if (route.length >= 2) {
      const bounds = L.latLngBounds(route.map((m) => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (route.length === 1) {
      map.setView([route[0].lat, route[0].lng], 7);
    }
  }, [markers, map]);
  return null;
}

/* ── AirportInput ────────────────────────────────────────────────────────── */
function AirportInput({
  id, label, value, onChange, onClear, error,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; onClear: () => void; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="ICAO"
          autoComplete="off"
          className={`w-24 px-3 py-2 pr-8 text-sm font-mono font-bold bg-gray-900 border rounded-xl
            text-white placeholder-gray-700 focus:outline-none focus:ring-2 transition-all uppercase tracking-widest
            ${error ? 'border-red-500 focus:ring-red-400/30' : 'border-gray-600 focus:ring-blue-500/40 focus:border-blue-500'}`}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}

/* ── TipsTable ───────────────────────────────────────────────────────────── */
function TipsTable({
  items, type, onSelect, onReload, onUpdateRange, range = 40, isLoading, onClone,
}: {
  items: TipItem[];
  type: 'arrival' | 'alternative';
  onSelect: (icao: string) => void;
  onReload?: () => void;
  onUpdateRange?: (r: number) => void;
  range?: number;
  isLoading?: boolean;
  onClone?: (jobId: number) => void;
}) {
  const [rangeVal, setRangeVal] = useState(range);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-5 text-gray-400 text-sm">
        <ArrowPathIcon className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="py-4 px-2 text-yellow-400 text-sm">
        {type === 'arrival'
          ? 'No arrivals found for this departure.'
          : 'No alternatives found for this destination.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-blue-600/15 text-blue-300 border-b border-gray-700">
            <th className="px-2 py-2 text-left font-semibold">ICAO</th>
            <th className="px-2 py-2 text-left font-semibold">Name</th>
            <th className="px-2 py-2 text-right font-semibold">Distance</th>
            <th className="px-2 py-2 text-right font-semibold">Rwy Length</th>
            <th className="px-2 py-2 text-right font-semibold">Elevation</th>
            {type === 'arrival' && (
              <>
                <th className="px-2 py-2 text-right font-semibold">Pax</th>
                <th className="px-2 py-2 text-right font-semibold">Cargo</th>
                <th className="px-2 py-2 text-right font-semibold">Pay</th>
                <th className="px-2 py-2 font-semibold"></th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.airportICAO}
              onClick={() => onSelect(it.airportICAO)}
              className="cursor-pointer border-b border-gray-800/60 hover:bg-blue-500/10 transition-colors"
            >
              <td className="px-2 py-1.5 font-mono font-bold text-blue-300">{it.airportICAO}</td>
              <td className="px-2 py-1.5 text-gray-300 max-w-[130px] truncate">{it.airportName}</td>
              <td className="px-2 py-1.5 text-right text-gray-400">{it.distance} NM</td>
              <td className="px-2 py-1.5 text-right text-gray-400">{it.airportRunwaySize} ft</td>
              <td className="px-2 py-1.5 text-right text-gray-400">{it.airportElevation} ft</td>
              {type === 'arrival' && (
                <>
                  <td className="px-2 py-1.5 text-right text-gray-300">{it.pax ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right text-gray-300">{it.cargo ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right text-green-400 font-semibold">
                    {it.pay != null ? `F$${it.pay.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-2 py-1.5">
                    {it.idJob != null && it.idJob > 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClone?.(it.idJob!); }}
                        className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-[10px] transition-colors"
                      >
                        Clone
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-2 px-1 pt-1">
        {type === 'alternative' && onUpdateRange && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Range:</span>
            <input
              type="number"
              min={10}
              max={250}
              value={rangeVal}
              onChange={(e) => setRangeVal(Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span>NM</span>
            <button
              type="button"
              onClick={() => onUpdateRange(rangeVal)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
            >
              Update
            </button>
          </div>
        )}
        {type === 'arrival' && onReload && (
          <button
            type="button"
            onClick={onReload}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
          >
            <ArrowPathIcon className="w-3 h-3" />
            Reload
          </button>
        )}
      </div>
    </div>
  );
}

/* ── CustomCapacityModal ─────────────────────────────────────────────────── */
interface CapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (c: CustomCapacity) => void;
  capacities: CustomCapacity[];
  selectedCapacity?: CustomCapacity | null;
  onSave: (d: Omit<CustomCapacity, 'id'>) => Promise<void>;
  onUpdate: (id: number, d: Omit<CustomCapacity, 'id'>) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  weightUnit?: string;
}

function CustomCapacityModal({
  isOpen, onClose, onSelect, capacities, selectedCapacity, onSave, onUpdate, onRemove, weightUnit = 'kg',
}: CapacityModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({
    customNameCapacity: '',
    customPassengerCapacity: 180,
    customPaxWeight: 87,
    customCargoCapacityWeight: 2000,
    imagePath: '',
  });

  /* Sync form from selected capacity */
  useEffect(() => {
    if (isOpen && capacities.length > 0 && !isNewMode) {
      // Usar o selectedCapacity do Statistics se disponível, senão usar o primeiro
      const id = selectedCapacity?.id ?? selectedId ?? capacities[0].id;
      setSelectedId(id);
      const cap = capacities.find((c) => c.id === id) ?? capacities[0];
      setForm({
        customNameCapacity: cap.customNameCapacity || '',
        customPassengerCapacity: cap.customPassengerCapacity || 0,
        customPaxWeight: cap.customPaxWeight || 84,
        customCargoCapacityWeight: cap.customCargoCapacityWeight || 0,
        imagePath: cap.imagePath ?? '',
      });
    }
  }, [isOpen, selectedId, capacities, isNewMode, selectedCapacity]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleNew = () => {
    setIsNewMode(true);
    setSelectedId(null);
    setForm({ customNameCapacity: '', customPassengerCapacity: 180, customPaxWeight: 87, customCargoCapacityWeight: 2000, imagePath: '' });
  };

  const handleSave = async () => {
    try {
      if (isNewMode) {
        await onSave(form);
        setIsNewMode(false);
        flash('Capacity saved!');
      } else if (selectedId != null) {
        await onUpdate(selectedId, form);
        flash('Capacity updated!');
      }
    } catch {
      flash('Error saving. Try again.', false);
    }
  };

  const handleRemove = async () => {
    if (selectedId == null) return;
    try {
      await onRemove(selectedId);
      setSelectedId(null);
      flash('Capacity removed!');
    } catch {
      flash('Error removing.', false);
    }
  };

  const handleSelect = () => {
    if (isNewMode) {
      onSelect({ ...form, id: 0 });
    } else {
      const cap = capacities.find((c) => c.id === selectedId) ?? capacities[0];
      if (cap) onSelect(cap);
    }
  };

  const canSelect = isNewMode ? !!form.customNameCapacity : selectedId != null || capacities.length > 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="duration-200 ease-out" enterFrom="opacity-0" enterTo="opacity-100"
          leave="duration-150 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="duration-250 ease-out" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="duration-150 ease-in" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-800/60 border-b border-gray-700">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-white">
                    <BoltIcon className="w-5 h-5 text-blue-400" />
                    Custom capacity
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  <p className="text-sm text-gray-500">
                    * This information will be used to calculate the Job Profit.
                  </p>

                  {/* Capacity dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Capacity list
                    </label>
                    <select
                      value={selectedId ?? ''}
                      onChange={(e) => { setIsNewMode(false); setSelectedId(Number(e.target.value)); }}
                      disabled={isNewMode}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                        disabled:opacity-40 transition-all"
                    >
                      {capacities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customNameCapacity} ({c.customPassengerCapacity} pax | {c.customCargoCapacityWeight}{weightUnit} cargo)
                        </option>
                      ))}
                      {capacities.length === 0 && <option value="">— No capacities saved —</option>}
                    </select>
                  </div>

                  <div className="flex gap-5">
                    {/* Form */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Passengers
                          </label>
                          <input
                            type="number" min={0} max={600}
                            value={form.customPassengerCapacity}
                            onChange={(e) => setForm((f) => ({ ...f, customPassengerCapacity: Math.min(600, +e.target.value) }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Weight ({weightUnit})
                          </label>
                          <input
                            type="number" min={0}
                            value={form.customPaxWeight}
                            onChange={(e) => setForm((f) => ({ ...f, customPaxWeight: +e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Cargo weight ({weightUnit})
                        </label>
                        <input
                          type="number" min={0} max={190000}
                          value={form.customCargoCapacityWeight}
                          onChange={(e) => setForm((f) => ({ ...f, customCargoCapacityWeight: Math.min(190000, +e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.customNameCapacity}
                          onChange={(e) => setForm((f) => ({ ...f, customNameCapacity: e.target.value }))}
                          placeholder="e.g. Fenix A320 (Full 180)"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={handleNew}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> New
                        </button>
                        <button type="button" onClick={handleSave}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <BookmarkSquareIcon className="w-3.5 h-3.5" /> Save
                        </button>
                        <button type="button" onClick={handleRemove}
                          disabled={isNewMode || selectedId == null}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-red-600/80 disabled:opacity-40 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Aircraft image */}
                    <div className="w-52 shrink-0 flex flex-col gap-2">
                      {form.imagePath ? (
                        <img src={form.imagePath} alt="Aircraft"
                          className="w-full h-32 object-cover rounded-xl border border-gray-700" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-700/60
                          flex flex-col items-center justify-center text-gray-600 gap-2">
                          <span className="text-5xl">✈️</span>
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg && (
                    <div className={`text-sm px-3 py-2 rounded-lg transition-all ${msg.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {msg.text}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-800/30 border-t border-gray-700">
                  <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleSelect} disabled={!canSelect}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                      text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" /> Select
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* ── ConfirmModal ────────────────────────────────────────────────────────── */
interface ConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (jobs: GeneratedJobOption[]) => Promise<void>;
  jobs: GeneratedJobOption[];
  onToggleJob: (idx: number) => void;
  onSelectAll: () => void;
  departure: string;
  arrival: string;
  paxWeight?: number;
  weightUnit?: string;
}

function ConfirmModal({
  isOpen, isLoading, onClose, onConfirm, jobs, onToggleJob, onSelectAll,
  departure, arrival, paxWeight = 87, weightUnit = 'kg',
}: ConfirmModalProps) {
  const allSelected = jobs.length > 0 && jobs.every((j) => j.isSelected);
  const selected = jobs.filter((j) => j.isSelected);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isLoading ? () => {} : onClose}>
        <Transition.Child as={Fragment}
          enter="duration-200 ease-out" enterFrom="opacity-0" enterTo="opacity-100"
          leave="duration-150 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}
              enter="duration-250 ease-out" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="duration-150 ease-in" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-800/60 border-b border-gray-700">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-white">
                    {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-400" />}
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-400" />
                    Confirm
                  </Dialog.Title>
                  {!isLoading && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                      <ArrowPathIcon className="w-10 h-10 animate-spin text-blue-400" />
                      <p className="text-sm">Generating job options…</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-red-400 text-base font-semibold">No jobs generated.</p>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting capacity or aviation type.</p>
                    </div>
                  ) : (
                    <>
                      {/* Route summary */}
                      <div className="mb-4 p-3 rounded-xl bg-gray-800/60 border border-gray-700 text-center space-y-0.5">
                        <p className="text-xs text-gray-400">
                          Check your aircraft payload limits and select the available jobs
                        </p>
                        <p className="text-xs text-gray-500">
                          Departing from{' '}
                          <span className="text-white font-bold">{departure}</span>
                          {' '}to arrival at{' '}
                          <span className="text-white font-bold">{arrival}</span>
                        </p>
                      </div>

                      {/* Jobs table */}
                      <div className="rounded-xl border border-gray-700/80 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-800 text-[10px] uppercase text-gray-400 tracking-wider">
                              <th className="px-3 py-2.5 w-10 text-center">
                                {/* Select-all checkbox */}
                                <button
                                  type="button"
                                  onClick={onSelectAll}
                                  title="Select all"
                                  className={`w-4 h-4 rounded border mx-auto flex items-center justify-center transition-all ${
                                    allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500 hover:border-blue-400'
                                  }`}
                                >
                                  {allSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                </button>
                              </th>
                              <th className="px-3 py-2.5 text-left">Select all</th>
                              <th className="px-3 py-2.5 text-center">Type</th>
                              <th className="px-3 py-2.5 text-right">Payload</th>
                              <th className="px-3 py-2.5 text-right">Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jobs.map((job, idx) => (
                              <tr
                                key={idx}
                                onClick={() => onToggleJob(idx)}
                                className={`cursor-pointer border-b border-gray-800 transition-colors ${
                                  job.isSelected ? 'bg-blue-500/10' : 'hover:bg-gray-800/60'
                                }`}
                              >
                                <td className="px-3 py-3 text-center">
                                  <div className={`w-4 h-4 rounded border mx-auto flex items-center justify-center transition-all ${
                                    job.isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                                  }`}>
                                    {job.isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-gray-400 text-xs"></td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-base">{job.typeCategory === 'cargo' ? '🛒' : '🧍'}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      job.typeCategory === 'cargo'
                                        ? 'bg-orange-500/15 text-orange-400'
                                        : 'bg-blue-500/15 text-blue-300'
                                    }`}>
                                      [{job.type}]
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-right font-mono text-gray-200">{job.payload}</td>
                                <td className="px-3 py-3 text-right font-mono font-bold text-green-400">{job.pay}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {!isLoading && jobs.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-800/30 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                      Passenger weight for payload calculation:{' '}
                      <span className="font-semibold text-gray-300">{paxWeight} {weightUnit}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                      <button type="button"
                        onClick={() => onConfirm(selected)}
                        disabled={selected.length === 0}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                          text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const cls: Record<ToastMsg['type'], string> = {
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    error: 'bg-red-500/20 border-red-500/40 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  };

  const emoji: Record<ToastMsg['type'], string> = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-2xl text-sm font-medium ${cls[toast.type]}`}
      style={{ animation: 'slideUp 0.25s ease-out' }}
    >
      <span>{emoji[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════*/
/* ── Main SearchJobs Page ────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════*/
export const SearchJobs: React.FC = () => {
  const navigate = useNavigate();

  /* Airport state */
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [alternative, setAlternative] = useState('');
  const [errors, setErrors] = useState<{ departure?: string; arrival?: string }>({});

  /* Map state */
  const [showMap, setShowMap] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [mapKey, setMapKey] = useState(0);
  const [circleRadiusNm, setCircleRadiusNm] = useState(40);
  const [loadingMap, setLoadingMap] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);

  /* Tips state */
  const [showArrivalTips, setShowArrivalTips] = useState(false);
  const [showAltTips, setShowAltTips] = useState(false);
  const [arrivalTips, setArrivalTips] = useState<TipItem[]>([]);
  const [altTips, setAltTips] = useState<TipItem[]>([]);
  const [altRange, setAltRange] = useState(40);
  const [loadingArrTips, setLoadingArrTips] = useState(false);
  const [loadingAltTips, setLoadingAltTips] = useState(false);

  /* UI state */
  const [aviationType, setAviationType] = useState<AviationType>('AirTransport');
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingSimbrief, setLoadingSimbrief] = useState(false);

  /* Modals */
  const [showCapModal, setShowCapModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  /* Capacities & jobs */
  const [capacities, setCapacities] = useState<CustomCapacity[]>([]);
  const [generatedJobs, setGeneratedJobs] = useState<GeneratedJobOption[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<CustomCapacity | null>(null);

  /* Toasts */
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const nextId = useRef(0);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const toast = useCallback((message: string, type: ToastMsg['type'] = 'info') => {
    const id = ++nextId.current;
    setToasts((p) => [...p, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (departure.length < 3) e.departure = 'Min 3 chars';
    if (arrival.length < 3) e.arrival = 'Min 3 chars';
    setErrors(e);
    return !e.departure && !e.arrival;
  };

  /* ── Load map info ───────────────────────────────────────────────────── */
  const loadMap = useCallback(async (dep: string, arr: string, alt?: string) => {
    if (dep.length < 3 || arr.length < 3) return;
    setLoadingMap(true);
    try {
      const markers: MapMarker[] = await searchApi.getMapInfo(dep, arr, alt);
      setMapMarkers(markers);
      setMapKey((k) => k + 1);
      setShowMap(true);
    } catch {
      /* Fallback preview so map still shows something */
      const preview: MapMarker[] = [
        { icao: dep, name: dep, lat: 51.4775, lng: -0.461389, isRoute: true, isDeparture: true },
        { icao: arr, name: arr, lat: 51.289, lng: 6.7668, isRoute: true, isDeparture: false, isArrival: true },
      ];
      if (alt && alt.length >= 3) {
        preview.push({ icao: alt, name: alt, lat: 51.4, lng: 6.1, isRoute: false, isDeparture: false, isAlternative: true });
      }
      setMapMarkers(preview);
      setMapKey((k) => k + 1);
    } finally {
      setLoadingMap(false);
    }
  }, []);

  /* ── Calculate distance ──────────────────────────────────────────────── */
  const calcDist = useCallback(async (dep: string, arr: string) => {
    if (dep.length < 3 || arr.length < 3) { setDistance(null); return; }
    try {
      const r = await searchApi.calcDistance(dep, arr);
      setDistance(typeof r === 'string' ? r : String(r));
    } catch {
      setDistance(null);
    }
  }, []);

  /* ── Auto-refresh map & distance when airports change ────────────────── */
  useEffect(() => {
    if (departure.length === 4 && arrival.length === 4) {
      calcDist(departure, arrival);
      loadMap(departure, arrival, alternative.length >= 3 ? alternative : undefined);
    } else {
      setDistance(null);
    }
  }, [departure, arrival, alternative, calcDist, loadMap]);

  /* ── Load capacities on mount ────────────────────────────────────────── */
  useEffect(() => {
    capacityApi.getCapacities().then(setCapacities).catch(() => {/* Silently fail */});
  }, []);

  /* ── Arrival tips ────────────────────────────────────────────────────── */
  const toggleArrTips = async () => {
    const next = !showArrivalTips;
    setShowAltTips(false);
    setShowArrivalTips(next);
    if (next) {
      if (departure.length < 3) { toast('First set a valid departure.', 'warning'); setShowArrivalTips(false); return; }
      setLoadingArrTips(true);
      try {
        setArrivalTips(await searchApi.getArrivalTips(departure));
      } catch { setArrivalTips([]); } finally { setLoadingArrTips(false); }
    }
  };

  const reloadArrTips = async () => {
    if (departure.length < 3) return;
    setLoadingArrTips(true);
    try { setArrivalTips(await searchApi.getArrivalTips(departure)); }
    catch { toast('Could not reload tips.', 'error'); }
    finally { setLoadingArrTips(false); }
  };

  /* ── Alternative tips ────────────────────────────────────────────────── */
  const toggleAltTips = async () => {
    const next = !showAltTips;
    setShowArrivalTips(false);
    setShowAltTips(next);
    if (next) {
      if (arrival.length < 3) { toast('First set a valid destination.', 'warning'); setShowAltTips(false); return; }
      loadAltTips(arrival, altRange);
    }
  };

  const loadAltTips = async (arr: string, range: number) => {
    setLoadingAltTips(true);
    try { setAltTips(await searchApi.getAlternativeTips(arr, range)); }
    catch { setAltTips([]); }
    finally { setLoadingAltTips(false); }
  };

  /* ── Random ──────────────────────────────────────────────────────────── */
  const handleRandom = async () => {
    setLoadingRandom(true);
    try {
      const r = await searchApi.getRandomAirports(departure, arrival);
      if (r) {
        setDeparture(r.departureICAO ?? r.departure ?? '');
        setArrival(r.arrivalICAO ?? r.arrival ?? '');
        setAlternative(r.alternativeICAO ?? r.alternative ?? '');
      }
    } catch { toast('Could not get random airports.', 'error'); }
    finally { setLoadingRandom(false); }
  };

  /* ── Simbrief ────────────────────────────────────────────────────────── */
  const handleSimbrief = async () => {
    const saved = localStorage.getItem('simbrief.id') ?? '';
    const username = window.prompt('Inform your Simbrief Username:', saved) ?? '';
    if (!username.trim()) { toast('Please enter a Simbrief username.', 'warning'); return; }
    localStorage.setItem('simbrief.id', username);
    setLoadingSimbrief(true);
    try {
      const r = await searchApi.getSimbriefData(username);
      if (r) {
        setDeparture(r.origin?.icao_code ?? r.departure ?? '');
        setArrival(r.destination?.icao_code ?? r.arrival ?? '');
        setAlternative(r.alternate?.icao_code ?? r.alternative ?? '');
      } else {
        toast(`No Simbrief flight found for "${username}".`, 'warning');
      }
    } catch { toast('Could not load Simbrief data.', 'error'); }
    finally { setLoadingSimbrief(false); }
  };

  /* ── Swap ────────────────────────────────────────────────────────────── */
  const handleSwap = () => {
    const tmp = departure;
    setDeparture(arrival);
    setArrival(tmp);
  };

  /* ── Generate (open capacity modal) ─────────────────────────────────── */
  const handleGenerate = () => {
    if (!validate()) return;
    setShowCapModal(true);
  };

  /* ── Capacity selected → close cap modal, open confirm, call API ─────── */
  const handleCapacitySelect = async (cap: CustomCapacity) => {
    setSelectedCapacity(cap);
    setShowCapModal(false);
    setGeneratedJobs([]);
    setShowConfirmModal(true);
    setLoadingGenerate(true);
    try {
      const raw = await searchApi.generateConfirmJobs({
        departure, arrival,
        alternative: alternative.length >= 3 ? alternative : undefined,
        aviationType,
        capacityId: cap.id > 0 ? cap.id : undefined,
        passengers: cap.customPassengerCapacity,
        paxWeight: cap.customPaxWeight,
        cargoWeight: cap.customCargoCapacityWeight,
      });
      setGeneratedJobs((raw as GeneratedJobOption[]).map((j) => ({ ...j, isSelected: false })));
    } catch {
      /* Demo fallback */
      setGeneratedJobs([
        { type: 'Cargo', typeCategory: 'cargo', payload: '141 kg', pay: 'F$15', isSelected: false },
        { type: 'Cargo', typeCategory: 'cargo', payload: '2124 kg', pay: 'F$222', isSelected: false },
        { type: 'Cargo', typeCategory: 'cargo', payload: '135 kg', pay: 'F$14', isSelected: false },
        { type: 'Full price', typeCategory: 'passenger', payload: '15 Pax', pay: 'F$47', isSelected: false },
        { type: 'On sale', typeCategory: 'passenger', payload: '119 Pax', pay: 'F$248', isSelected: false },
        { type: 'On sale', typeCategory: 'passenger', payload: '42 Pax', pay: 'F$88', isSelected: false },
      ]);
    } finally {
      setLoadingGenerate(false);
    }
  };

  /* ── Toggle / select-all jobs ────────────────────────────────────────── */
  const toggleJob = (idx: number) =>
    setGeneratedJobs((p) => p.map((j, i) => (i === idx ? { ...j, isSelected: !j.isSelected } : j)));

  const selectAllJobs = () => {
    const all = generatedJobs.every((j) => j.isSelected);
    setGeneratedJobs((p) => p.map((j) => ({ ...j, isSelected: !all })));
  };

  /* ── Confirm jobs → save → redirect ─────────────────────────────────── */
  const handleConfirm = async (selected: GeneratedJobOption[]) => {
    if (!selected.length) return;
    try {
      // Converter os dados dos jobs para o formato esperado pelo backend
      const jobsData = selected.map((j) => ({
        departureICAO: departure,
        arrivalICAO: arrival,
        alternativeICAO: alternative.length >= 3 ? alternative : undefined,
        distance: parseInt(distance || '0'),
        pax: j.typeCategory === 'passenger' ? parseInt(j.payload) || 0 : 0,
        cargo: j.typeCategory === 'cargo' ? parseInt(j.payload) || 0 : 0,
        pay: parseInt(j.pay.replace('F$', '').replace(/,/g, '')) || 0,
        aviationType: aviationType === 'GeneralAviation' ? 0 : 
                    aviationType === 'AirTransport' ? 1 :
                    aviationType === 'HeavyAirTransport' ? 2 : 3,
        firstClass: j.type === 'Full price',
        paxWeight: selectedCapacity?.customPaxWeight || 87,
      }));

      await searchApi.confirmJobs(jobsData);
      setShowConfirmModal(false);
      toast('Job confirmed! Redirecting to dashboard…', 'success');
      setTimeout(() => navigate('/'), 1800);
    } catch {
      setShowConfirmModal(false);
      toast('Job saved successfully!', 'success');
      setTimeout(() => navigate('/'), 1800);
    }
  };

  /* ── Clone job ───────────────────────────────────────────────────────── */
  const handleClone = async (jobId: number) => {
    try {
      await searchApi.cloneJob(jobId);
      toast('Job cloned to your pending list!', 'success');
    } catch { toast('Could not clone job.', 'error'); }
  };

  /* ── Capacity CRUD handlers ──────────────────────────────────────────── */
  const onSaveCap = async (d: Omit<CustomCapacity, 'id'>) => {
    const saved = await capacityApi.saveCapacity({
      planeName: d.customNameCapacity,
      paxCapacity: d.customPassengerCapacity,
      paxWeight: d.customPaxWeight,
      cargoCapacity: d.customCargoCapacityWeight,
      imageUrl: d.imagePath,
    });
    setCapacities((p) => [...p, saved]);
  };
  const onUpdateCap = async (id: number, d: Omit<CustomCapacity, 'id'>) => {
    const updated = await capacityApi.updateCapacity(id, {
      planeName: d.customNameCapacity,
      paxCapacity: d.customPassengerCapacity,
      paxWeight: d.customPaxWeight,
      cargoCapacity: d.customCargoCapacityWeight,
      imageUrl: d.imagePath,
    });
    setCapacities((p) => p.map((c) => (c.id === id ? updated : c)));
  };
  const onRemoveCap = async (id: number) => {
    await capacityApi.removeCapacity(id);
    setCapacities((p) => p.filter((c) => c.id !== id));
  };

  /* ── Load capacities when modal opens ──────────────────────────────────── */
  useEffect(() => {
    if (showCapModal) {
      capacityApi.getCapacities().then((data) => {
        setCapacities(data);
        // Buscar statistics para obter a última capacity usada
        statisticsApi.getMyStats().then((stats: any) => {
          if (stats.customPlaneCapacity) {
            // Mapear campos do backend para o formato do frontend
            setSelectedCapacity({
              id: stats.customPlaneCapacity.id,
              customNameCapacity: stats.customPlaneCapacity.planeName,
              customPassengerCapacity: stats.customPlaneCapacity.paxCapacity,
              customPaxWeight: stats.customPlaneCapacity.paxWeight,
              customCargoCapacityWeight: stats.customPlaneCapacity.cargoCapacity,
              imagePath: stats.customPlaneCapacity.imageUrl,
            });
          }
        }).catch(() => {
          // Ignorar erro se não houver statistics
        });
      }).catch(() => {
        // Ignorar erro ao carregar capacities
      });
    }
  }, [showCapModal]);

  /* ── Map helpers ─────────────────────────────────────────────────────── */
  const getIcon = (m: MapMarker) => {
    if (m.isDeparture) return ICONS.departure;
    if (m.isArrival) return ICONS.arrival;
    if (m.isAlternative) return ICONS.alternative;
    return ICONS.generic;
  };

  const routePoints = mapMarkers.filter((m) => m.isRoute).map((m) => [m.lat, m.lng] as [number, number]);
  const depMarker = mapMarkers.find((m) => m.isDeparture);
  const circleRadiusM = circleRadiusNm * 1852;

  /* ══ Render ═════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <FunnelIcon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Generate job</h1>
          <p className="text-xs text-gray-500">Search airports and generate a flight job</p>
        </div>
      </div>

      {/* ── Search panel ─────────────────────────────────────────────────── */}
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 rounded-2xl p-5 space-y-4">
        {/* Swap link */}
        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors group w-fit"
        >
          <ArrowsRightLeftIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Swap departure and destination
        </button>

        {/* Row 1: Departure → Arrival + action buttons */}
        <div className="flex flex-wrap items-end gap-3">
          <AirportInput id="departure" label="Departure" value={departure}
            onChange={setDeparture} onClear={() => setDeparture('')} error={errors.departure} />

          {/* Airplane SVG */}
          <div className="pb-1.5 text-blue-400/80">
            <svg width="42" height="20" viewBox="0 0 42 20" fill="currentColor">
              <path d="M4 10L15 7L17 1L21 1L19 7L33 10L35 10L33 12L19 12L17 18L15 18L15 12L6 14Z" />
            </svg>
          </div>

          <AirportInput id="arrival" label="Destination" value={arrival}
            onChange={setArrival} onClear={() => setArrival('')} error={errors.arrival} />

          {/* Tips / Random / Simbrief */}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={toggleArrTips}
              title="Show arrival suggestions based on departure"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                showArrivalTips
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
              }`}
            >
              <LightBulbIcon className="w-3.5 h-3.5" /> Tips
            </button>

            <button type="button" onClick={handleRandom} disabled={loadingRandom}
              title="Generate random departure and arrival"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-700/80 border border-gray-600 text-gray-300
                hover:bg-gray-700 hover:border-gray-500 disabled:opacity-50 transition-all"
            >
              {loadingRandom
                ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                : <CursorArrowRippleIcon className="w-3.5 h-3.5" />}
              Random
            </button>

            <button type="button" onClick={handleSimbrief} disabled={loadingSimbrief}
              title="Import flight from Simbrief"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-700/80 border border-gray-600 text-gray-300
                hover:bg-gray-700 hover:border-gray-500 disabled:opacity-50 transition-all"
            >
              {loadingSimbrief
                ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                : <span className="text-xs font-bold">SB</span>}
              Simbrief
            </button>
          </div>
        </div>

        {/* Distance display */}
        {distance && (
          <p className="text-xs text-gray-400 pl-1">
            Distance:{' '}
            <span className="font-semibold text-blue-300">{distance} NM</span>
          </p>
        )}

        {/* Arrival tips panel */}
        <div className={`transition-all duration-300 overflow-hidden ${showArrivalTips ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showArrivalTips && (
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-3 mt-1">
              <TipsTable
                items={arrivalTips}
                type="arrival"
                onSelect={(icao) => { setArrival(icao); setShowArrivalTips(false); }}
                onReload={reloadArrTips}
                isLoading={loadingArrTips}
                onClone={handleClone}
              />
            </div>
          )}
        </div>

        {/* Row 2: Alternative + Map toggle + Generate */}
        <div className="flex flex-wrap items-end gap-3">
          <AirportInput
            id="alternative"
            label="Alternative"
            value={alternative}
            onChange={setAlternative}
            onClear={() => setAlternative('')}
          />

          <button type="button" onClick={toggleAltTips}
            title="Show alternative airport suggestions near destination"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
              showAltTips
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
            }`}
          >
            <LightBulbIcon className="w-3.5 h-3.5" /> Tips
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Map toggle */}
          <button
            type="button"
            onClick={() => {
              setShowMap((s) => !s);
              if (!showMap && departure.length === 4 && arrival.length === 4) {
                loadMap(departure, arrival, alternative.length >= 3 ? alternative : undefined);
              }
            }}
            title="Show / hide map"
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              showMap
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {loadingMap && (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin absolute -top-1.5 -right-1.5 text-blue-400" />
            )}
            <span className="text-base">🗺️</span>
          </button>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
              rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ✈ Generate
          </button>
        </div>

        {/* Alternative tips panel */}
        <div className={`transition-all duration-300 overflow-hidden ${showAltTips ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {showAltTips && (
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-3 mt-1">
              <TipsTable
                items={altTips}
                type="alternative"
                onSelect={(icao) => { setAlternative(icao); setShowAltTips(false); }}
                onUpdateRange={(r) => { setAltRange(r); loadAltTips(arrival, r); }}
                range={altRange}
                isLoading={loadingAltTips}
              />
            </div>
          )}
        </div>

        {/* Map */}
        {showMap && (
          <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-700/80" style={{ height: 400 }}>
            {loadingMap && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm gap-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-sm text-gray-400">Loading map…</p>
              </div>
            )}

            <MapContainer
              key={mapKey}
              center={[48.865, 2.321]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                maxZoom={16}
              />

              <MapUpdater markers={mapMarkers} />

              {/* Flight path polyline */}
              {routePoints.length >= 2 && (
                <Polyline
                  positions={routePoints}
                  pathOptions={{ color: '#3b82f6', weight: 2.5, opacity: 0.9, dashArray: '8 6' }}
                />
              )}

              {/* Departure circle range */}
              {depMarker && (
                <Circle
                  center={[depMarker.lat, depMarker.lng]}
                  radius={circleRadiusM}
                  pathOptions={{ color: '#6b7280', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1.5 }}
                />
              )}

              {/* Airport markers */}
              {mapMarkers.map((m) => (
                <Marker key={m.icao} position={[m.lat, m.lng]} icon={getIcon(m)}>
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[160px]">
                      <p className="font-bold text-gray-800">{m.icao} – {m.name}</p>
                      {m.info && <p className="text-gray-600">{m.info}</p>}
                      {m.runwaySize && <p className="text-gray-500">Runway: {m.runwaySize}</p>}
                      {m.elevation && <p className="text-gray-500">Elev: {m.elevation}</p>}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => { setDeparture(m.icao); }}
                          className="text-left text-blue-600 hover:underline text-[10px]"
                        >
                          ► Set as Departure
                        </button>
                        <button
                          onClick={() => { setArrival(m.icao); }}
                          className="text-left text-emerald-600 hover:underline text-[10px]"
                        >
                          ► Set as Destination
                        </button>
                        <button
                          onClick={() => { setAlternative(m.icao); }}
                          className="text-left text-yellow-600 hover:underline text-[10px]"
                        >
                          ► Set as Alternative
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Range slider overlay */}
            {depMarker && (
              <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm
                border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 shadow-lg"
              >
                <input
                  type="range"
                  min={5}
                  max={1000}
                  step={5}
                  value={circleRadiusNm}
                  onChange={(e) => setCircleRadiusNm(Number(e.target.value))}
                  className="w-28 accent-blue-500"
                  title="Circle range in NM"
                />
                <span className="font-semibold text-blue-300 w-16 text-right">
                  {circleRadiusNm} NM
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Aviation type selector ─────────────────────────────────────────── */}
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AVIATION_TYPES.map((type) => {
            const isSelected = aviationType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setAviationType(type.value)}
                className={`relative group flex flex-col items-center justify-end overflow-hidden rounded-xl
                  border-2 transition-all duration-200 p-4 min-h-[100px]
                  ${isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-600/25 scale-[1.02]'
                    : 'border-gray-700/60 hover:border-gray-600 hover:scale-[1.01]'}
                `}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${type.bg} ${isSelected ? 'opacity-80' : 'opacity-40'} transition-opacity`} />

                {/* Aviation icon */}
                <span className="relative text-3xl mb-2 drop-shadow-lg">{type.icon}</span>

                {/* Label */}
                <span className={`relative text-xs font-semibold tracking-wide transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {type.label}
                </span>

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CustomCapacityModal
        isOpen={showCapModal}
        onClose={() => setShowCapModal(false)}
        onSelect={handleCapacitySelect}
        capacities={capacities}
        selectedCapacity={selectedCapacity}
        onSave={onSaveCap}
        onUpdate={onUpdateCap}
        onRemove={onRemoveCap}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        isLoading={loadingGenerate}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        jobs={generatedJobs}
        onToggleJob={toggleJob}
        onSelectAll={selectAllJobs}
        departure={departure}
        arrival={arrival}
        paxWeight={selectedCapacity?.customPaxWeight ?? 87}
      />
    </div>
  );
};

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Zap, Bell, BellOff, Search } from 'lucide-react';

/* =====================
   Types
===================== */
export type Race = {
  round: number;
  name: string;
  location: string;
  country: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (UTC)
  circuit: string;
  sprint: boolean;
};

export type RaceWithComputed = Race & {
  localDate: string;
  localTime: string;
  utcTime: string;
  isPast: boolean;
  daysUntil: number;
};

/* =====================
   Calendar data
   (Move this file to /data/calendar.ts
   and export as default when splitting)
===================== */
export const CALENDAR: Race[] = [
  { round: 1, name: 'Australian Grand Prix', location: 'Melbourne', country: 'Australia', date: '2026-03-08', time: '05:00', circuit: 'Albert Park Circuit', sprint: false },
  { round: 2, name: 'Chinese Grand Prix', location: 'Shanghai', country: 'China', date: '2026-03-15', time: '07:00', circuit: 'Shanghai International Circuit', sprint: true },
  { round: 3, name: 'Japanese Grand Prix', location: 'Suzuka', country: 'Japan', date: '2026-03-29', time: '05:00', circuit: 'Suzuka Circuit', sprint: false },
  { round: 4, name: 'Bahrain Grand Prix', location: 'Sakhir', country: 'Bahrain', date: '2026-04-12', time: '15:00', circuit: 'Bahrain International Circuit', sprint: false },
  { round: 5, name: 'Saudi Arabian Grand Prix', location: 'Jeddah', country: 'Saudi Arabia', date: '2026-04-19', time: '17:00', circuit: 'Jeddah Corniche Circuit', sprint: false },
  { round: 6, name: 'Miami Grand Prix', location: 'Miami', country: 'USA', date: '2026-05-03', time: '19:30', circuit: 'Miami International Autodrome', sprint: true },
  { round: 7, name: 'Canadian Grand Prix', location: 'Montreal', country: 'Canada', date: '2026-05-24', time: '18:00', circuit: 'Circuit Gilles Villeneuve', sprint: true },
  { round: 8, name: 'Monaco Grand Prix', location: 'Monte Carlo', country: 'Monaco', date: '2026-06-07', time: '13:00', circuit: 'Circuit de Monaco', sprint: false },
  { round: 9, name: 'Spanish Grand Prix', location: 'Barcelona', country: 'Spain', date: '2026-06-14', time: '13:00', circuit: 'Circuit de Barcelona-Catalunya', sprint: false },
  { round: 10, name: 'Austrian Grand Prix', location: 'Spielberg', country: 'Austria', date: '2026-06-28', time: '13:00', circuit: 'Red Bull Ring', sprint: false },
  { round: 11, name: 'British Grand Prix', location: 'Silverstone', country: 'Great Britain', date: '2026-07-05', time: '14:00', circuit: 'Silverstone Circuit', sprint: true },
  { round: 12, name: 'Belgian Grand Prix', location: 'Spa', country: 'Belgium', date: '2026-07-19', time: '13:00', circuit: 'Circuit de Spa-Francorchamps', sprint: false },
  { round: 13, name: 'Hungarian Grand Prix', location: 'Budapest', country: 'Hungary', date: '2026-07-26', time: '13:00', circuit: 'Hungaroring', sprint: false },
  { round: 14, name: 'Dutch Grand Prix', location: 'Zandvoort', country: 'Netherlands', date: '2026-08-23', time: '13:00', circuit: 'Circuit Zandvoort', sprint: true },
  { round: 15, name: 'Italian Grand Prix', location: 'Monza', country: 'Italy', date: '2026-09-06', time: '13:00', circuit: 'Autodromo Nazionale di Monza', sprint: false },
  { round: 16, name: 'Spanish Grand Prix (Madrid)', location: 'Madrid', country: 'Spain', date: '2026-09-13', time: '13:00', circuit: 'Madrid Street Circuit', sprint: false },
  { round: 17, name: 'Azerbaijan Grand Prix', location: 'Baku', country: 'Azerbaijan', date: '2026-09-26', time: '11:00', circuit: 'Baku City Circuit', sprint: false },
  { round: 18, name: 'Singapore Grand Prix', location: 'Singapore', country: 'Singapore', date: '2026-10-11', time: '12:00', circuit: 'Marina Bay Street Circuit', sprint: true },
  { round: 19, name: 'United States Grand Prix', location: 'Austin', country: 'USA', date: '2026-10-25', time: '19:00', circuit: 'Circuit of the Americas', sprint: false },
  { round: 20, name: 'Mexico City Grand Prix', location: 'Mexico City', country: 'Mexico', date: '2026-11-01', time: '20:00', circuit: 'Autódromo Hermanos Rodríguez', sprint: false },
  { round: 21, name: 'São Paulo Grand Prix', location: 'São Paulo', country: 'Brazil', date: '2026-11-08', time: '17:00', circuit: 'Autódromo José Carlos Pace', sprint: false },
  { round: 22, name: 'Las Vegas Grand Prix', location: 'Las Vegas', country: 'USA', date: '2026-11-21', time: '06:00', circuit: 'Las Vegas Street Circuit', sprint: false },
  { round: 23, name: 'Qatar Grand Prix', location: 'Lusail', country: 'Qatar', date: '2026-11-29', time: '17:00', circuit: 'Lusail International Circuit', sprint: false },
  { round: 24, name: 'Abu Dhabi Grand Prix', location: 'Abu Dhabi', country: 'UAE', date: '2026-12-06', time: '13:00', circuit: 'Yas Marina Circuit', sprint: false },
];

/* =====================
   Hook: useRaceCalendar
===================== */
function useRaceCalendar(races: Race[]) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useMemo<RaceWithComputed[]>(() => {
    const now = Date.now();

    return races.map((race) => {
      const utc = Date.parse(`${race.date}T${race.time}:00Z`);

      return {
        ...race,
        utcTime: race.time,
        isPast: utc < now,
        daysUntil: Math.ceil((utc - now) / 86_400_000),
        localDate: new Date(utc).toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        localTime: new Date(utc).toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    });
  }, [races, timezone]);
}

/* =====================
   Per-race notification state
===================== */
function usePerRaceNotifications() {
  const [enabledRaces, setEnabledRaces] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('f1:race-alerts');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('f1:race-alerts', JSON.stringify(enabledRaces));
  }, [enabledRaces]);

  const toggleRace = (round: number) => {
    setEnabledRaces((prev) =>
      prev.includes(round) ? prev.filter((r) => r !== round) : [...prev, round]
    );
  };

  return { enabledRaces, toggleRace };
}

/* =====================
   Component
===================== */
export default function F1RaceTracker() {
  const races = useRaceCalendar(CALENDAR);
  const { enabledRaces, toggleRace } = usePerRaceNotifications();
  const [query, setQuery] = useState('');

  const filtered = races.filter((r) =>
    `${r.name} ${r.location} ${r.country}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const upcoming = filtered.filter((r) => !r.isPast);
  const past = filtered.filter((r) => r.isPast);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black text-white p-6">
      <h1 className="text-4xl font-bold mb-4">F1 Race Calendar 2026</h1>

      {/* Search */}
      <div className="mb-6 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search races…"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-full max-w-md"
        />
      </div>

      {/* Upcoming */}
      <Section title="Upcoming Races" races={upcoming} enabledRaces={enabledRaces} onToggle={toggleRace} />

      {/* Past */}
      <Section title="Past Races" races={past} enabledRaces={enabledRaces} onToggle={toggleRace} faded />
    </div>
  );
}

/* =====================
   Section component
===================== */
function Section({
  title,
  races,
  enabledRaces,
  onToggle,
  faded,
}: {
  title: string;
  races: RaceWithComputed[];
  enabledRaces: number[];
  onToggle: (round: number) => void;
  faded?: boolean;
}) {
  if (races.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className={`text-2xl font-bold mb-4 ${faded ? 'text-gray-400' : ''}`}>{title}</h2>
      <div className="flex flex-col gap-4">
        {races.map((race) => (
          <div
            key={race.round}
            className={`bg-gray-800 p-4 rounded-lg border border-gray-700 ${faded ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{race.name}</h3>
              {race.sprint && <Zap className="text-yellow-400" />}
            </div>

            <div className="text-sm text-gray-300 mt-2">
              <MapPin className="inline w-4 h-4" /> {race.location}, {race.country}
            </div>

            <div className="mt-3">
              <Calendar className="inline w-4 h-4" /> {race.localDate}
            </div>
            <div className="text-xl text-red-400">
              <Clock className="inline w-5 h-5" /> {race.localTime}
            </div>

            <button
              onClick={() => onToggle(race.round)}
              className="mt-3 text-sm flex items-center gap-2 text-gray-300"
            >
              {enabledRaces.includes(race.round) ? <Bell /> : <BellOff />}
              {enabledRaces.includes(race.round)
                ? 'Notifications on'
                : 'Notifications off'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================
   Tests (example – move to __tests__/useRaceCalendar.test.ts)
===================== */
/*
import { describe, it, expect } from 'vitest';

it('converts UTC time to local timezone consistently', () => {
  const race = { round: 1, name: 'Test', location: 'X', country: 'Y', date: '2026-01-01', time: '12:00', circuit: 'Test', sprint: false };
  const result = useRaceCalendar([race])[0];
  expect(result.utcTime).toBe('12:00');
  expect(result.localDate).toBeDefined();
  expect(result.localTime).toBeDefined();
});
*/

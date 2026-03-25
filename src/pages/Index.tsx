import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { TimeEntryForm, AttendanceLog } from "@/components/AttendanceClock";
import type { AttendanceEntry } from "@/components/AttendanceClock";
import { WeeklyStats } from "@/components/WeeklyStats";
import { WeeklyChart, type DayBar } from "@/components/WeeklyChart";
import { LiveClock } from "@/components/LiveClock";

const Index = () => {
  const [editingEntry, setEditingEntry] = useState<AttendanceEntry | null>(null);
  const [entries, setEntries] = useState<AttendanceEntry[]>(() => {
    try {
      const saved = localStorage.getItem("attendance_records");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
      }
    } catch (e) {
      console.error("Failed to parse attendance records", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("attendance_records", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (entry: AttendanceEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx !== -1) {
        const newArr = [...prev];
        newArr[idx] = entry;
        return newArr;
      }
      return [entry, ...prev];
    });
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter(entry => entry.id !== id));
  };

  const { yesterdayHoursString, weeklyHoursString, daysPresent, avgHoursString, weekData } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diffToMonday);
    monday.setHours(0, 0, 0, 0);

    let totalMinsYesterday = 0;
    let totalMinsWeek = 0;
    const daysPresentSet = new Set<string>();

    const weekMap = new Map<number, number>();
    for (let i = 1; i <= 5; i++) weekMap.set(i, 0); // Mon-Fri

    entries.forEach(e => {
      const entryDate = new Date(e.date);
      const isYesterday = entryDate.toDateString() === yesterday.toDateString();
      const isThisWeek = entryDate >= monday && entryDate.getTime() < monday.getTime() + 7 * 24 * 60 * 60 * 1000;

      const [hIn, mIn] = (e.timeIn24h || e.timeIn).split(":").map(Number);
      const [hOut, mOut] = (e.timeOut24h || e.timeOut).split(":").map(Number);
      let diffMins = (hOut * 60 + mOut) - (hIn * 60 + mIn);
      if (diffMins < 0) diffMins += 24 * 60; // overnight

      if (isYesterday) {
        totalMinsYesterday += diffMins;
      }

      if (isThisWeek) {
        totalMinsWeek += diffMins;
        daysPresentSet.add(entryDate.toDateString());

        const entryDayOfWeek = entryDate.getDay();
        if (entryDayOfWeek >= 1 && entryDayOfWeek <= 5) {
          weekMap.set(entryDayOfWeek, (weekMap.get(entryDayOfWeek) || 0) + diffMins / 60);
        }
      }
    });

    const formatHours = (mins: number) => `${Math.floor(mins / 60)}h ${(mins % 60).toString().padStart(2, "0")}m`;

    // Average
    const presentCount = daysPresentSet.size;
    const avgMins = presentCount > 0 ? totalMinsWeek / presentCount : 0;
    const avgHoursFormatted = presentCount > 0 ? `${(avgMins / 60).toFixed(1)}h` : "0h";

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const computedWeekData: DayBar[] = days.map((dayName, idx) => {
      const mappedDayIndex = idx + 1; // 1 to 5
      return {
        day: dayName,
        hours: parseFloat((weekMap.get(mappedDayIndex) || 0).toFixed(1))
      };
    });

    return {
      yesterdayHoursString: formatHours(totalMinsYesterday),
      weeklyHoursString: formatHours(totalMinsWeek),
      daysPresent: presentCount,
      avgHoursString: avgHoursFormatted,
      weekData: computedWeekData
    };
  }, [entries]);

  const displayEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50 flex items-center justify-center">
        <div className="container flex h-16 items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Fingerprint className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Attend<span className="text-primary">X</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl mx-auto flex-1">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Clock + Form */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-2xl p-8 flex flex-col gap-8"
            >
              <LiveClock />
              <TimeEntryForm
                onSubmit={handleSubmit}
                initialEntry={editingEntry}
                onCancel={() => setEditingEntry(null)}
              />
            </motion.div>

            <AttendanceLog
              entries={displayEntries}
              onDelete={handleDelete}
              onEdit={setEditingEntry}
            />
          </div>

          {/* Right: Stats */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <WeeklyStats
              totalHoursYesterday={yesterdayHoursString}
              totalHoursWeek={weeklyHoursString}
              daysPresent={daysPresent}
              avgHours={avgHoursString}
            />
            <WeeklyChart data={weekData} />
          </div>
        </div>
      </main>

      <footer className="w-full py-4 mt-auto">
        <p className="text-muted-foreground text-center text-sm">Designed & Built by Jerson Sullano &#169;, All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;

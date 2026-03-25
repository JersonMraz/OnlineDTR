import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogIn, LogOut, Plus, Calendar as CalendarIcon, Trash2, Edit2, Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AttendanceEntry {
  id: string;
  timeIn: string;   // 12-hour format "08:00"
  timeOut: string;  // 12-hour format "05:00"
  timeIn24h: string; // "08:00"
  timeOut24h: string; // "17:00"
  date: Date;
  hoursWorked: string;
}

// Convert "08:00" (12h without AM/PM) to "08:00" (In) or "17:00" (Out)
export function parse12hTo24h(time12: string, isOut: boolean): string {
  if (!time12 || time12.length < 5) return "00:00";
  let [hh, mm] = time12.split(":").map(Number);

  if (isOut) {
    if (hh >= 1 && hh <= 11) {
      hh += 12; // PM hours
    }
  } else {
    // In time is AM
    if (hh === 12) {
      hh = 12; // Noon
    }
  }

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function calcHours(timeIn24h: string, timeOut24h: string): string {
  const [hIn, mIn] = timeIn24h.split(":").map(Number);
  const [hOut, mOut] = timeOut24h.split(":").map(Number);
  let diff = (hOut * 60 + mOut) - (hIn * 60 + mIn);
  if (diff < 0) diff += 24 * 60; // handle overnight
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function TimeInput({ id, value, onChange, onComplete, icon: Icon, placeholder, className }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // strip non-digits

    // If user starts typing a single digit > 1 (e.g., '8'), automatically assume '08'
    if (val.length === 1 && parseInt(val[0]) > 1) {
      val = `0${val[0]}`;
    }

    if (val.length > 4) val = val.slice(0, 4);

    // Auto format HH:MM
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}:${val.slice(2)}`;
    }

    // Validate bounds for 12-hour
    if (val.length >= 2) {
      let hh = parseInt(val.slice(0, 2));
      if (hh > 12) val = `12${val.slice(2)}`;
      if (hh === 0 && val.length > 1) val = `01${val.slice(2)}`; // no 00 hour
    }
    if (val.length === 5) {
      let mm = parseInt(val.slice(3, 5));
      if (mm > 59) val = `${val.slice(0, 3)}59`;
    }

    onChange(val);
    if (val.length === 5 && onComplete) {
      setTimeout(onComplete, 10);
    }
  };

  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />}
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`pl-10 font-mono bg-secondary border-border/50 text-foreground h-12 text-base ${className}`}
      />
    </div>
  );
}

interface TimeEntryFormProps {
  onSubmit: (entry: AttendanceEntry) => void;
  initialEntry?: AttendanceEntry | null;
  onCancel?: () => void;
}

export function TimeEntryForm({ onSubmit, initialEntry, onCancel }: TimeEntryFormProps) {
  const [dateStr, setDateStr] = useState(getTodayString());
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  useEffect(() => {
    if (initialEntry) {
      const d = initialEntry.date;
      setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      setTimeIn(initialEntry.timeIn);
      setTimeOut(initialEntry.timeOut);
    } else {
      setDateStr(getTodayString());
      setTimeIn("");
      setTimeOut("");
    }
  }, [initialEntry]);

  const handleSubmit = () => {
    if (!dateStr) {
      toast.error("Please select a date");
      return;
    }
    if (timeIn.length < 5) {
      toast.error("Please complete your Time In (HH:MM)");
      return;
    }
    if (timeOut.length < 5) {
      toast.error("Please complete your Time Out (HH:MM)");
      return;
    }

    const tIn24 = parse12hTo24h(timeIn, false);
    const tOut24 = parse12hTo24h(timeOut, true);

    const [hIn, mIn] = tIn24.split(":").map(Number);
    const [hOut, mOut] = tOut24.split(":").map(Number);
    const inMinutes = hIn * 60 + mIn;
    const outMinutes = hOut * 60 + mOut;

    if (inMinutes === outMinutes) {
      toast.error("Time Out cannot be exactly Time In");
      return;
    }

    // Split date string accurately in local timezone
    const [year, month, day] = dateStr.split("-").map(Number);
    const entryDate = new Date(year, month - 1, day);

    const entry: AttendanceEntry = {
      id: initialEntry ? initialEntry.id : crypto.randomUUID(),
      timeIn,
      timeOut,
      timeIn24h: tIn24,
      timeOut24h: tOut24,
      date: entryDate,
      hoursWorked: calcHours(tIn24, tOut24),
    };

    onSubmit(entry);

    if (!initialEntry) {
      setDateStr(getTodayString());
      setTimeIn("");
      setTimeOut("");
    }
    toast.success(initialEntry ? "Attendance updated!" : "Attendance recorded!");
  };

  const currentHoursWorked = timeIn.length === 5 && timeOut.length === 5
    ? calcHours(parse12hTo24h(timeIn, false), parse12hTo24h(timeOut, true))
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attendance Date
        </label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            onClick={(e) => {
              try {
                if ('showPicker' in HTMLInputElement.prototype) {
                  e.currentTarget.showPicker();
                }
              } catch (err) {
                // Ignore if not supported or already open
              }
            }}
            className="pl-10 font-mono bg-secondary border-border/50 text-foreground h-12 text-base w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Time In (12h)
          </label>
          <TimeInput
            id="time-in"
            value={timeIn}
            onChange={setTimeIn}
            onComplete={() => document.getElementById("time-out")?.focus()}
            icon={LogIn}
            placeholder="08:00"
            className="text-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Time Out (12h)
          </label>
          <TimeInput
            id="time-out"
            value={timeOut}
            onChange={setTimeOut}
            icon={LogOut}
            placeholder="05:00"
            className="text-destructive"
          />
        </div>
      </div>

      {currentHoursWorked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2"
        >
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm text-primary font-medium">
            {currentHoursWorked} total
          </span>
        </motion.div>
      )}

      <div className="flex gap-3">
        {initialEntry && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 font-semibold text-sm uppercase tracking-wider border-border/50 bg-secondary/50 cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          className={`h-12 font-semibold text-sm uppercase tracking-wider cursor-pointer ${initialEntry ? "flex-1 bg-primary text-primary-foreground hover:bg-primary/90" : "w-full bg-primary text-primary-foreground hover:bg-primary/90"}`}
        >
          {initialEntry ? (
            <>
              <Edit2 className="h-4 w-4 mr-2 cursor-pointer" />
              Update
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2 cursor-pointer" />
              Record Attendance
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface AttendanceLogProps {
  entries: AttendanceEntry[];
  onDelete?: (id: string) => void;
  onEdit?: (entry: AttendanceEntry) => void;
}

export function AttendanceLog({ entries, onDelete, onEdit }: AttendanceLogProps) {
  const [showExport, setShowExport] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "month" | "range">("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const d = new Date(entry.date);
      if (filterType === "month" && filterMonth) {
        const [y, m] = filterMonth.split("-").map(Number);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      }
      if (filterType === "range") {
        let pass = true;
        if (filterStart) {
          const start = new Date(filterStart);
          start.setHours(0, 0, 0, 0);
          if (d.getTime() < start.getTime()) pass = false;
        }
        if (filterEnd) {
          const end = new Date(filterEnd);
          end.setHours(23, 59, 59, 999);
          if (d.getTime() > end.getTime()) pass = false;
        }
        return pass;
      }
      return true;
    });
  }, [entries, filterType, filterMonth, filterStart, filterEnd]);

  const formatData = () => {
    return [...filteredEntries].reverse().map(entry => ({
      Date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      "Time In": entry.timeIn,
      "Time Out": entry.timeOut,
      "Total Hours": entry.hoursWorked
    }));
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(formatData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Log.csv");
    setShowExport(false);
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(formatData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Log.xlsx");
    setShowExport(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Log", 14, 15);
    const tableData = formatData().map(row => [row.Date, row["Time In"], row["Time Out"], row["Total Hours"]]);

    autoTable(doc, {
      head: [["Date", "Time In", "Time Out", "Total Hours"]],
      body: tableData,
      startY: 20,
    });

    doc.save("Attendance_Log.pdf");
    setShowExport(false);
  };

  if (entries.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-muted-foreground text-sm">No records yet</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-visible relative">
      <div className="px-5 py-3 border-b border-border/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Records
        </h3>
        {entries.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Export Dropdown Toggle */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowExport(!showExport); setShowFilter(false); }}
                className="h-8 gap-2 border-border/50 text-xs px-3 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>

              <AnimatePresence>
                {showExport && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-36 glass rounded-md overflow-hidden z-100 border border-primary/20 shadow-xl bg-background/95 backdrop-blur-xl"
                  >
                    <div className="flex flex-col py-1">
                      <button onClick={exportCSV} className="px-4 py-2.5 text-left text-sm font-medium hover:bg-primary/15 transition-colors">Export CSV</button>
                      <button onClick={exportXLSX} className="px-4 py-2.5 text-left text-sm font-medium hover:bg-primary/15 transition-colors">Export XLSX</button>
                      <button onClick={exportPDF} className="px-4 py-2.5 text-left text-sm font-medium hover:bg-primary/15 transition-colors">Export PDF</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Dropdown Toggle */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowFilter(!showFilter); setShowExport(false); }}
                className={`h-8 gap-2 border-border/50 text-xs px-3 cursor-pointer ${filterType !== "all" ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter {filterType !== "all" && "Active"}
              </Button>
              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-64 p-4 glass rounded-md overflow-hidden z-100 border border-primary/20 shadow-xl bg-background/95 backdrop-blur-xl flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Filter By</label>
                      <select
                        value={filterType}
                        onChange={(e: any) => setFilterType(e.target.value)}
                        className="w-full text-sm bg-secondary h-8 rounded-md px-2 border-border/50 text-foreground"
                      >
                        <option value="all">All Records</option>
                        <option value="month">Specific Month</option>
                        <option value="range">Date Range</option>
                      </select>
                    </div>

                    {filterType === "month" && (
                      <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Select Month</label>
                        <Input
                          type="month"
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(e.target.value)}
                          onClick={(e) => { try { if ('showPicker' in HTMLInputElement.prototype) { e.currentTarget.showPicker(); } } catch (err) { } }}
                          className="h-8 text-sm bg-secondary border-border/50 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                        />
                      </div>
                    )}

                    {filterType === "range" && (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase">Start Date</label>
                          <Input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} onClick={(e) => { try { if ('showPicker' in HTMLInputElement.prototype) { e.currentTarget.showPicker(); } } catch (err) { } }} className="h-8 text-sm bg-secondary border-border/50 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase">End Date</label>
                          <Input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} onClick={(e) => { try { if ('showPicker' in HTMLInputElement.prototype) { e.currentTarget.showPicker(); } } catch (err) { } }} className="h-8 text-sm bg-secondary border-border/50 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      <div className="divide-y divide-border/30 max-h-[340px] overflow-y-auto custom-scrollbar">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No records found for the active filter.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-5 py-4 group"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-white-foreground/70 uppercase">
                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
                        <LogIn className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <span className="font-mono text-sm text-foreground">{entry.timeIn}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">→</span>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/15">
                        <LogOut className="h-3.5 w-3.5 text-destructive" />
                      </span>
                      <span className="font-mono text-sm text-foreground">{entry.timeOut}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-primary">
                    {entry.hoursWorked}
                  </span>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(entry)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                        title="Edit record"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

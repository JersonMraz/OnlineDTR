import { motion } from "framer-motion";

export interface DayBar {
  day: string;
  hours: number;
  maxHours?: number;
}

interface WeeklyChartProps {
  data: DayBar[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.map((d) => d.hours), 10);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Weekly Overview
      </h3>
      <div className="flex items-end gap-3 h-32">
        {data.map((day, i) => {
          const height = day.hours > 0 ? (day.hours / max) * 100 : 4;
          const isToday = i === new Date().getDay() - 1;
          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {day.hours > 0 ? `${day.hours}h` : "—"}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className={`w-full rounded-t-md ${
                  isToday
                    ? "bg-primary"
                    : day.hours > 0
                    ? "bg-primary/30"
                    : "bg-border/50"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Clock, TrendingUp, Calendar, Timer } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ icon, label, value, subtitle, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

interface WeeklyStatsProps {
  totalHoursYesterday: string;
  totalHoursWeek: string;
  daysPresent: number;
  avgHours: string;
}

export function WeeklyStats({
  totalHoursYesterday,
  totalHoursWeek,
  daysPresent,
  avgHours,
}: WeeklyStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<Timer className="h-5 w-5" />}
        label="Yesterday"
        value={totalHoursYesterday}
        subtitle="Hours worked"
        delay={0}
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="This Week"
        value={totalHoursWeek}
        subtitle="Total hours"
        delay={0.1}
      />
      <StatCard
        icon={<Calendar className="h-5 w-5" />}
        label="Present"
        value={`${daysPresent}/5`}
        subtitle="Days this week"
        delay={0.2}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Average"
        value={avgHours}
        subtitle="Hours per day"
        delay={0.3}
      />
    </div>
  );
}

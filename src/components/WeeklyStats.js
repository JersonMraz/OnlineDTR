import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Calendar, Timer } from "lucide-react";
function StatCard({ icon, label, value, subtitle, delay = 0 }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 }, className: "glass rounded-xl p-5 flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: icon }), _jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: label })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-foreground font-mono", children: value }), subtitle && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: subtitle }))] })] }));
}
export function WeeklyStats({ totalHoursYesterday, totalHoursWeek, daysPresent, avgHours, }) {
    return (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatCard, { icon: _jsx(Timer, { className: "h-5 w-5" }), label: "Yesterday", value: totalHoursYesterday, subtitle: "Hours worked", delay: 0 }), _jsx(StatCard, { icon: _jsx(Clock, { className: "h-5 w-5" }), label: "This Week", value: totalHoursWeek, subtitle: "Total hours", delay: 0.1 }), _jsx(StatCard, { icon: _jsx(Calendar, { className: "h-5 w-5" }), label: "Present", value: `${daysPresent}/5`, subtitle: "Days this week", delay: 0.2 }), _jsx(StatCard, { icon: _jsx(TrendingUp, { className: "h-5 w-5" }), label: "Average", value: avgHours, subtitle: "Hours per day", delay: 0.3 })] }));
}

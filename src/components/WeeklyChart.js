import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
export function WeeklyChart({ data }) {
    const max = Math.max(...data.map((d) => d.hours), 10);
    return (_jsxs("div", { className: "glass rounded-xl p-5", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4", children: "Weekly Overview" }), _jsx("div", { className: "flex items-end gap-3 h-32", children: data.map((day, i) => {
                    const height = day.hours > 0 ? (day.hours / max) * 100 : 4;
                    const isToday = i === new Date().getDay() - 1;
                    return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-2", children: [_jsx("span", { className: "text-xs font-mono text-muted-foreground", children: day.hours > 0 ? `${day.hours}h` : "—" }), _jsx(motion.div, { initial: { height: 0 }, animate: { height: `${height}%` }, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }, className: `w-full rounded-t-md ${isToday
                                    ? "bg-primary"
                                    : day.hours > 0
                                        ? "bg-primary/30"
                                        : "bg-border/50"}` }), _jsx("span", { className: `text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`, children: day.day })] }, day.day));
                }) })] }));
}

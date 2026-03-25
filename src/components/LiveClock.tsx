import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <motion.p
        key={timeStr}
        initial={{ opacity: 0.6, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-5xl font-semibold tracking-tight text-foreground"
      >
        {timeStr}
      </motion.p>
      <p className="mt-2 text-muted-foreground text-sm tracking-wide uppercase">
        {dateStr}
      </p>
    </div>
  );
}

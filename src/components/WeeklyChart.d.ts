export interface DayBar {
    day: string;
    hours: number;
    maxHours?: number;
}
interface WeeklyChartProps {
    data: DayBar[];
}
export declare function WeeklyChart({ data }: WeeklyChartProps): import("react/jsx-runtime").JSX.Element;
export {};

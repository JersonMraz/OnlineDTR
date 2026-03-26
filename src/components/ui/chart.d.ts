import * as React from "react";
import * as RechartsPrimitive from "recharts";
declare const THEMES: {
    readonly light: "";
    readonly dark: ".dark";
};
export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode;
        icon?: React.ComponentType;
    } & ({
        color?: string;
        theme?: never;
    } | {
        color?: never;
        theme: Record<keyof typeof THEMES, string>;
    });
};
declare const ChartContainer: React.ForwardRefExoticComponent<Omit<React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: React.ReactNode;
}, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const ChartStyle: ({ id, config }: {
    id: string;
    config: ChartConfig;
}) => import("react/jsx-runtime").JSX.Element | null;
declare const ChartTooltip: typeof RechartsPrimitive.Tooltip;
type ChartTooltipContentProps = React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: Array<Record<string, unknown>>;
    label?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode;
    labelClassName?: string;
    formatter?: (...args: unknown[]) => React.ReactNode;
    color?: string;
};
declare const ChartTooltipContent: React.ForwardRefExoticComponent<Omit<ChartTooltipContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const ChartLegend: React.MemoExoticComponent<(outsideProps: RechartsPrimitive.LegendProps) => React.ReactPortal | null>;
type ChartLegendContentProps = React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
    payload?: {
        dataKey?: string | number;
        value?: string;
        color?: string;
    }[];
    verticalAlign?: "top" | "bottom" | "middle";
};
declare const ChartLegendContent: React.ForwardRefExoticComponent<Omit<ChartLegendContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };

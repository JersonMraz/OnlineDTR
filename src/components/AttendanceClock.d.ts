export interface AttendanceEntry {
    id: string;
    timeIn: string;
    timeOut: string;
    timeIn24h: string;
    timeOut24h: string;
    date: Date;
    hoursWorked: string;
}
export declare function parse12hTo24h(time12: string, isOut: boolean): string;
interface TimeEntryFormProps {
    onSubmit: (entry: AttendanceEntry) => void;
    initialEntry?: AttendanceEntry | null;
    onCancel?: () => void;
}
export declare function TimeEntryForm({ onSubmit, initialEntry, onCancel }: TimeEntryFormProps): import("react/jsx-runtime").JSX.Element;
interface AttendanceLogProps {
    entries: AttendanceEntry[];
    onDelete?: (id: string) => void;
    onEdit?: (entry: AttendanceEntry) => void;
}
export declare function AttendanceLog({ entries, onDelete, onEdit }: AttendanceLogProps): import("react/jsx-runtime").JSX.Element;
export {};

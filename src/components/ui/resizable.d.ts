import { Group, Panel, Separator } from "react-resizable-panels";
declare const ResizablePanelGroup: ({ className, ...props }: React.ComponentProps<typeof Group>) => import("react/jsx-runtime").JSX.Element;
declare const ResizablePanel: typeof Panel;
declare const ResizableHandle: ({ withHandle, className, ...props }: React.ComponentProps<typeof Separator> & {
    withHandle?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

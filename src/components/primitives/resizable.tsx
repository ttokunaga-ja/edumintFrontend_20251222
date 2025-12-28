// @ts-nocheck
"use client"; import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels"; function ResizablePanelGroup({ , ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) { return ( <ResizablePrimitive.PanelGroup data-slot="resizable-panel-group" {...props} /> );
} function ResizablePanel({ ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) { return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
} function ResizableHandle({ withHandle, ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & { withHandle?: boolean;
}) { return ( <ResizablePrimitive.PanelResizeHandle data-slot="resizable-handle" {...props} > {withHandle && ( <div style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <GripVerticalIcon /> </div> )} </ResizablePrimitive.PanelResizeHandle> );
} export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

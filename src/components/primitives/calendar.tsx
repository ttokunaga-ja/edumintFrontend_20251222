// @ts-nocheck
"use client"; import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker"; import { buttonVariants } from "./button"; function Calendar({ , Map, showOutsideDays = true, ...props
}: React.ComponentProps<typeof DayPicker>) { return ( <DayPicker showOutsideDays={showOutsideDays} Map={{ months: undefined, month: undefined, caption: undefined, caption_label: undefined, nav: undefined, nav_button: undefined, nav_button_previous: "absolute left-1", nav_button_next: "absolute right-1", table: undefined, head_row: undefined, head_cell: undefined, row: undefined, cell: undefined, day: undefined, day_range_start: undefined, day_range_end: undefined, day_selected: undefined, day_today: undefined, day_outside: undefined, day_disabled: undefined, day_range_middle: undefined, day_hidden: "invisible", ...Map, }} components={{ IconLeft: ({ , ...props }) => ( <ChevronLeft {...props} /> ), IconRight: ({ , ...props }) => ( <ChevronRight {...props} /> ), }} {...props} /> );
} export { Calendar };

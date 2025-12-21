import { contentHandlers } from "./contentHandlers";
import { filesHandlers } from "./filesHandlers";
import { generationHandlers } from "./generationHandlers";
import { healthHandlers } from "./healthHandlers";
import { notificationsHandlers } from "./notificationsHandlers";
import { searchHandlers } from "./searchHandlers";
import { userHandlers } from "./userHandlers";

export const handlers = [
  ...healthHandlers,
  ...searchHandlers,
  ...notificationsHandlers,
  ...contentHandlers,
  ...generationHandlers,
  ...filesHandlers,
  ...userHandlers,
];

import { authHandlers } from "./authHandlers";
import { contentHandlers } from "./contentHandlers";
import { filesHandlers } from "./filesHandlers";
import { generationHandlers } from "./generationHandlers";
import { healthHandlers } from "./healthHandlers";
import { notificationsHandlers } from "./notificationsHandlers";
import { searchHandlers } from "./searchHandlers";
import { userHandlers } from "./userHandlers";
import { problemHandlers } from "./problemHandlers";

export const handlers = [
  ...(Array.isArray(authHandlers) ? authHandlers : []),
  ...(Array.isArray(healthHandlers) ? healthHandlers : []),
  ...(Array.isArray(searchHandlers) ? searchHandlers : []),
  ...(Array.isArray(notificationsHandlers) ? notificationsHandlers : []),
  ...(Array.isArray(contentHandlers) ? contentHandlers : []),
  ...(Array.isArray(generationHandlers) ? generationHandlers : []),
  ...(Array.isArray(filesHandlers) ? filesHandlers : []),
  ...(Array.isArray(userHandlers) ? userHandlers : []),
  ...(Array.isArray(problemHandlers) ? problemHandlers : []),
];

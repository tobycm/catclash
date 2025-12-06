import { treaty } from "@elysiajs/eden";
import type { TobyAPI } from "../../../../backend/src/index";

export const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3457" : window.location.origin);

const api = treaty<TobyAPI>(apiUrl);

export { api };

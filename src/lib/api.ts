import axios from "axios";
import { appPath } from "@/src/lib/app-path";

export const apiClient = axios.create({
  baseURL: appPath("/api"),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

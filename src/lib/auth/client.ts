"use client";

import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { toast } from "sonner";
import { handleErrorWithToast } from "ui/shared-toast";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:3000",
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
        return;
      }
      handleErrorWithToast(e.error);
    },
  },
});

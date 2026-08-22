import { createContext, useContext } from "react";

export const JackSession = createContext<{ onClose?: () => void }>({});

export function useJackSession() {
  return useContext(JackSession);
}

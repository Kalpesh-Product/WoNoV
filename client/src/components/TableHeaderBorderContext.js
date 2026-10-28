import { createContext } from "react";

// Tracks the nearest section title, including through table wrappers.
export const TableHeaderBorderContext = createContext(false);

export const shouldHideTableHeaderDivider = (explicit, borderedSectionTitle, hasOwnTitle) =>
  explicit ?? (borderedSectionTitle && !hasOwnTitle);

export const shouldStackTableToolbar = ({ width, searchWidth = 0, dateWidth = 0, actionsWidth = 0, gap = 12 }) =>
  width < dateWidth + 2 * Math.max(searchWidth, actionsWidth) + 2 * gap;

export const configYearlyGrpah = ({
  key,
  chartId,
  title,
  titleAmountLabel,
}) => {
  const graph = [
    {
      key,
      chartId,
      title,
      titleAmountLabel,
    },
  ];
  return graph;
};

export const filterPermissions = (config, userPermissions) => {
  return config.filter(
    (widget) => !widget.key || userPermissions.includes(widget.key)
  );
};

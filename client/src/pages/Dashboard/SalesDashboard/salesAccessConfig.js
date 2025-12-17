export const salesConfigYearlyGrpah = (
  key,
  chartId,
  data,
  options,
  title,
  titleAmount,
  onYearChange
) => {
  const graph = [
    {
      key,
      chartId,
      data,
      options,
      title,
      titleAmount,
      onYearChange,
    },
  ];

  return graph;
};

export const salesFilterPermissions = (config, userPermissions) => {
  return config.filter(
    (widget) => !widget.key || userPermissions.includes(widget.key)
  );
};

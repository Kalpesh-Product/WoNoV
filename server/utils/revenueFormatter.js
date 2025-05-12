const transformRevenues = (revenues, dateKey, revenueKey) => {
  const monthlyMap = new Map();

  revenues.forEach((item, index) => {
    const rentDate = new Date(item[dateKey]);
    const monthKey = `${rentDate.toLocaleString("default", {
      month: "short",
    })}-${rentDate.getFullYear().toString().slice(-2)}`;

    const actual = item[revenueKey];

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        actual: 0,
        clients: [],
      });
    }

    const monthData = monthlyMap.get(monthKey);
    monthData.actual += actual;

    monthData.clients.push({
      clientName: item.clientName.clientName,
      revenue: actual,
      channel: item.channel,
      status: item.status || "Paid",
    });
  });

  return Array.from(monthlyMap.values()).map((monthData) => ({
    ...monthData,
    actual: monthData.actual,
  }));
};

module.exports = transformRevenues;

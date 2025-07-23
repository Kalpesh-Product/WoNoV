const sortByNumberDesc = (arr, key) => {
  return [...arr].sort((a, b) => (b[key] || 0) - (a[key] || 0));
};

export default sortByNumberDesc;
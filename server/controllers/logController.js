const getLogs = async (req, res, next) => {
  try {
    const fetchedLogs = await Log.find().populate([
      { path: "performedBy", select: "firstName middleName lastName" },
    ]);

    if (!fetchedLogs) {
      return res.status(200).json([]);
    }

    return res.status(200).json(fetchedLogs);
  } catch (error) {
    next(error);
  }
};

module.exports = getLogs;

const setAuditLogContext = (req, action, payload = {}) => {
  req.logContext = {
    ...(req.logContext || {}),
    action,
    payload: {
      ...(req.logContext?.payload || {}),
      ...payload,
    },
  };
};

module.exports = setAuditLogContext;

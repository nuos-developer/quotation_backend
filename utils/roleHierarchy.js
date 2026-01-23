module.exports.canAccessRole = (currentUserLevel, targetRoleLevel) => {
  return currentUserLevel > targetRoleLevel;
};

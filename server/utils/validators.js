const emailPattern = /^\S+@\S+\.\S+$/;

export const registerRules = [
  ({ name }) => (!name || name.trim().length < 2 ? "Name must be at least 2 characters." : null),
  ({ email }) => (!emailPattern.test(String(email || "").trim()) ? "Enter a valid email address." : null),
  ({ password }) => (!password || password.length < 8 ? "Password must be at least 8 characters." : null),
];

export const loginRules = [
  ({ email }) => (!emailPattern.test(String(email || "").trim()) ? "Enter a valid email address." : null),
  ({ password }) => (!password ? "Password is required." : null),
];

export const profileRules = [
  ({ name }) => (!name || name.trim().length < 2 ? "Name must be at least 2 characters." : null),
  ({ email }) => (!emailPattern.test(String(email || "").trim()) ? "Enter a valid email address." : null),
];

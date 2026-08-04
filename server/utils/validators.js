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

const projectStatuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

const isValidDate = (value) => !value || !Number.isNaN(new Date(value).getTime());

export const projectRules = [
  ({ name }) => (!name || name.trim().length < 2 ? "Project name must be at least 2 characters." : null),
  ({ status }) => (status && !projectStatuses.includes(status) ? "Choose a valid project status." : null),
  ({ startDate }) => (!isValidDate(startDate) ? "Start date must be a valid date." : null),
  ({ endDate }) => (!isValidDate(endDate) ? "End date must be a valid date." : null),
  ({ budget }) => {
    if (budget === undefined || budget === null || budget === "") return null;
    return Number.isNaN(Number(budget)) || Number(budget) < 0 ? "Budget must be a positive number." : null;
  },
  ({ startDate, endDate }) => {
    if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) return null;
    return new Date(endDate) < new Date(startDate) ? "End date cannot be before start date." : null;
  },
];

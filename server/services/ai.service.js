export const getAiReadiness = () => ({
  enabled: process.env.AI_ENABLED === "true",
  provider: process.env.AI_PROVIDER || null,
});

export const getMetaEnv = (): Record<string, string | boolean | undefined> => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env as unknown as Record<string, string | boolean | undefined>;
  }
  return {};
};

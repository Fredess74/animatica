/// <reference types="vite/client" />
import React, { createContext, useContext, ReactNode, useMemo } from 'react';

export interface FeatureFlags {
  characters: boolean;
  export: boolean;
  aiPrompts: boolean;
  multiplayer: boolean;
  cloudSync: boolean;
}

const DEFAULT_FLAGS_DEV: FeatureFlags = {
  characters: true,
  export: true,
  aiPrompts: true,
  multiplayer: true,
  cloudSync: true,
};

const DEFAULT_FLAGS_PROD: FeatureFlags = {
  characters: false,
  export: false,
  aiPrompts: false,
  multiplayer: false,
  cloudSync: false,
};

// Helper to get raw env value safely
const getRawEnv = (key: string, env: Record<string, string | boolean | undefined>): string | undefined => {
  const val = env[key];
  if (typeof val === 'string') return val;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return undefined;
};

export const getFeatureFlags = (
  envMode: string = import.meta.env.MODE,
  env: Record<string, string | boolean | undefined> = import.meta.env as unknown as Record<string, string | boolean | undefined>
): FeatureFlags => {
  const isDev = envMode === 'development';
  const defaults = isDev ? DEFAULT_FLAGS_DEV : DEFAULT_FLAGS_PROD;

  const getEnvFlag = (key: string, fallback: boolean): boolean => {
    // Look for VITE_FEATURE_FLAG_KEY_NAME
    // We need to convert camelCase to SNAKE_CASE for env vars
    // e.g. aiPrompts -> AI_PROMPTS
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
    const envKey = `VITE_FEATURE_FLAG_${snakeKey}`;

    const value = getRawEnv(envKey, env);

    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  };

  return {
    characters: getEnvFlag('characters', defaults.characters),
    export: getEnvFlag('export', defaults.export),
    aiPrompts: getEnvFlag('aiPrompts', defaults.aiPrompts),
    multiplayer: getEnvFlag('multiplayer', defaults.multiplayer),
    cloudSync: getEnvFlag('cloudSync', defaults.cloudSync),
  };
};

// Initialize context with default values based on current environment
const FeatureFlagContext = createContext<FeatureFlags>(getFeatureFlags());

export interface FeatureFlagProviderProps {
  children: ReactNode;
  initialFlags?: Partial<FeatureFlags>;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children, initialFlags }) => {
  const flags = useMemo(() => {
    // Re-calculate based on current environment (defaults) but allowing overrides
    const currentFlags = getFeatureFlags();
    // Merge current environment flags with any overrides passed via props
    return { ...currentFlags, ...initialFlags };
  }, [initialFlags]);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlag = (key: keyof FeatureFlags): boolean => {
  const flags = useContext(FeatureFlagContext);
  return flags[key];
};

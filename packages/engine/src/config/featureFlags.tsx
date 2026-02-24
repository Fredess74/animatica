/// <reference types="vite/client" />
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { getMetaEnv } from './utils';

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

export const getFeatureFlags = (
  envMode?: string,
  env?: Record<string, string | boolean | undefined>
): FeatureFlags => {
  const metaEnv = env || getMetaEnv();
  // Safe access to MODE, defaulting to production if undefined
  const mode = envMode || (metaEnv.MODE as string) || 'production';
  const isDev = mode === 'development';
  const defaults = isDev ? DEFAULT_FLAGS_DEV : DEFAULT_FLAGS_PROD;

  const getEnvFlag = (key: string): boolean | undefined => {
    // Convert key to env var format: aiPrompts -> AI_PROMPTS
    // Actually simpler to just pass the expected env suffix
    const envKey = `VITE_FEATURE_FLAG_${key.toUpperCase()}`;
    const value = metaEnv[envKey];
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  };

  return {
    characters: getEnvFlag('CHARACTERS') ?? defaults.characters,
    export: getEnvFlag('EXPORT') ?? defaults.export,
    aiPrompts: getEnvFlag('AI_PROMPTS') ?? defaults.aiPrompts,
    multiplayer: getEnvFlag('MULTIPLAYER') ?? defaults.multiplayer,
    cloudSync: getEnvFlag('CLOUD_SYNC') ?? defaults.cloudSync,
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

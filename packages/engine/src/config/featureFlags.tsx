/// <reference types="vite/client" />
import React, { createContext, useContext, ReactNode, useMemo } from 'react';

export interface FeatureFlags {
  characters: boolean;
  export: boolean;
  ai_prompts: boolean;
  multiplayer: boolean;
  cloud_sync: boolean;
}

const DEFAULT_FLAGS_DEV: FeatureFlags = {
  characters: true,
  export: true,
  ai_prompts: true,
  multiplayer: true,
  cloud_sync: true,
};

const DEFAULT_FLAGS_PROD: FeatureFlags = {
  characters: false,
  export: false,
  ai_prompts: false,
  multiplayer: false,
  cloud_sync: false,
};

// Helper to safely access import.meta.env (Vite) or fallback (Next.js/Node)
const getMetaEnv = () => {
  try {
    // @ts-ignore
    return import.meta.env || { MODE: 'development' };
  } catch {
    return { MODE: 'development' };
  }
};

export const getFeatureFlags = (
  envMode: string = getMetaEnv().MODE,
  // Cast to Record<string, string> because ImportMetaEnv has an index signature but we want to be safe
  env: Record<string, string | boolean | undefined> = getMetaEnv() as unknown as Record<string, string | boolean | undefined>
): FeatureFlags => {
  const isDev = envMode === 'development';
  const defaults = isDev ? DEFAULT_FLAGS_DEV : DEFAULT_FLAGS_PROD;

  const getEnvFlag = (key: string): boolean | undefined => {
    const envKey = `VITE_FEATURE_FLAG_${key.toUpperCase()}`;
    // Access as string because env vars are usually strings
    const value = env[envKey];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  };

  return {
    characters: getEnvFlag('characters') ?? defaults.characters,
    export: getEnvFlag('export') ?? defaults.export,
    ai_prompts: getEnvFlag('ai_prompts') ?? defaults.ai_prompts,
    multiplayer: getEnvFlag('multiplayer') ?? defaults.multiplayer,
    cloud_sync: getEnvFlag('cloud_sync') ?? defaults.cloud_sync,
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

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

// Helper to parse flag value from env var or override
const parseFlag = (val: string | boolean | undefined, defaultVal: boolean): boolean => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return defaultVal;
};

export const getFeatureFlags = (
  envMode: string = import.meta.env.MODE,
  overrides?: Record<string, string | boolean>,
  // Allow injecting source for testing isolation (defaults to import.meta.env)
  envSource: Record<string, string | boolean | undefined> = import.meta.env as unknown as Record<string, string | boolean | undefined>
): FeatureFlags => {
  const isDev = envMode === 'development';
  const defaults = isDev ? DEFAULT_FLAGS_DEV : DEFAULT_FLAGS_PROD;

  return {
    characters: parseFlag(
      overrides?.VITE_FEATURE_FLAG_CHARACTERS ?? envSource.VITE_FEATURE_FLAG_CHARACTERS,
      defaults.characters
    ),
    export: parseFlag(
      overrides?.VITE_FEATURE_FLAG_EXPORT ?? envSource.VITE_FEATURE_FLAG_EXPORT,
      defaults.export
    ),
    aiPrompts: parseFlag(
      overrides?.VITE_FEATURE_FLAG_AI_PROMPTS ?? envSource.VITE_FEATURE_FLAG_AI_PROMPTS,
      defaults.aiPrompts
    ),
    multiplayer: parseFlag(
      overrides?.VITE_FEATURE_FLAG_MULTIPLAYER ?? envSource.VITE_FEATURE_FLAG_MULTIPLAYER,
      defaults.multiplayer
    ),
    cloudSync: parseFlag(
      overrides?.VITE_FEATURE_FLAG_CLOUD_SYNC ?? envSource.VITE_FEATURE_FLAG_CLOUD_SYNC,
      defaults.cloudSync
    ),
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

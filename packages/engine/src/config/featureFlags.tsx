/// <reference types="vite/client" />
import React, { createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * Interface defining all available feature flags.
 */
export interface FeatureFlags {
  /** Whether character actors are enabled. */
  characters: boolean;
  /** Whether video export is enabled. */
  export: boolean;
  /** Whether AI prompt generation is enabled. */
  ai_prompts: boolean;
  /** Whether multiplayer features are enabled. */
  multiplayer: boolean;
  /** Whether cloud sync is enabled. */
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

/**
 * Retrieves the current feature flags based on the environment (dev/prod) and overrides.
 * Checks `import.meta.env.VITE_FEATURE_FLAG_*` for overrides.
 *
 * @param envMode The current environment mode (default: import.meta.env.MODE).
 * @param env The environment variables object (default: import.meta.env).
 * @returns The computed feature flags.
 */
export const getFeatureFlags = (
  envMode: string = import.meta.env.MODE,
  // Cast to Record<string, string> because ImportMetaEnv has an index signature but we want to be safe
  env: Record<string, string | boolean | undefined> = import.meta.env as unknown as Record<string, string | boolean | undefined>
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

/**
 * Props for the FeatureFlagProvider component.
 */
export interface FeatureFlagProviderProps {
  children: ReactNode;
  /** Optional initial flags to override defaults. */
  initialFlags?: Partial<FeatureFlags>;
}

/**
 * Context provider for feature flags.
 * Wraps the application to make feature flags available via `useFeatureFlag`.
 *
 * @component
 */
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

/**
 * Hook to check if a specific feature is enabled.
 *
 * @param key The key of the feature flag to check.
 * @returns True if the feature is enabled, false otherwise.
 *
 * @example
 * ```tsx
 * const showExport = useFeatureFlag('export');
 * if (showExport) { ... }
 * ```
 */
export const useFeatureFlag = (key: keyof FeatureFlags): boolean => {
  const flags = useContext(FeatureFlagContext);
  return flags[key];
};

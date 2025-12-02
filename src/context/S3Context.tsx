import React, { createContext, useContext, type ReactNode } from 'react';
import type { S3Config } from '../types';

interface S3ContextValue extends S3Config {
  isConfigured: boolean;
}

const S3Context = createContext<S3ContextValue | undefined>(undefined);

interface S3ProviderProps {
  children: ReactNode;
  config: S3Config;
}

export const S3Provider: React.FC<S3ProviderProps> = ({ children, config }) => {
  const value: S3ContextValue = {
    ...config,
    isConfigured: !!(
      config.bucket &&
      config.region &&
      (config.getPresignedUrl ||
        (config.uploadPresignedUrlEndpoint &&
          config.downloadPresignedUrlEndpoint))
    ),
  };

  return <S3Context.Provider value={value}>{children}</S3Context.Provider>;
};

export const useS3Config = (): S3ContextValue => {
  const context = useContext(S3Context);
  if (!context) {
    throw new Error('useS3Config must be used within S3Provider');
  }
  return context;
};

export interface SecurityHeader {
  key: string;
  value: string;
}

export const securityHeaders: SecurityHeader[];
export const privateCacheHeaders: SecurityHeader[];
export const adminProtectedResponseSource: string;
export const portalProtectedResponseSource: string;

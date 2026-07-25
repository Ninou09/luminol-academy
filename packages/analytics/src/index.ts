export type AnalyticsEvent = {
  name: string;
  properties?: Readonly<Record<string, string | number | boolean>>;
};
export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void | Promise<void>;
}
export const noopAnalytics: AnalyticsAdapter = { track: () => undefined };

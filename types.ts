
export enum Scene {
  DASHBOARD = 'DASHBOARD',
  SCENARIOS = 'SCENARIOS',
  MEDICINE = 'MEDICINE',
  ANALYTICS = 'ANALYTICS',
  EMERGENCY = 'EMERGENCY',
  ASHA_CONNECT = 'ASHA_CONNECT',
  FALL_DETECTION = 'FALL_DETECTION',
  FAMILY_ALBUM = 'FAMILY_ALBUM',
  NAVIGATION = 'NAVIGATION',
  CHECK_IN = 'CHECK_IN'
}

export interface Vitals {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  glucose: number;
  steps: number;
  stress: number; // 0-100
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  subtext?: string;
}

export interface ScenarioConfig {
  name: string;
  vitalsTarget: Partial<Vitals>;
  alert?: Alert;
  aiMessage?: string;
}
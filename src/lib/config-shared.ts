export interface AppConfig {
  nomeClinica: string
  tema: string
}

export const DEFAULT_CONFIG: AppConfig = {
  nomeClinica: 'RBClinic',
  tema: 'terra',
}

// ===== Mock data for the Cyber Scorecard prototype =====
// Edit any of these and the prototype updates live.

export type Band = 'safe' | 'warn' | 'crit'

export interface Metric {
  name: string
  source: 'wiz' | 'semgrep' | 'jira' | 'sonic'
  value: string
  band: Band
  delta?: { dir: 'up' | 'down' | 'flat'; amount: string }
  changed?: boolean
}

export interface IndexCard {
  code: 'CVEI' | 'HREI' | 'SCREI'
  name: string
  score: number
  band: Band
  delta: { dir: 'up' | 'down' | 'flat'; amount: number }
  note: string
}

export interface AgentInsight {
  title: string
  body: string
  recommendation: string
  projectedImpact: string
  code?: string
}

export interface Team {
  id: string
  name: string
  overallScore: number
  band: Band
  deltaDay: { dir: 'up' | 'down' | 'flat'; amount: number; note: string }
  deltaBaseline: { dir: 'up' | 'down' | 'flat'; amount: number; daysSince: number }
  comparison: {
    you: number
    orgAverage: number
    topQuartile: number
  }
  indices: IndexCard[]
  topMover: {
    indexCode: 'CVEI' | 'HREI' | 'SCREI'
    indexName: string
    direction: 'up' | 'down'
    amount: number
    driver: string
  }
  cveiDetail: {
    metrics: Metric[]
    agent: AgentInsight
  }
}

// ===== The default mock team — team-checkout, currently CRITICAL =====
export const defaultTeam: Team = {
  id: 'team-checkout',
  name: 'team-checkout',
  overallScore: 78,
  band: 'crit',
  deltaDay: { dir: 'up', amount: 6, note: 'CVEI drove the change' },
  deltaBaseline: { dir: 'up', amount: 9, daysSince: 49 },
  comparison: {
    you: 72,
    orgAverage: 64,
    topQuartile: 41,
  },
  indices: [
    {
      code: 'CVEI',
      name: 'Composite Vulnerability',
      score: 78,
      band: 'crit',
      delta: { dir: 'up', amount: 6 },
      note: '1 metric moved',
    },
    {
      code: 'HREI',
      name: 'Human Risk',
      score: 41,
      band: 'warn',
      delta: { dir: 'flat', amount: 0 },
      note: 'stable',
    },
    {
      code: 'SCREI',
      name: 'Supply Chain',
      score: 97,
      band: 'crit',
      delta: { dir: 'down', amount: 1 },
      note: '2 TRFs closed',
    },
  ],
  topMover: {
    indexCode: 'CVEI',
    indexName: 'Composite Vulnerability',
    direction: 'up',
    amount: 6,
    driver: '12 new EKS findings in cluster-x',
  },
  cveiDetail: {
    metrics: [
      { name: 'EKS Posture Compliance', source: 'wiz', value: '70%', band: 'crit', delta: { dir: 'down', amount: '−3' }, changed: true },
      { name: 'AWS Posture Compliance', source: 'wiz', value: '51%', band: 'warn' },
      { name: 'Access Keys Not Rotated', source: 'wiz', value: '227', band: 'crit' },
      { name: 'Open Bug Bounty Critical', source: 'jira', value: '2', band: 'warn' },
      { name: 'Prioritised Vulnerabilities', source: 'wiz', value: '121', band: 'crit' },
    ],
    agent: {
      title: 'Why CVEI rose 6 points',
      body: '12 new findings appeared in cluster-x overnight. All trace to the same base image — a newer version patches all 12.',
      recommendation: 'Bump base image across services in team-checkout.',
      projectedImpact: 'CVEI −4 in 24h',
      code: 'jet-node:18-alpine → v2.1.4',
    },
  },
}

// ===== Alternative team states (for the band selector) =====
export const teamStates: Record<Band, Partial<Team>> = {
  crit: {
    overallScore: 78,
    band: 'crit',
    deltaDay: { dir: 'up', amount: 6, note: 'CVEI drove the change' },
    deltaBaseline: { dir: 'up', amount: 9, daysSince: 49 },
    comparison: { you: 78, orgAverage: 64, topQuartile: 41 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 78, band: 'crit', delta: { dir: 'up', amount: 6 }, note: '1 metric moved' },
      { code: 'HREI', name: 'Human Risk',              score: 41, band: 'warn', delta: { dir: 'flat', amount: 0 }, note: 'stable' },
      { code: 'SCREI', name: 'Supply Chain',           score: 97, band: 'crit', delta: { dir: 'down', amount: 1 }, note: '2 TRFs closed' },
    ],
  },
  warn: {
    overallScore: 56,
    band: 'warn',
    deltaDay: { dir: 'up', amount: 2, note: 'HREI ticked up' },
    deltaBaseline: { dir: 'up', amount: 4, daysSince: 49 },
    comparison: { you: 56, orgAverage: 64, topQuartile: 41 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 56, band: 'warn', delta: { dir: 'down', amount: 4 }, note: '4 findings resolved' },
      { code: 'HREI', name: 'Human Risk',              score: 32, band: 'safe', delta: { dir: 'down', amount: 6 }, note: 'training complete' },
      { code: 'SCREI', name: 'Supply Chain',           score: 67, band: 'warn', delta: { dir: 'down', amount: 3 }, note: '3 TRFs closed' },
    ],
  },
  safe: {
    overallScore: 24,
    band: 'safe',
    deltaDay: { dir: 'down', amount: 3, note: '6 vulns mitigated' },
    deltaBaseline: { dir: 'down', amount: 12, daysSince: 49 },
    comparison: { you: 24, orgAverage: 64, topQuartile: 41 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 22, band: 'safe', delta: { dir: 'down', amount: 8 }, note: 'base image patched' },
      { code: 'HREI', name: 'Human Risk',              score: 19, band: 'safe', delta: { dir: 'down', amount: 3 }, note: 'training complete' },
      { code: 'SCREI', name: 'Supply Chain',           score: 42, band: 'warn', delta: { dir: 'down', amount: 2 }, note: '2 TRFs outstanding' },
    ],
  },
}

// ===== Band thresholds =====
export const BAND_THRESHOLDS = {
  safeMax: 40,   // 0–40 = safe
  warnMax: 70,   // 40–70 = warning
                 // 70+   = critical
} as const

export function bandFor(score: number): Band {
  if (score < BAND_THRESHOLDS.safeMax) return 'safe'
  if (score < BAND_THRESHOLDS.warnMax) return 'warn'
  return 'crit'
}

export function bandLabel(band: Band): string {
  return band === 'safe' ? 'Low Exposure'
       : band === 'warn' ? 'Elevated Risk'
       : 'Critical Risk'
}

// ===== Project + product config =====
export const product = {
  name: 'Cyber Scorecard',
  host: 'Sonic Portal',
  url: 'sonic.jet.internal',
  refreshCadence: 'daily',
  lastUpdated: '09:02',
  baselineDate: '31 Mar',
  feedbackUrl: 'https://justeattakeaway.enterprise.slack.com/archives/C0B5Q22Q6QY',
}

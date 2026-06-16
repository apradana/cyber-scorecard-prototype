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
  // v2 additions
  scoreImpact?: string  // e.g. "−8 pts if resolved"
  sourceUrl?: string    // deep-link to the source tool
}

export interface IndexCard {
  code: 'CVEI' | 'HREI' | 'SCREI'
  name: string
  score: number
  band: Band
  delta: { dir: 'up' | 'down' | 'flat'; amount: number }
  note: string
  topAction?: string    // e.g. "Patch base image → save ~8 pts"
}

export interface AgentInsight {
  title: string
  body: string
  action: string        // replaces recommendation — plain language, no "Agent says"
  sla: string           // e.g. "Due 20 Jun · 5 days"
  owner: string         // e.g. "Platform Engineering"
  scoreImpact: string   // replaces projectedImpact — e.g. "CVEI −4 if done"
  jiraUrl?: string
  code?: string
}

export interface Team {
  id: string
  name: string
  overallScore: number
  band: Band
  trendData: TrendData    // score history per period (oldest → newest)
  deltaDay: { dir: 'up' | 'down' | 'flat'; amount: number; note: string }
  deltaBaseline: { dir: 'up' | 'down' | 'flat'; amount: number; daysSince: number }
  comparison: {
    you: number
    orgAverage: number
    topQuartile: number
  }
  internalComparison: {   // comparison scoped to internal/platform teams only
    peerAverage: number
    peerTop: number
  }
  indices: IndexCard[]
  topMover: {
    indexCode: 'CVEI' | 'HREI' | 'SCREI'
    indexName: string
    direction: 'up' | 'down'
    amount: number
    driver: string
    sla: string
    owner: string
    scoreImpact: string
  }
  cveiDetail: {
    metrics: Metric[]
    agent: AgentInsight
  }
}

// ===== Trend data — oldest → newest per period =====
export type TrendPeriod = '7d' | '30d' | '90d' | '12m'
export type TrendData = Record<TrendPeriod, number[]>

const TREND_CRIT: TrendData = {
  '7d':  [72,73,74,75,76,78,78],
  '30d': [63,64,63,65,64,66,67,65,68,67,69,68,70,69,71,70,72,71,73,72,74,73,74,75,76,75,77,76,78,78],
  '90d': [60,61,60,62,61,63,62,63,64,63,
          64,65,64,66,65,66,67,66,68,67,
          68,69,68,70,69,70,71,70,71,72,
          71,72,73,72,73,74,73,74,75,74,
          75,75,76,75,76,77,76,77,76,77,
          77,77,78,77,77,78,77,78,77,78,
          77,78,77,78,78,77,78,78,77,78,
          78,77,78,78,78,77,78,78,78,78,
          77,78,78,78,77,78,78,78,78,78],
  '12m': [52,54,57,59,61,63,65,67,69,71,74,78],
}
const TREND_WARN: TrendData = {
  '7d':  [57,58,57,56,57,56,56],
  '30d': [61,60,62,61,60,59,61,60,59,58,60,59,58,60,58,57,59,58,57,58,57,56,58,57,56,57,56,57,56,56],
  '90d': [65,64,65,64,63,64,63,62,63,62,
          62,61,62,61,60,61,60,60,59,60,
          59,59,58,59,58,58,57,58,57,57,
          57,56,57,57,56,57,56,57,56,57,
          56,57,56,57,56,57,56,56,57,56,
          57,56,56,57,56,57,56,57,56,56,
          57,56,57,56,57,56,57,56,57,56,
          57,56,57,56,57,56,57,56,57,56,
          57,56,57,56,57,56,57,56,56,56],
  '12m': [68,66,64,63,62,61,60,59,59,58,57,56],
}
const TREND_SAFE: TrendData = {
  '7d':  [25,24,25,24,26,24,24],
  '30d': [54,52,50,48,47,45,43,42,40,38,37,35,34,32,31,29,28,27,26,25,25,24,25,24,26,24,25,24,25,24],
  '90d': [62,61,60,59,58,57,56,55,54,53,
          52,51,50,49,48,47,46,45,44,43,
          42,42,41,40,39,38,38,37,36,35,
          34,34,33,32,31,31,30,29,29,28,
          27,27,26,26,25,25,24,25,24,25,
          24,25,24,25,24,25,24,25,24,25,
          24,25,24,25,24,25,24,25,24,25,
          24,25,24,25,24,25,24,25,24,25,
          24,25,24,25,24,25,24,25,24,24],
  '12m': [62,58,54,50,46,42,38,34,31,28,26,24],
}

// ===== The default mock team — team-checkout, currently CRITICAL =====
export const defaultTeam: Team = {
  id: 'team-checkout',
  name: 'team-checkout',
  overallScore: 78,
  band: 'crit',
  trendData: TREND_CRIT,
  deltaDay: { dir: 'up', amount: 6, note: 'CVEI drove the change' },
  deltaBaseline: { dir: 'up', amount: 9, daysSince: 49 },
  comparison: {
    you: 72,
    orgAverage: 64,
    topQuartile: 41,
  },
  internalComparison: {
    peerAverage: 83,
    peerTop: 67,
  },
  indices: [
    {
      code: 'CVEI',
      name: 'Composite Vulnerability',
      score: 78,
      band: 'crit',
      delta: { dir: 'up', amount: 6 },
      note: '1 metric moved',
      topAction: 'Patch base image → save ~4 pts',
    },
    {
      code: 'HREI',
      name: 'Human Risk',
      score: 41,
      band: 'warn',
      delta: { dir: 'flat', amount: 0 },
      note: 'stable',
      topAction: 'Complete secure coding training → −6 pts',
    },
    {
      code: 'SCREI',
      name: 'Supply Chain',
      score: 97,
      band: 'crit',
      delta: { dir: 'down', amount: 1 },
      note: '2 TRFs closed',
      topAction: 'Close top 5 TRFs → save ~12 pts',
    },
  ],
  topMover: {
    indexCode: 'CVEI',
    indexName: 'Composite Vulnerability',
    direction: 'up',
    amount: 6,
    driver: '12 new EKS findings in cluster-x',
    sla: 'Due 20 Jun · 5 days',
    owner: 'Platform Engineering',
    scoreImpact: 'CVEI −4 if done',
  },
  cveiDetail: {
    metrics: [
      {
        name: 'EKS Posture Compliance', source: 'wiz', value: '70%', band: 'crit',
        delta: { dir: 'down', amount: '−3' }, changed: true,
        scoreImpact: '−4 pts if ≥90%',
        sourceUrl: 'https://app.wiz.io',
      },
      {
        name: 'AWS Posture Compliance', source: 'wiz', value: '51%', band: 'warn',
        scoreImpact: '−2 pts if ≥80%',
        sourceUrl: 'https://app.wiz.io',
      },
      {
        name: 'Access Keys Not Rotated', source: 'wiz', value: '227', band: 'crit',
        scoreImpact: '−3 pts if <10',
        sourceUrl: 'https://app.wiz.io',
      },
      {
        name: 'Open Bug Bounty Critical', source: 'jira', value: '2', band: 'warn',
        scoreImpact: '−1 pt if 0',
        sourceUrl: 'https://jet.atlassian.net',
      },
      {
        name: 'Prioritised Vulnerabilities', source: 'wiz', value: '121', band: 'crit',
        scoreImpact: '−5 pts if <20',
        sourceUrl: 'https://app.wiz.io',
      },
    ],
    agent: {
      title: 'Why CVEI rose 6 points',
      body: '12 new findings appeared in cluster-x overnight. All trace to the same base image — a newer version patches all 12.',
      action: 'Bump base image across services in team-checkout.',
      sla: 'Due 20 Jun · 5 days',
      owner: 'Platform Engineering',
      scoreImpact: 'CVEI −4 if done',
      code: 'jet-node:18-alpine → v2.1.4',
    },
  },
}

// ===== Alternative team states (for the band selector) =====
export const teamStates: Record<Band, Partial<Team>> = {
  crit: {
    overallScore: 78,
    band: 'crit',
    trendData: TREND_CRIT,
    deltaDay: { dir: 'up', amount: 6, note: 'CVEI drove the change' },
    deltaBaseline: { dir: 'up', amount: 9, daysSince: 49 },
    comparison: { you: 78, orgAverage: 64, topQuartile: 41 },
    internalComparison: { peerAverage: 83, peerTop: 67 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 78, band: 'crit', delta: { dir: 'up', amount: 6 }, note: '1 metric moved', topAction: 'Patch base image → save ~4 pts' },
      { code: 'HREI', name: 'Human Risk',              score: 41, band: 'warn', delta: { dir: 'flat', amount: 0 }, note: 'stable', topAction: 'Complete secure coding training → −6 pts' },
      { code: 'SCREI', name: 'Supply Chain',           score: 97, band: 'crit', delta: { dir: 'down', amount: 1 }, note: '2 TRFs closed', topAction: 'Close top 5 TRFs → save ~12 pts' },
    ],
  },
  warn: {
    overallScore: 56,
    band: 'warn',
    trendData: TREND_WARN,
    deltaDay: { dir: 'up', amount: 2, note: 'HREI ticked up' },
    deltaBaseline: { dir: 'up', amount: 4, daysSince: 49 },
    comparison: { you: 56, orgAverage: 64, topQuartile: 41 },
    internalComparison: { peerAverage: 61, peerTop: 44 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 56, band: 'warn', delta: { dir: 'down', amount: 4 }, note: '4 findings resolved', topAction: 'Rotate stale access keys → −3 pts' },
      { code: 'HREI', name: 'Human Risk',              score: 32, band: 'safe', delta: { dir: 'down', amount: 6 }, note: 'training complete', topAction: 'Nudge remaining 11% to complete' },
      { code: 'SCREI', name: 'Supply Chain',           score: 67, band: 'warn', delta: { dir: 'down', amount: 3 }, note: '3 TRFs closed', topAction: 'Close 2 critical TRFs → −6 pts' },
    ],
  },
  safe: {
    overallScore: 24,
    band: 'safe',
    trendData: TREND_SAFE,
    deltaDay: { dir: 'down', amount: 3, note: '6 vulns mitigated' },
    deltaBaseline: { dir: 'down', amount: 12, daysSince: 49 },
    comparison: { you: 24, orgAverage: 64, topQuartile: 41 },
    internalComparison: { peerAverage: 48, peerTop: 29 },
    indices: [
      { code: 'CVEI', name: 'Composite Vulnerability', score: 22, band: 'safe', delta: { dir: 'down', amount: 8 }, note: 'base image patched', topAction: 'On track — review in 7 days' },
      { code: 'HREI', name: 'Human Risk',              score: 19, band: 'safe', delta: { dir: 'down', amount: 3 }, note: 'training complete', topAction: 'Maintain current cadence' },
      { code: 'SCREI', name: 'Supply Chain',           score: 42, band: 'warn', delta: { dir: 'down', amount: 2 }, note: '2 TRFs outstanding', topAction: 'Close 2 remaining TRFs → −8 pts' },
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

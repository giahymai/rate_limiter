import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import {
  DemoCaption,
  HeaderBar,
  HealthPill,
  IncidentFeed,
  MetricStrip,
  MiniLoadTimeline,
  MobileRuleSheet,
  PressureGauge,
  RequestLog,
  RuleEditorPanel,
  SidebarNav,
  CacheBadge,
  StatusBadge,
  TrafficChart,
} from '@/components/DashboardPrimitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchConfig, fetchLogs, fetchMetrics, updateConfig } from '@/api/gatewayApi'
import { fallbackMetrics, history as fallbackHistory, initialRules, logs as fallbackLogs } from '@/data/demoData'

const POLL_INTERVAL_MS = 2000
const HISTORY_POINTS = 40
const VALID_ALGORITHMS = new Set(['TOKEN_BUCKET', 'SLIDING_WINDOW'])
const NAVIGABLE_VIEWS = new Set(['Overview', 'Traffic'])

export default function App() {
  const [metrics, setMetrics] = useState(fallbackMetrics)
  const [trafficHistory, setTrafficHistory] = useState(fallbackHistory)
  const [requestLogs, setRequestLogs] = useState(fallbackLogs)
  const [rules, setRules] = useState(initialRules)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [appliedAt, setAppliedAt] = useState('backend sync pending')
  const [isApplying, setIsApplying] = useState(false)
  const [apiState, setApiState] = useState({ status: 'loading', message: 'Connecting to /admin' })
  const [activeView, setActiveView] = useState(getInitialView)
  const lastMetricsRef = useRef(null)

  const selectView = useCallback((view) => {
    if (!NAVIGABLE_VIEWS.has(view)) return
    setActiveView(view)
    const url = new URL(window.location.href)
    url.searchParams.delete('demo')
    if (view === 'Overview') {
      url.searchParams.delete('view')
    } else {
      url.searchParams.set('view', 'traffic')
    }
    window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadConfig() {
      try {
        const config = await fetchConfig({ signal: controller.signal })
        if (!active) return
        setRules(normalizeConfig(config))
        setAppliedAt('loaded from backend')
      } catch (error) {
        if (!active || error.name === 'AbortError') return
        setApiState({ status: 'fallback', message: 'Backend offline - showing seeded data' })
      }
    }

    async function refreshLiveData() {
      try {
        const [nextMetrics, nextLogs] = await Promise.all([
          fetchMetrics({ signal: controller.signal }),
          fetchLogs({ limit: 100, signal: controller.signal }),
        ])
        if (!active) return

        const normalizedMetrics = normalizeMetrics(nextMetrics)
        const previousMetrics = lastMetricsRef.current
        const sample = createHistorySample(normalizedMetrics, previousMetrics)
        lastMetricsRef.current = { ...normalizedMetrics, sampledAt: Date.now() }

        setMetrics(normalizedMetrics)
        setRequestLogs(normalizeLogs(nextLogs))
        setTrafficHistory((current) => (previousMetrics ? [...current.slice(-(HISTORY_POINTS - 1)), sample] : [sample]))
        setApiState({ status: 'live', message: 'Connected to /admin' })
      } catch (error) {
        if (!active || error.name === 'AbortError') return
        setApiState({ status: 'fallback', message: 'Backend offline - showing seeded data' })
      }
    }

    loadConfig()
    refreshLiveData()
    const pollId = window.setInterval(refreshLiveData, POLL_INTERVAL_MS)

    return () => {
      active = false
      controller.abort()
      window.clearInterval(pollId)
    }
  }, [])

  const incidentFeed = useMemo(() => buildIncidentFeed(requestLogs), [requestLogs])
  const pressurePercent = useMemo(() => {
    if (!requestLogs.length) return Math.round(metrics.blockedRatio * 100)
    const blocked = requestLogs.filter((row) => row.status === 'BLOCKED').length
    return Math.round((blocked / requestLogs.length) * 100)
  }, [metrics.blockedRatio, requestLogs])

  const shared = useMemo(
    () => ({
      metrics,
      trafficHistory,
      requestLogs,
      incidentFeed,
      pressurePercent,
      rules,
      setRules,
      filter,
      setFilter,
      statusFilter,
      setStatusFilter,
      appliedAt,
      isApplying,
      apiState,
      activeView,
      selectView,
      applyRules: async () => {
        setIsApplying(true)
        try {
          const nextRules = sanitizeConfig(rules)
          const applied = await updateConfig(nextRules)
          setRules(normalizeConfig(applied))
          setAppliedAt(`applied ${formatClock(new Date())}`)
          setApiState({ status: 'live', message: 'Config saved to /admin/config' })
        } catch (error) {
          setAppliedAt('apply failed')
          setApiState({ status: 'fallback', message: 'Could not reach /admin/config' })
        } finally {
          setIsApplying(false)
        }
      },
    }),
    [activeView, appliedAt, apiState, filter, incidentFeed, isApplying, metrics, pressurePercent, requestLogs, rules, selectView, statusFilter, trafficHistory],
  )

  return (
    <main className="demo-shell demo-warroom min-h-screen overflow-x-hidden">
      <DashboardShell {...shared} />
    </main>
  )
}

function DashboardShell(props) {
  const isLive = props.apiState.status === 'live'
  const isOverview = props.activeView === 'Overview'

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden">
      <HeaderBar
        title={isOverview ? 'API Gateway Overview' : 'API Gateway Traffic War Room'}
        label={isOverview ? 'System health, active rules, and demo readiness' : 'Operator view for live pressure and allowed flow'}
      >
        <Badge variant="outline" className="status-blocked">
          <ShieldAlert aria-hidden="true" />
          Burst watch
        </Badge>
        <HealthPill label={isLive ? 'Backend live' : 'Seed fallback'} tone={isLive ? 'good' : 'warn'} />
        <MobileRuleSheet rules={props.rules} appliedAt={props.appliedAt} isApplying={props.isApplying} onRulesChange={props.setRules} onApply={props.applyRules} />
      </HeaderBar>
      <div className="flex w-full min-w-0 max-w-full">
        <SidebarNav active={props.activeView} footerLabel={props.apiState.message} onSelect={props.selectView} />
        {isOverview ? <OverviewPage {...props} isLive={isLive} /> : <TrafficPage {...props} isLive={isLive} />}
      </div>
    </div>
  )
}

function OverviewPage(props) {
  const latestLog = props.requestLogs[0]
  const sourceLabel = props.isLive ? 'live backend' : 'seeded fallback'
  const readiness = [
    { label: 'Gateway API', detail: props.apiState.message, ready: props.isLive },
    { label: 'Traffic recorded', detail: `${formatInteger(props.metrics.totalRequests)} requests`, ready: props.metrics.totalRequests > 0 },
    { label: 'Cache visible', detail: `${formatPercent(props.metrics.cacheHitRate)} hit rate`, ready: props.metrics.cacheHitRate > 0 },
    { label: 'Rule config loaded', detail: `${formatAlgorithm(props.rules.algorithm)} active`, ready: props.appliedAt !== 'backend sync pending' },
  ]

  return (
    <div className="box-border flex w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-hidden p-4">
      <section className="mobile-contained grid min-w-0 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel w-full min-w-0 max-w-full rounded-md p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-xl font-semibold tracking-normal md:text-2xl">Gateway health at a glance</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 demo-muted">
                A recruiter-friendly summary of the live gateway: traffic, blocking, cache behavior, and the active rule contract feeding the dashboard.
              </p>
            </div>
            <Button className="w-fit bg-[var(--demo-accent)] text-slate-950 hover:opacity-90" type="button" onClick={() => props.selectView('Traffic')}>
              <Activity data-icon="inline-start" aria-hidden="true" />
              Traffic View
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryCell icon={ShieldCheck} label="Gateway" value={props.isLive ? 'Live' : 'Fallback'} tone={props.isLive ? 'good' : 'warn'} />
            <SummaryCell icon={Server} label="Backend target" value="localhost:9090" tone="accent" />
            <SummaryCell icon={SlidersHorizontal} label="Active rule" value={`${props.rules.limit}/${props.rules.windowSeconds}s`} tone="cache" />
          </div>
        </div>
        <div className="panel w-full min-w-0 max-w-full rounded-md p-4 md:p-5">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Runtime Config</h2>
              <p className="mt-1 text-xs demo-muted">Loaded from /admin/config</p>
            </div>
            <Badge variant="outline" className="status-allowed max-w-full truncate">{props.appliedAt}</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <ConfigRow label="Algorithm" value={formatAlgorithm(props.rules.algorithm)} />
            <ConfigRow label="Limit" value={`${props.rules.limit} requests`} />
            <ConfigRow label="Window" value={`${props.rules.windowSeconds} sec`} />
            <ConfigRow label="Cache TTL" value={`${props.rules.cacheTtlSeconds} sec`} />
          </div>
        </div>
      </section>

      <div className="mobile-contained min-w-0">
        <MetricStrip metrics={props.metrics} history={props.trafficHistory} sourceLabel={sourceLabel} />
      </div>

      <section className="mobile-contained grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <GatewayFlow apiState={props.apiState} rules={props.rules} isLive={props.isLive} />
        <TrafficChart height={300} history={props.trafficHistory} />
      </section>

      <section className="mobile-contained grid min-w-0 gap-4 xl:grid-cols-[1fr_340px]">
        <RecentActivity logs={props.requestLogs} latestLog={latestLog} />
        <DemoReadiness items={readiness} onOpenTraffic={() => props.selectView('Traffic')} />
      </section>
    </div>
  )
}

function TrafficPage(props) {
  return (
    <div className="box-border flex w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="mobile-contained min-w-0">
        <DemoCaption apiState={props.apiState} />
      </div>
      <div className="mobile-contained min-w-0">
        <MetricStrip metrics={props.metrics} history={props.trafficHistory} sourceLabel={props.isLive ? 'live backend' : 'seeded fallback'} />
      </div>
      <div className="mobile-contained grid min-w-0 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[150px_1fr]">
          <PressureGauge value={props.pressurePercent} />
          <TrafficChart height={360} history={props.trafficHistory} incident />
        </div>
        <div className="hidden xl:flex xl:flex-col xl:gap-4">
          <IncidentFeed incidents={props.incidentFeed} />
        </div>
      </div>
      <div className="mobile-contained grid min-w-0 gap-4 xl:grid-cols-[1fr_340px]">
        <RequestLog logs={props.requestLogs} filter={props.filter} onFilterChange={props.setFilter} statusFilter={props.statusFilter} onStatusFilterChange={props.setStatusFilter} maxRows={9} compact />
        <div className="flex flex-col gap-4">
          <MiniLoadTimeline />
          <RuleEditorPanel rules={props.rules} appliedAt={props.appliedAt} isApplying={props.isApplying} onRulesChange={props.setRules} onApply={props.applyRules} dense title="Operator Rule Console" />
        </div>
      </div>
    </div>
  )
}

function SummaryCell({ icon: Icon, label, value, tone }) {
  const color = toneColor(tone)
  return (
    <div className="min-w-0 rounded-md border p-3" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-panel-2) 54%, transparent)' }}>
      <div className="flex items-center gap-2 text-xs demo-muted">
        <Icon aria-hidden="true" style={{ color }} />
        {label}
      </div>
      <p className="mt-2 break-words text-lg font-semibold" style={{ color }}>{value}</p>
    </div>
  )
}

function ConfigRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--demo-border)' }}>
      <span className="min-w-0 demo-muted">{label}</span>
      <span className="number-font min-w-0 break-words text-right text-xs font-semibold">{value}</span>
    </div>
  )
}

function GatewayFlow({ apiState, rules, isLive }) {
  const nodes = [
    { label: 'Client', value: 'request', icon: Users, tone: 'accent' },
    { label: 'Gateway', value: apiState.status === 'live' ? 'online' : 'fallback', icon: Network, tone: isLive ? 'good' : 'warn' },
    { label: 'Limiter', value: formatAlgorithm(rules.algorithm), icon: ShieldCheck, tone: 'warn' },
    { label: 'Cache', value: `${rules.cacheTtlSeconds}s ttl`, icon: Database, tone: 'cache' },
    { label: 'Backend', value: ':9090', icon: Server, tone: 'accent2' },
  ]

  return (
    <div className="panel rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Gateway Flow</h2>
          <p className="mt-1 text-xs demo-muted">Client to gateway to protected mock backend.</p>
        </div>
        <Badge variant="outline" className={isLive ? 'status-allowed' : 'status-blocked'}>{isLive ? 'Live path' : 'Fallback data'}</Badge>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {nodes.map((node, index) => {
          const Icon = node.icon
          const color = toneColor(node.tone)
          return (
            <div key={node.label} className="relative min-w-0 rounded-md border p-3" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-panel-2) 52%, transparent)' }}>
              {index > 0 && <span className="absolute -left-3 top-1/2 hidden h-px w-3 -translate-y-1/2 bg-[var(--demo-border)] md:block" />}
              <Icon aria-hidden="true" style={{ color }} />
              <p className="mt-3 text-sm font-semibold">{node.label}</p>
              <p className="mt-1 truncate text-xs demo-muted">{node.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentActivity({ logs, latestLog }) {
  return (
    <div className="panel min-w-0 rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Recent Activity</h2>
          <p className="mt-1 text-xs demo-muted">{latestLog ? `Latest ${latestLog.id}` : 'Waiting for request records'}</p>
        </div>
        <Badge variant="outline" className="status-allowed">{logs.length} records</Badge>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border" style={{ borderColor: 'var(--demo-border)' }}>
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="grid gap-3 border-b px-3 py-3 text-sm last:border-b-0 md:grid-cols-[90px_1fr_110px_80px]" style={{ borderColor: 'var(--demo-border)' }}>
            <span className="number-font text-xs demo-muted">{log.id}</span>
            <div className="min-w-0">
              <p className="truncate font-medium">{log.path}</p>
              <p className="number-font mt-1 text-xs demo-muted">{log.clientId} / {log.timestamp}</p>
            </div>
            <StatusBadge status={log.status} />
            <CacheBadge cache={log.cache} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoReadiness({ items, onOpenTraffic }) {
  return (
    <div className="panel rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Demo Readiness</h2>
        <CheckCircle2 aria-hidden="true" className="text-[var(--demo-good)]" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <span className="mt-1 size-2 rounded-full" style={{ background: item.ready ? 'var(--demo-good)' : 'var(--demo-warn)' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs demo-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-5 w-full border-[var(--demo-border)] bg-transparent text-[var(--demo-text)]" type="button" onClick={onOpenTraffic}>
        <Activity data-icon="inline-start" aria-hidden="true" />
        Open Traffic War Room
      </Button>
    </div>
  )
}

function normalizeMetrics(metrics) {
  return {
    requestsPerSecond: Number(metrics.requestsPerSecond ?? 0),
    totalRequests: Number(metrics.totalRequests ?? 0),
    blockedRequests: Number(metrics.blockedRequests ?? 0),
    blockedRatio: Number(metrics.blockedRatio ?? 0),
    avgLatencyMs: Number(metrics.avgLatencyMs ?? 0),
    cacheHitRate: Number(metrics.cacheHitRate ?? 0),
  }
}

function normalizeConfig(config) {
  return sanitizeConfig(config)
}

function sanitizeConfig(config) {
  const algorithm = String(config.algorithm ?? initialRules.algorithm).toUpperCase()
  return {
    algorithm: VALID_ALGORITHMS.has(algorithm) ? algorithm : initialRules.algorithm,
    limit: positiveInteger(config.limit, initialRules.limit),
    windowSeconds: positiveInteger(config.windowSeconds, initialRules.windowSeconds),
    cacheTtlSeconds: positiveInteger(config.cacheTtlSeconds, initialRules.cacheTtlSeconds),
  }
}

function positiveInteger(value, fallback) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 1 ? Math.round(numeric) : fallback
}

function normalizeLogs(rows) {
  return rows.map((row) => ({
    id: row.id,
    clientId: row.clientId,
    path: row.path,
    latencyMs: row.latencyMs == null ? null : Number(row.latencyMs),
    status: row.status,
    cache: row.cache,
    timestamp: formatTimestamp(row.timestamp),
    rawTimestamp: row.timestamp,
  }))
}

function createHistorySample(metrics, previous) {
  const now = Date.now()
  const elapsedSeconds = previous ? Math.max((now - previous.sampledAt) / 1000, 1) : 1
  const blockedDelta = previous ? Math.max(metrics.blockedRequests - previous.blockedRequests, 0) / elapsedSeconds : metrics.requestsPerSecond * metrics.blockedRatio

  return {
    time: formatClock(new Date(now)),
    rps: roundOne(metrics.requestsPerSecond),
    blocked: roundOne(blockedDelta),
    cacheHit: Math.round(metrics.cacheHitRate * 100),
  }
}

function buildIncidentFeed(rows) {
  const byClient = new Map()

  rows.forEach((row) => {
    const current = byClient.get(row.clientId) ?? { client: row.clientId, count: 0, paths: [], last: row.timestamp }
    if (row.status === 'BLOCKED') current.count += 1
    if (!current.paths.includes(row.path)) current.paths.push(row.path)
    current.last = current.last || row.timestamp
    byClient.set(row.clientId, current)
  })

  return [...byClient.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((incident) => ({ ...incident, paths: incident.paths.slice(0, 3) }))
}

function formatTimestamp(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : `${formatClock(date)}.${String(date.getMilliseconds()).padStart(3, '0')}`
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function roundOne(value) {
  return Math.round(Number(value) * 10) / 10
}

function getInitialView() {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')?.toLowerCase()
  const demo = params.get('demo')?.toLowerCase()
  return view === 'traffic' || demo === 'traffic' || demo === 'warroom' ? 'Traffic' : 'Overview'
}

function toneColor(tone) {
  const map = {
    accent: 'var(--demo-accent)',
    accent2: 'var(--demo-accent-2)',
    danger: 'var(--demo-danger)',
    warn: 'var(--demo-warn)',
    good: 'var(--demo-good)',
    cache: 'var(--demo-cache)',
  }
  return map[tone] || 'var(--demo-accent)'
}

function formatInteger(value) {
  return Math.round(Number(value || 0)).toLocaleString()
}

function formatMetric(value, digits = 1) {
  const numeric = Number(value || 0)
  return numeric >= 100 ? Math.round(numeric).toLocaleString() : numeric.toFixed(digits).replace(/\.0$/, '')
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`
}

function formatAlgorithm(value) {
  return String(value || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Layers3,
  Network,
  Pause,
  Play,
  Route,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Timer,
  Users,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { selectedDashboard } from '@/data/demoData'
import { cn } from '@/lib/utils'

const metricConfig = [
  { key: 'requestsPerSecond', label: 'Requests/sec', suffix: 'req/s', tone: 'accent', icon: Activity, format: (metrics) => formatMetric(metrics.requestsPerSecond, 1) },
  { key: 'totalRequests', label: 'Total requests', suffix: 'all time', tone: 'accent2', icon: Database, format: (metrics) => formatInteger(metrics.totalRequests) },
  { key: 'blockedRequests', label: 'Blocked', suffix: '429s', tone: 'danger', icon: ShieldAlert, format: (metrics) => formatInteger(metrics.blockedRequests) },
  { key: 'blockedRatio', label: 'Blocked ratio', suffix: 'of traffic', tone: 'warn', icon: Gauge, format: (metrics) => formatPercent(metrics.blockedRatio) },
  { key: 'avgLatencyMs', label: 'Avg latency', suffix: 'ms', tone: 'cache', icon: Timer, format: (metrics) => formatMetric(metrics.avgLatencyMs, 1) },
  { key: 'cacheHitRate', label: 'Cache hit rate', suffix: 'hit', tone: 'good', icon: Layers3, format: (metrics) => formatPercent(metrics.cacheHitRate) },
]

const navItems = [
  { label: 'Overview', icon: BarChart3 },
  { label: 'Traffic', icon: Activity },
  { label: 'Rules', icon: SlidersHorizontal, disabled: true },
  { label: 'Routes', icon: Route, disabled: true },
  { label: 'Incidents', icon: Bell, disabled: true },
  { label: 'Settings', icon: Settings, disabled: true },
]

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

export function HeaderBar({ title = 'API Gateway Dashboard', label, children, compact = false }) {
  return (
    <header className={cn('flex flex-col gap-4 border-b px-4 py-4 md:flex-row md:items-center md:justify-between', compact && 'py-3')} style={{ borderColor: 'var(--demo-border)' }}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-accent) 12%, transparent)', color: 'var(--demo-accent)' }}>
          <Network aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-normal md:text-2xl">{title}</h1>
          {label && <p className="truncate text-sm demo-muted">{label}</p>}
        </div>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-2">{children}</div>
    </header>
  )
}

export function HealthPill({ label = 'Gateway Online', tone = 'good' }) {
  const color = tone === 'warn' ? 'var(--demo-warn)' : 'var(--demo-good)'
  return (
    <Badge variant="outline" className="gap-2 border-[var(--demo-border)]" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </Badge>
  )
}

export function SidebarNav({ active = 'Overview', footer = true, footerLabel = 'Connected to /admin', onSelect }) {
  return (
    <aside className="hidden min-h-full w-48 shrink-0 flex-col border-r px-3 py-4 lg:flex" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-panel) 80%, transparent)' }}>
      <div className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, disabled }) => (
          <button
            key={label}
            aria-pressed={label === active}
            aria-disabled={disabled || undefined}
            className={cn(
              'flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm transition-colors',
              disabled
                ? 'cursor-not-allowed text-[color-mix(in_srgb,var(--demo-muted)_60%,transparent)]'
                : 'hover:bg-[color-mix(in_srgb,var(--demo-accent)_10%,transparent)]',
              label === active && 'bg-[color-mix(in_srgb,var(--demo-accent)_14%,transparent)] text-[var(--demo-accent)]',
            )}
            disabled={disabled}
            onClick={() => onSelect?.(label)}
            type="button"
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {footer && (
        <div className="mt-auto rounded-md border p-3 text-sm" style={{ borderColor: 'var(--demo-border)', background: 'var(--demo-panel)' }}>
          <div className="flex items-center gap-2 font-medium text-[var(--demo-good)]">
            <Activity aria-hidden="true" />
            Healthy
          </div>
          <p className="mt-2 demo-muted">{footerLabel}</p>
        </div>
      )}
    </aside>
  )
}

export function MetricStrip({ metrics, history = [], sourceLabel = 'live backend', variant = 'cards', tight = false }) {
  const gridClass =
    variant === 'stack'
      ? 'grid-cols-1'
      : variant === 'compact'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : variant === 'wide'
        ? 'grid-cols-2 xl:grid-cols-6'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-6'
  return (
    <section className={cn('grid min-w-0 gap-3', gridClass)}>
      {metricConfig.map((metric) => (
        <MetricCard key={metric.key} metric={metric} metrics={metrics} history={history} sourceLabel={sourceLabel} tight={tight} />
      ))}
    </section>
  )
}

function MetricCard({ metric, metrics, history, sourceLabel, tight }) {
  const Icon = metric.icon
  const color = toneColor(metric.tone)
  const sparkKey = metric.key === 'blockedRequests' ? 'blocked' : metric.key === 'cacheHitRate' ? 'cacheHit' : 'rps'
  return (
    <Card className="panel min-w-0 rounded-md border-[var(--demo-border)] bg-[var(--demo-panel)] text-[var(--demo-text)]">
      <CardHeader className={cn('flex flex-row items-start justify-between gap-3 pb-2', tight ? 'p-3' : 'p-4')}>
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium leading-snug demo-muted">{metric.label}</CardTitle>
          <div className="mt-2 flex items-end gap-2">
            <span className="number-font text-2xl font-semibold md:text-3xl" style={{ color }}>{metric.format(metrics)}</span>
            <span className="pb-1 text-xs demo-muted">{metric.suffix}</span>
          </div>
        </div>
        <Icon aria-hidden="true" style={{ color }} />
      </CardHeader>
      <CardContent className={cn(tight ? 'px-3 pb-3' : 'px-4 pb-4')}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span style={{ color }}>polling</span>
          <span className="metric-context demo-muted">{sourceLabel}</span>
        </div>
        <div className="mt-2 h-7">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-10)}>
              <Line type="monotone" dataKey={sparkKey} dot={false} stroke={color} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function TrafficChart({ history = [], height = 300, showThreshold = false, incident = false }) {
  const spike = history.reduce((largest, point) => (point.blocked > (largest?.blocked ?? -1) ? point : largest), null)

  return (
    <div className="panel rounded-md p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Live Traffic</h2>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-xs demo-muted">
            <span className="inline-flex items-center gap-2"><span className="h-0.5 w-6 rounded bg-[var(--demo-accent)]" />Requests/sec</span>
            <span className="inline-flex items-center gap-2"><span className="h-0.5 w-6 rounded bg-[var(--demo-danger)]" />Blocked</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[var(--demo-border)] bg-transparent text-[var(--demo-text)]">1m</Button>
          <Button variant="outline" size="sm" className="border-[var(--demo-border)] bg-transparent text-[var(--demo-text)]">
            <Pause data-icon="inline-start" aria-hidden="true" />
            Auto
          </Button>
        </div>
      </div>
      <div className="mt-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid className="chart-grid" strokeDasharray={incident ? '2 5' : '3 3'} />
            <XAxis dataKey="time" tick={{ fill: 'var(--demo-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--demo-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ background: 'var(--demo-panel)', border: '1px solid var(--demo-border)', borderRadius: 6, color: 'var(--demo-text)' }} />
            {showThreshold && <ReferenceLine y={100} stroke="var(--demo-accent)" strokeDasharray="6 6" label={{ value: 'configured limit', fill: 'var(--demo-accent)', fontSize: 12 }} />}
            {incident && spike && spike.blocked > 0 && <ReferenceLine x={spike.time} stroke="var(--demo-danger)" strokeDasharray="6 6" label={{ value: 'blocked spike', fill: 'var(--demo-danger)', fontSize: 12 }} />}
            <Line type="monotone" dataKey="rps" stroke="var(--demo-accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="blocked" stroke="var(--demo-danger)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RuleEditorPanel({ rules, appliedAt, isApplying = false, onRulesChange, onApply, dense = false, title = 'Rate Limit Rule Editor' }) {
  const setField = (field, value) => onRulesChange((current) => ({ ...current, [field]: value }))
  const inputClass = 'border-[var(--demo-border)] bg-[color-mix(in_srgb,var(--demo-panel)_82%,transparent)] text-[var(--demo-text)]'
  return (
    <div className="panel flex h-full flex-col rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-xs demo-muted">Writes directly to /admin/config.</p>
        </div>
        <Badge variant="outline" className="status-allowed">{appliedAt || 'Active'}</Badge>
      </div>
      <div className={cn('mt-4 flex flex-col gap-4', dense && 'gap-3')}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="algorithm">Algorithm</Label>
          <Select value={rules.algorithm} onValueChange={(value) => setField('algorithm', value)}>
            <SelectTrigger id="algorithm" className={inputClass}>
              <SelectValue placeholder="Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="TOKEN_BUCKET">Token Bucket</SelectItem>
                <SelectItem value="SLIDING_WINDOW">Sliding Window</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <NumberField id="limit" label="Limit" suffix="requests" value={rules.limit} onChange={(value) => setField('limit', value)} className={inputClass} />
        <NumberField id="windowSeconds" label="Window" suffix="sec" value={rules.windowSeconds} onChange={(value) => setField('windowSeconds', value)} className={inputClass} />
        <NumberField id="cacheTtlSeconds" label="Cache TTL" suffix="sec" value={rules.cacheTtlSeconds} onChange={(value) => setField('cacheTtlSeconds', value)} className={inputClass} />
      </div>
      <Button className="mt-5 bg-[var(--demo-accent)] text-white hover:opacity-90" disabled={isApplying} onClick={onApply}>
        <Play data-icon="inline-start" aria-hidden="true" />
        {isApplying ? 'Applying...' : 'Apply Rules'}
      </Button>
    </div>
  )
}

function NumberField({ id, label, suffix, value, onChange, className }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex rounded-md border border-[var(--demo-border)]">
        <Input id={id} type="number" min="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className={cn('border-0 shadow-none focus-visible:ring-0', className)} />
        <span className="grid min-w-20 place-items-center border-l px-3 text-xs demo-muted" style={{ borderColor: 'var(--demo-border)' }}>{suffix}</span>
      </div>
    </div>
  )
}

export function MobileRuleSheet({ rules, appliedAt, isApplying, onRulesChange, onApply }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="border-[var(--demo-border)] bg-transparent text-[var(--demo-text)] lg:hidden">
          <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
          Rules
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-auto bg-[var(--demo-panel)] text-[var(--demo-text)]">
        <SheetHeader>
          <SheetTitle>Rate Limit Rule Editor</SheetTitle>
          <SheetDescription>Update the gateway through /admin/config.</SheetDescription>
        </SheetHeader>
        <div className="mt-5">
          <RuleEditorPanel rules={rules} appliedAt={appliedAt} isApplying={isApplying} onRulesChange={onRulesChange} onApply={onApply} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function RequestLog({ logs = [], filter, onFilterChange, statusFilter, onStatusFilterChange, maxRows = 10, compact = false }) {
  const filtered = logs.filter((row) => {
    const needle = filter.toLowerCase()
    const matchesNeedle = !needle || row.clientId.toLowerCase().includes(needle) || row.path.toLowerCase().includes(needle) || row.id.toLowerCase().includes(needle)
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter
    return matchesNeedle && matchesStatus
  })

  return (
    <div className="panel min-w-0 overflow-hidden rounded-md">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'var(--demo-border)' }}>
        <div>
          <h2 className="text-base font-semibold">Request Log</h2>
          <p className="text-xs demo-muted">{filtered.length} recent records</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--demo-muted)]" />
            <Input
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder="Search path or client..."
              className="w-full border-[var(--demo-border)] bg-transparent pl-10 text-[var(--demo-text)] sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full border-[var(--demo-border)] bg-transparent text-[var(--demo-text)] sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ALLOWED">Allowed</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className={cn('w-full', compact ? 'h-64' : 'h-80')}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cache</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, maxRows).map((row) => (
              <TableRow key={row.id} className={row.status === 'BLOCKED' ? 'bg-[color-mix(in_srgb,var(--demo-danger)_7%,transparent)]' : ''}>
                <TableCell className="number-font text-xs">{row.id}</TableCell>
                <TableCell className="number-font text-xs">{row.clientId}</TableCell>
                <TableCell className="min-w-40">{row.path}</TableCell>
                <TableCell className="number-font" style={{ color: row.status === 'BLOCKED' ? 'var(--demo-danger)' : 'var(--demo-accent)' }}>
                  {row.latencyMs == null ? '-' : `${row.latencyMs.toFixed(1)} ms`}
                </TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell><CacheBadge cache={row.cache} /></TableCell>
                <TableCell className="number-font text-xs">{row.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

export function StatusBadge({ status }) {
  return (
    <Badge variant="outline" className={status === 'BLOCKED' ? 'status-blocked' : 'status-allowed'}>
      {status === 'BLOCKED' ? 'BLOCKED 429' : 'ALLOWED'}
    </Badge>
  )
}

export function CacheBadge({ cache }) {
  const className = cache === 'HIT' ? 'cache-hit' : cache === 'MISS' ? 'cache-miss' : 'cache-skip'
  return <Badge variant="outline" className={className}>{cache === 'SKIP' ? '-' : cache}</Badge>
}

export function IncidentFeed({ incidents = [] }) {
  return (
    <div className="panel rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Incident Feed</h2>
        <Badge variant="outline" className="status-blocked">Live</Badge>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {incidents.map((incident) => (
          <div key={incident.client} className="rounded-md border p-3" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-panel-2) 58%, transparent)' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="number-font text-sm font-semibold">{incident.client}</span>
              <Badge variant="outline" className={incident.count ? 'status-blocked' : 'status-allowed'}>{incident.count} blocked</Badge>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {incident.paths.map((path) => (
                <div key={path} className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-2">
                    {incident.count ? <AlertTriangle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
                    {path}
                  </span>
                  <span className="demo-muted">last {incident.last || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PressureGauge({ value = 0 }) {
  const bars = Array.from({ length: 12 })
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const activeBars = Math.ceil((clamped / 100) * bars.length)
  return (
    <div className="panel flex h-full flex-col rounded-md p-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--demo-danger)]">429 pressure</h2>
        <p className="mt-1 text-xs demo-muted">Blocked pressure</p>
      </div>
      <div className="my-5 flex flex-1 items-end justify-center rounded-md border p-3" style={{ borderColor: 'var(--demo-border)' }}>
        <div className="flex w-16 flex-col-reverse gap-1">
          {bars.map((_, index) => (
            <span key={index} className={cn('h-4 rounded-sm', index < activeBars ? 'bg-[var(--demo-danger)]' : 'bg-[color-mix(in_srgb,var(--demo-muted)_14%,transparent)]')} />
          ))}
        </div>
      </div>
      <div className="text-center">
        <p className="number-font text-3xl font-semibold text-[var(--demo-danger)]">{clamped}%</p>
        <p className="mt-1 text-xs demo-muted">429 pressure</p>
      </div>
    </div>
  )
}

export function MiniLoadTimeline() {
  return (
    <div className="panel rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Load Test Timeline</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[var(--demo-muted)]">
                <Clock3 aria-hidden="true" />
                <span className="sr-only">Timeline details</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ramp up, steady load, spike test, over limit.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_1.5fr_1.4fr_1fr] overflow-hidden rounded-full border" style={{ borderColor: 'var(--demo-border)' }}>
        <span className="h-3 bg-slate-300" />
        <span className="h-3 bg-[var(--demo-accent)]" />
        <span className="h-3 bg-[var(--demo-warn)]" />
        <span className="h-3 bg-[var(--demo-danger)]" />
      </div>
      <div className="mt-2 grid grid-cols-4 text-center text-xs demo-muted">
        <span>Ramp up</span>
        <span>Steady</span>
        <span>Spike</span>
        <span>Over limit</span>
      </div>
    </div>
  )
}

export function DemoCaption({ apiState }) {
  return (
    <div className="rounded-md border px-3 py-2 text-xs leading-relaxed" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-panel) 72%, transparent)' }}>
      <strong>{selectedDashboard.name}</strong>
      <span className="block demo-muted sm:inline"> {selectedDashboard.description}</span>
      {apiState?.message && <span className="block demo-muted sm:inline"> / {apiState.message}</span>}
    </div>
  )
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

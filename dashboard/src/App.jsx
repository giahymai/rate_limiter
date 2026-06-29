import React, { useState, useEffect } from 'react'
import { fetchMetrics, fetchLogs } from './api/gatewayApi.js'
import MetricsPanel from './components/MetricsPanel.jsx'
import LiveChart from './components/LiveChart.jsx'
import RequestLogTable from './components/RequestLogTable.jsx'
import RuleEditor from './components/RuleEditor.jsx'

const POLL_INTERVAL_MS = 2000

export default function App() {
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [history, setHistory] = useState([]) // rolling snapshots for chart

  useEffect(() => {
    // TODO: poll fetchMetrics() and fetchLogs() every POLL_INTERVAL_MS
    // TODO: append each metrics snapshot to history (keep last 60 points)
  }, [])

  return (
    <div>
      <h1>API Gateway Dashboard</h1>
      <MetricsPanel metrics={metrics} />
      <LiveChart history={history} />
      <RequestLogTable logs={logs} />
      <RuleEditor />
    </div>
  )
}

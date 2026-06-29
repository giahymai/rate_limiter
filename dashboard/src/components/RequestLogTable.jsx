import React, { useState } from 'react'

// Props: logs — array of RequestRecord { id, clientId, path, latencyMs, status, cache, timestamp }
export default function RequestLogTable({ logs }) {
  const [filter, setFilter] = useState('')

  // TODO: filter logs by clientId or path containing `filter`
  // TODO: render table with columns: ID, Client, Path, Latency, Status, Cache, Time
  // TODO: highlight rows where status === 'BLOCKED'
  return <div>RequestLogTable — TODO</div>
}

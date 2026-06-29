import React, { useState, useEffect } from 'react'
import { fetchConfig, updateConfig } from '../api/gatewayApi.js'

export default function RuleEditor() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    // TODO: load initial config via fetchConfig()
  }, [])

  const handleSave = async () => {
    // TODO: call updateConfig(config) and update local state
  }

  // TODO: render form fields for algorithm, limit, windowSeconds, cacheTtlSeconds
  // TODO: Apply button calls handleSave
  return <div>RuleEditor — TODO</div>
}

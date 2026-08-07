import { useCallback, useEffect, useState } from 'react'
import { executeAgentAction, fetchAgentSnapshot } from './blimpmateAgentClient'
import { createDemoSnapshot } from './blimpmateAgentData'
import type { AgentActionResult, AgentScenarioId, AgentSnapshot } from './blimpmateAgentData'

export function useBlimpAgent() {
  const [snapshot, setSnapshot] = useState<AgentSnapshot>(() => createDemoSnapshot('Connecting to the agent service'))
  const [lastResult, setLastResult] = useState<AgentActionResult | null>(null)
  const [history, setHistory] = useState<AgentActionResult[]>([])
  const [loadingSnapshot, setLoadingSnapshot] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoadingSnapshot(true)
    try {
      const next = await fetchAgentSnapshot()
      setSnapshot(next)
      setError('')
      return next
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Could not refresh agent state'
      setError(message)
      return null
    } finally {
      setLoadingSnapshot(false)
    }
  }, [])

  const run = useCallback(async (scenario: AgentScenarioId, action: string, payload: Record<string, unknown>) => {
    setRunning(true)
    setError('')
    try {
      const result = await executeAgentAction(scenario, action, payload)
      setLastResult(result)
      setHistory((current) => [result, ...current].slice(0, 12))
      return result
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : 'Could not run agent scenario'
      setError(message)
      return null
    } finally {
      setRunning(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  return { snapshot, lastResult, history, loadingSnapshot, running, error, refresh, run }
}

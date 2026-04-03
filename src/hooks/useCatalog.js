import { useState } from 'react'
import defaultCatalog from '../data/catalog.json'

const STORAGE_KEY = 'lool_catalog_v1'

function loadCustomFrames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomFrames(frames) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(frames))
  } catch {}
}

export function useCatalog() {
  const [customFrames, setCustomFrames] = useState(loadCustomFrames)

  const allFrames = [...defaultCatalog, ...customFrames]

  function addFrame(frame) {
    const updated = [...customFrames, frame]
    setCustomFrames(updated)
    saveCustomFrames(updated)
  }

  function removeFrame(frameId) {
    const updated = customFrames.filter((f) => f.id !== frameId)
    setCustomFrames(updated)
    saveCustomFrames(updated)
  }

  return { allFrames, customFrames, addFrame, removeFrame }
}

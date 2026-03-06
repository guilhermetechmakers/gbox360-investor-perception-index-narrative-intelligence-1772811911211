/**
 * Client-side audit artifact generation for MVP.
 * Produces signed JSON + human-readable PDF with calculation inputs and provenance.
 * Schema version 1.0 with integrity hashes for audit compliance.
 */

import { jsPDF } from 'jspdf'
import type { IPIViewContext } from '@/types/company-view'

export const SCHEMA_VERSION = '1.0'

export interface AuditExportInput {
  companyId: string
  companyName: string
  windowStart: string
  windowEnd: string
  ipi: number
  delta: number
  direction: 'up' | 'down' | 'flat'
  breakdown: { narrative: number; credibility: number; risk: number }
  narratives: Array<{ id: string; label: string; contribution: number }>
  events: Array<{ event_id: string; raw_payload_id: string; source: string; original_timestamp: string }>
  weightVersion?: string
}

const MOCK_SIGNATURE = 'Gbox360-MVP-Signed-Artifact-v1'
const NARRATIVE_WEIGHT = 0.4
const CREDIBILITY_WEIGHT = 0.4
const RISK_WEIGHT = 0.2

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateAuditArtifactJSON(input: AuditExportInput): Promise<string> {
  const events = input.events ?? []
  const eventRefs = events.map((e) => ({
    event_id: e.event_id,
    raw_payload_id: e.raw_payload_id,
    source: e.source,
    original_timestamp: e.original_timestamp,
  }))
  const perItemHashes = await Promise.all(
    eventRefs.map((e) => sha256Hex(JSON.stringify(e)))
  )
  const rootHashInput = JSON.stringify({
    narratives: input.narratives ?? [],
    events: eventRefs,
    perItemHashes,
  })
  const rootHash = await sha256Hex(rootHashInput)

  const artifact = {
    schema_version: SCHEMA_VERSION,
    artifact_metadata: {
      id: `audit-${input.companyId}-${Date.now()}`,
      company_id: input.companyId,
      window_start: input.windowStart,
      window_end: input.windowEnd,
      generated_at: new Date().toISOString(),
      signer_id: 'gbox360-mvp',
      signature: MOCK_SIGNATURE,
      hash: rootHash,
    },
    ipi_view_reference: {
      calculation_inputs: {
        narrativeWeight: NARRATIVE_WEIGHT,
        credibilityWeight: CREDIBILITY_WEIGHT,
        riskWeight: RISK_WEIGHT,
      },
      weight_version: input.weightVersion ?? 'provisional-v1',
    },
    narrative_section: {
      top_narratives: (input.narratives ?? []).map((n) => ({
        id: n.id,
        weight: n.contribution,
        label: n.label,
      })),
    },
    raw_payload_references: events.map((e) => ({
      payload_id: e.raw_payload_id,
      source: e.source,
      payload_type: 'json',
    })),
    event_list: eventRefs,
    integrity: { root_hash: rootHash, per_item_hashes: perItemHashes },
    company: { id: input.companyId, name: input.companyName },
    ipi: {
      score: input.ipi,
      delta: input.delta,
      direction: input.direction,
      breakdown: input.breakdown,
    },
    weightVersion: input.weightVersion ?? 'provisional-v1',
  }
  return JSON.stringify(artifact, null, 2)
}

/** Sync version for backward compatibility - uses placeholder hash */
export function generateAuditArtifactJSONSync(input: AuditExportInput): string {
  const events = (input.events ?? []).map((e) => ({
    event_id: e.event_id,
    raw_payload_id: e.raw_payload_id,
    source: e.source,
    original_timestamp: e.original_timestamp,
  }))
  const artifact = {
    schema_version: SCHEMA_VERSION,
    artifact_metadata: {
      id: `audit-${input.companyId}-${Date.now()}`,
      company_id: input.companyId,
      window_start: input.windowStart,
      window_end: input.windowEnd,
      generated_at: new Date().toISOString(),
      signer_id: 'gbox360-mvp',
      signature: MOCK_SIGNATURE,
      hash: 'pending',
    },
    ipi_view_reference: {
      calculation_inputs: {
        narrativeWeight: NARRATIVE_WEIGHT,
        credibilityWeight: CREDIBILITY_WEIGHT,
        riskWeight: RISK_WEIGHT,
      },
      weight_version: input.weightVersion ?? 'provisional-v1',
    },
    narrative_section: {
      top_narratives: (input.narratives ?? []).map((n) => ({
        id: n.id,
        weight: n.contribution,
        label: n.label,
      })),
    },
    raw_payload_references: events.map((e) => ({
      payload_id: e.raw_payload_id,
      source: e.source,
      payload_type: 'json',
    })),
    event_list: events,
    integrity: { root_hash: 'pending', per_item_hashes: [] as string[] },
    company: { id: input.companyId, name: input.companyName },
    ipi: {
      score: input.ipi,
      delta: input.delta,
      direction: input.direction,
      breakdown: input.breakdown,
    },
    weightVersion: input.weightVersion ?? 'provisional-v1',
  }
  return JSON.stringify(artifact, null, 2)
}

export function downloadJSON(input: AuditExportInput): void {
  const json = generateAuditArtifactJSONSync(input)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gbox360-audit-${input.companyId}-${input.windowStart}-${input.windowEnd}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadPDF(input: AuditExportInput): void {
  const doc = new jsPDF({ format: 'a4' })
  let y = 20

  doc.setFontSize(18)
  doc.text('Gbox360 Audit Artifact', 20, y)
  y += 10

  doc.setFontSize(10)
  doc.text(`Company: ${input.companyName} (${input.companyId})`, 20, y)
  y += 6
  doc.text(`Window: ${input.windowStart} to ${input.windowEnd}`, 20, y)
  y += 6
  doc.text(`Generated: ${new Date().toISOString()}`, 20, y)
  y += 10

  doc.setFontSize(12)
  doc.text('IPI Summary', 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text(`Score: ${input.ipi.toFixed(2)}`, 20, y)
  y += 6
  doc.text(`Direction: ${input.direction} (${input.delta > 0 ? '+' : ''}${input.delta.toFixed(1)}%)`, 20, y)
  y += 6
  doc.text(
    `Breakdown: Narrative ${(input.breakdown.narrative * 100).toFixed(0)}%, Credibility ${(input.breakdown.credibility * 100).toFixed(0)}%, Risk ${(input.breakdown.risk * 100).toFixed(0)}%`,
    20,
    y
  )
  y += 10

  doc.setFontSize(12)
  doc.text('Calculation Inputs (Provisional)', 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text(`Narrative weight: ${NARRATIVE_WEIGHT * 100}%`, 20, y)
  y += 6
  doc.text(`Credibility weight: ${CREDIBILITY_WEIGHT * 100}%`, 20, y)
  y += 6
  doc.text(`Risk weight: ${RISK_WEIGHT * 100}%`, 20, y)
  y += 10

  doc.setFontSize(12)
  doc.text('Top Narratives', 20, y)
  y += 8
  doc.setFontSize(10)
  for (const n of input.narratives ?? []) {
    doc.text(`• ${n.label}: ${(n.contribution * 100).toFixed(0)}%`, 20, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 6

  doc.setFontSize(12)
  doc.text('Payload References', 20, y)
  y += 8
  doc.setFontSize(10)
  for (const e of input.events ?? []) {
    doc.text(`• ${e.event_id} (${e.source}) - ${e.original_timestamp}`, 20, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 10

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Signed: ${MOCK_SIGNATURE}`, 20, y)
  y += 6
  doc.text('This is a provisional MVP artifact. Full KMS signing in production.', 20, y)

  doc.save(`gbox360-audit-${input.companyId}-${input.windowStart}-${input.windowEnd}.pdf`)
}

/** Adapter: convert IPIViewContext to AuditExportInput for export */
export function toAuditInput(ctx: IPIViewContext): AuditExportInput {
  const narratives = ctx.narratives ?? []
  const events = ctx.events ?? []
  return {
    companyId: ctx.companyId,
    companyName: ctx.companyName ?? ctx.companyId,
    windowStart: ctx.windowStart,
    windowEnd: ctx.windowEnd,
    ipi: ctx.ipi ?? 0,
    delta: ctx.delta ?? 0,
    direction: ctx.direction ?? 'flat',
    breakdown: ctx.breakdown ?? { narrative: 0.4, credibility: 0.4, risk: 0.2 },
    narratives: narratives.map((n) => ({
      id: n.narrativeId,
      label: n.name,
      contribution: n.contribution ?? 0,
    })),
    events: events.map((e) => ({
      event_id: e.event_id,
      raw_payload_id: e.raw_payload_id,
      source: e.source ?? '',
      original_timestamp: e.original_timestamp ?? e.ingestion_timestamp ?? '',
    })),
  }
}

export function downloadAuditJSON(ctx: IPIViewContext): void {
  downloadJSON(toAuditInput(ctx))
}

export function downloadAuditPDF(ctx: IPIViewContext): void {
  downloadPDF(toAuditInput(ctx))
}

/** Download artifact JSON from server response (e.g. from export-ipi-artifact) */
export function downloadArtifactFromServer(
  artifactJson: string,
  companyId: string,
  windowStart: string,
  windowEnd: string
): void {
  const blob = new Blob([artifactJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gbox360-audit-${companyId}-${windowStart}-${windowEnd}.json`
  a.click()
  URL.revokeObjectURL(url)
}

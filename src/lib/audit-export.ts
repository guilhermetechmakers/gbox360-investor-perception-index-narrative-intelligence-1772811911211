/**
 * Client-side audit artifact generation for MVP.
 * Produces signed JSON + human-readable PDF with calculation inputs and provenance.
 */

import { jsPDF } from 'jspdf'
import type { IPIViewContext } from '@/types/company-view'

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

export function generateAuditArtifactJSON(input: AuditExportInput): string {
  const artifact = {
    artifactId: `audit-${input.companyId}-${Date.now()}`,
    format: 'JSON' as const,
    createdAt: new Date().toISOString(),
    signed: true,
    signature: MOCK_SIGNATURE,
    payloadReferences: (input.events ?? []).map((e) => e.raw_payload_id),
    calculationInputs: {
      narrativeWeight: NARRATIVE_WEIGHT,
      credibilityWeight: CREDIBILITY_WEIGHT,
      riskWeight: RISK_WEIGHT,
    },
    company: {
      id: input.companyId,
      name: input.companyName,
    },
    window: {
      start: input.windowStart,
      end: input.windowEnd,
    },
    ipi: {
      score: input.ipi,
      delta: input.delta,
      direction: input.direction,
      breakdown: input.breakdown,
    },
    narratives: input.narratives ?? [],
    events: (input.events ?? []).map((e) => ({
      event_id: e.event_id,
      raw_payload_id: e.raw_payload_id,
      source: e.source,
      original_timestamp: e.original_timestamp,
    })),
    weightVersion: input.weightVersion ?? 'provisional-v1',
  }
  return JSON.stringify(artifact, null, 2)
}

export function downloadJSON(input: AuditExportInput): void {
  const json = generateAuditArtifactJSON(input)
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
function toAuditInput(ctx: IPIViewContext): AuditExportInput {
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

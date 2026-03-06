import { useState, useMemo } from 'react'
import { SectionCard } from './SectionCard'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { FAQItem } from '@/types/about-help'

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Why are the weights "provisional"?',
    answer:
      'We surface the current default (40/40/20) and allow experimentation in Settings. Audit exports always use the server-configured weights and log the version for reproducibility.',
  },
  {
    id: 'faq-2',
    question: 'How do I export an audit artifact?',
    answer:
      'From Company View or Drilldown, click "Export snapshot" or "Audit export". A background job generates signed JSON + PDF with raw payload refs and integrity hashes; you receive a download link by email.',
  },
  {
    id: 'faq-3',
    question: 'Where can I see raw payloads?',
    answer:
      'In the "Why did this move?" drilldown, each event has a raw payload button. Admins can use the Raw Payload Browser for full search and replay.',
  },
  {
    id: 'faq-4',
    question: 'What data sources feed the IPI?',
    answer:
      'We ingest news (NewsAPI), social (X/Twitter read-only), and batch earnings transcripts (S3). All raw payloads are preserved in an append-only store for audit.',
  },
  {
    id: 'faq-5',
    question: 'How is credibility scored?',
    answer:
      'Credibility uses heuristics such as repetition across authoritative sources and management language consistency. Outputs are normalized 0–1 scores stored per event and narrative.',
  },
  {
    id: 'faq-6',
    question: 'Can I customize the IPI weights?',
    answer:
      'Yes. In Settings & Preferences, you can experiment with provisional weight scenarios. Your experiments are for exploration; audit exports use server-configured weights.',
  },
]

export function FAQBlock() {
  const [search, setSearch] = useState<string>('')

  const filteredItems = useMemo(() => {
    const items = FAQ_DATA ?? []
    if (!Array.isArray(items)) return []
    const q = (search ?? '').trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        (item.question ?? '').toLowerCase().includes(q) ||
        (item.answer ?? '').toLowerCase().includes(q)
    )
  }, [search])

  return (
    <SectionCard id="faq" title="Frequently Asked Questions" meta="Common questions about IPI and Gbox360">
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search frequently asked questions"
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No FAQs match your search. Try a different term.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent id={`${item.id}-content`}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </SectionCard>
  )
}

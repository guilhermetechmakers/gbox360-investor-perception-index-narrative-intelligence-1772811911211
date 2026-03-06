import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { PolicySection } from './PolicySection'
import { RetentionTable } from './RetentionTable'
import { ContactPanel } from './ContactPanel'
import { SectionDivider } from './SectionDivider'
import { DataRequestForm } from './DataRequestForm'
import {
  DEFAULT_POLICY_SECTIONS,
  DEFAULT_RETENTION_DATA,
  DEFAULT_CONTACT_INFO,
} from './static-data'
import type { PolicySection as PolicySectionType, RetentionRow, ContactInfo } from '@/types/privacy-policy'

export interface PrivacyPolicyPageProps {
  policySections?: PolicySectionType[] | null
  retentionData?: RetentionRow[] | null
  contactInfo?: ContactInfo | null
}

/**
 * Top-level Privacy Policy page container.
 * Composes hero, policy sections, retention table, and contact panel.
 * All data defensively accessed with safe fallbacks.
 */
export function PrivacyPolicyPage({
  policySections,
  retentionData,
  contactInfo,
}: PrivacyPolicyPageProps) {
  const [dataRequestOpen, setDataRequestOpen] = useState(false)

  const sections = Array.isArray(policySections) && policySections.length > 0
    ? policySections
    : DEFAULT_POLICY_SECTIONS

  const retention = Array.isArray(retentionData) && retentionData.length > 0
    ? retentionData
    : DEFAULT_RETENTION_DATA

  const contact = contactInfo ?? DEFAULT_CONTACT_INFO

  const handleRequestDataAccess = useCallback(() => {
    setDataRequestOpen(true)
  }, [])

  const hasPolicyContent = (sections ?? []).length > 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none bg-card text-foreground"
      >
        Skip to main content
      </a>
      <Navbar variant="public" />

      <main
        id="main-content"
        className="flex-1 container px-4 py-12 md:py-16 lg:py-20"
        role="main"
      >
        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <header className="mb-12 md:mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]">
              Privacy Policy
            </h1>
            <p
              className="mt-4 text-lg text-muted-foreground"
              style={{ lineHeight: 1.6 }}
            >
              This policy describes how Gbox360 collects, uses, stores, and shares
              your personal data, retention timelines, security measures, and your
              rights. We are committed to transparency and compliance with
              applicable data protection laws.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: March 2025
            </p>
          </header>

          {hasPolicyContent ? (
            <>
              {/* Policy sections */}
              <div className="space-y-8 md:space-y-10">
                {(sections ?? [])
                  .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                  .map((section, index) => (
                    <div
                      key={section?.id ?? index}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${0.05 + index * 0.05}s`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <PolicySection
                        id={section?.id}
                        title={section?.title ?? ''}
                        bodyText={section?.content}
                        subsections={section?.subsections}
                      />
                    </div>
                  ))}
              </div>

              <SectionDivider aria-label="Section divider before retention table" />

              {/* Retention table */}
              <div className="animate-fade-in-up">
                <RetentionTable data={retention} />
              </div>

              <SectionDivider aria-label="Section divider before contact" />

              {/* Contact panel */}
              <div className="animate-fade-in-up">
                <ContactPanel
                  contactInfo={contact}
                  onRequestDataAccess={handleRequestDataAccess}
                />
              </div>
            </>
          ) : (
            <div
              className="rounded-[10px] border border-border bg-card p-8 md:p-10 text-center"
              role="status"
            >
              <p className="text-muted-foreground">
                Policy content is not available at the moment. Please check back
                later or contact us directly.
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4 pt-4">
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="ghost" className="min-h-[44px]">
              <Link to="/terms">Terms of Service</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      <DataRequestForm
        open={dataRequestOpen}
        onOpenChange={setDataRequestOpen}
      />
    </div>
  )
}

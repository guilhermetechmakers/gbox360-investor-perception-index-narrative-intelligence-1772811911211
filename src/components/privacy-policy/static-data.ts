/**
 * Static default content for the Privacy Policy page.
 * Used when no API/CMS data is provided. Prepared for future data binding.
 */

import type { PolicySection, RetentionRow, ContactInfo } from '@/types/privacy-policy'

export const DEFAULT_POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    order: 1,
    content:
      'We collect account information (email, name, organization, role), usage data necessary to provide the Investor Perception Index (IPI) and drilldown features, and audit logs for security and compliance. Raw payloads from ingestion are stored in an append-only store and linked to narrative events for traceability. We may also collect device and browser information, IP addresses, and cookies for session management and analytics.',
  },
  {
    id: 'data-usage',
    title: 'Data Usage',
    order: 2,
    content:
      'Your data is used to deliver the IPI service, personalize your experience, improve our platform, and comply with legal obligations. We process data to compute narrative scores, generate audit artifacts, and provide support. We do not sell your personal data. Aggregated, anonymized data may be used for research and product improvement.',
  },
  {
    id: 'data-storage-retention',
    title: 'Data Storage & Retention',
    order: 3,
    content:
      'Data is stored in secure, geographically distributed systems with encryption at rest and in transit. Retention periods vary by data category and are documented in the Data Retention table below. We retain data only as long as necessary for the purposes described in this policy or as required by law.',
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing & Third Parties',
    order: 4,
    content:
      'We may share data with service providers (e.g., cloud hosting, email delivery) under strict data processing agreements. We do not share personal data with third parties for marketing. We may disclose data when required by law, to protect rights and safety, or with your consent. International transfers comply with applicable adequacy decisions or standard contractual clauses.',
  },
  {
    id: 'security-measures',
    title: 'Security Measures',
    order: 5,
    content:
      'We implement industry-standard security measures including encryption, access controls, regular audits, and monitoring. Raw payloads and audit artifacts are signed with KMS for integrity. Access to personal data is restricted to authorized personnel. We conduct periodic security assessments and incident response planning.',
  },
  {
    id: 'data-subject-rights',
    title: 'Data Subject Rights',
    order: 6,
    content:
      'You have the right to access, correct, delete, or restrict processing of your personal data. You may request data portability and withdraw consent where applicable. You may object to processing and lodge a complaint with a supervisory authority. To exercise these rights, use the "Submit a Data Request" action below or contact us at the email provided.',
  },
  {
    id: 'contact-remedies',
    title: 'Contact & Remedies',
    order: 7,
    content:
      'For privacy requests, questions, or complaints, contact our Data Protection Officer at the email below. We will respond within 30 days. If you are not satisfied with our response, you may contact your local data protection authority.',
  },
  {
    id: 'changes-to-policy',
    title: 'Changes to This Policy',
    order: 8,
    content:
      'We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the platform. The "Last updated" date at the top reflects the most recent revision. Continued use of the service after changes constitutes acceptance of the updated policy.',
  },
]

export const DEFAULT_RETENTION_DATA: RetentionRow[] = [
  {
    id: '1',
    category: 'Account data',
    retentionPeriod: 'Until account deletion',
    rationale: 'Required for service delivery and user management',
    archivingMethod: 'Soft delete; full purge on request',
  },
  {
    id: '2',
    category: 'Raw payloads & narrative events',
    retentionPeriod: 'Per data retention policy (configurable)',
    rationale: 'Audit trail and replay capability for compliance',
    archivingMethod: 'Append-only store; configurable TTL',
  },
  {
    id: '3',
    category: 'Audit logs',
    retentionPeriod: 'As required for compliance (typically 7 years)',
    rationale: 'Regulatory and security requirements',
    archivingMethod: 'Immutable logs; tiered archival',
  },
  {
    id: '4',
    category: 'Session & usage data',
    retentionPeriod: '90 days',
    rationale: 'Operational and security monitoring',
    archivingMethod: 'Automatic purge after retention period',
  },
  {
    id: '5',
    category: 'Support communications',
    retentionPeriod: '3 years from last contact',
    rationale: 'Support history and dispute resolution',
    archivingMethod: 'Retention policy; deletion on request',
  },
]

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: 'privacy@gbox360.com',
  address: 'Gbox360, Data Protection Office',
  dataRequestUrl: undefined,
}

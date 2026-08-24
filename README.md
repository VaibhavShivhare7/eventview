# Remix of Event Registration Page Template

# AI Agent Prompt

## Project Overview

EventFlow is a white-label SaaS platform for creating branded event registration pages. The system enables non-technical users to design, deploy, and manage professional registration experiences without coding. The platform bridges the gap between DIY form builders and enterprise event management platforms, offering template-driven customization, real-time analytics, and native integrations with webinar platforms (Zoom, Hopin, StreamYard) and marketing automation tools (HubSpot, Marketo, Mailchimp).

**Target Users:** Marketing managers, event coordinators, product managers, and business development professionals at companies hosting 2-50 events annually.

**Success Metrics:** Registration page creation time <5 minutes, conversion rate improvement of 15-25% vs. generic forms, 90%+ customer retention, NPS >50.

## Core Functionality

**Registration Page Builder:**

- Drag-and-drop form field customization (text, email, phone, dropdown, checkbox, file upload)

- Template library with 15+ pre-designed, mobile-responsive layouts

- Brand customization: logo upload, color palette, custom fonts, background images

- Conditional logic for dynamic field visibility based on attendee responses

- Custom thank-you pages with post-registration messaging and resource delivery

- GDPR/CCPA compliance features (consent checkboxes, data retention policies)

**Attendee Management:**

- Real-time attendee list with searchable, filterable database

- Bulk actions (email, export, tag, status update)

- Attendee segmentation and tagging system

- Check-in functionality (QR code scanning, manual check-in)

- Automated email sequences (confirmation, reminder, follow-up)

**Analytics & Reporting:**

- Registration funnel analytics (views, starts, completions, conversion rate)

- Attendee source tracking (UTM parameters, referral source)

- Real-time dashboard with key metrics

- Custom report builder and scheduled email reports

- Heatmap and session recording integration (optional)

**Integration Hub:**

- Native connectors: Zoom, Hopin, StreamYard, Google Meet

- CRM sync: HubSpot, Salesforce, Pipedrive

- Email marketing: Mailchimp, ConvertKit, ActiveCampaign

- Webhooks for custom integrations

- Zapier/Make.com support for extended ecosystem

## User Journey

**Onboarding (Day 1):**

1. User signs up via email/SSO (Google, Microsoft)

2. Guided onboarding wizard: company name, event type, expected attendees

3. Template selection based on event category (webinar, product launch, conference)

4. Automated brand detection (logo, colors from website URL or manual upload)

**Page Creation (Minutes 5-20):**

1. Template preview and selection

2. Form field customization (add/remove/reorder fields)

3. Brand customization (colors, fonts, images, custom domain option)

4. Integration setup (select 2-3 critical integrations)

5. Preview and publish

**Campaign Management (Ongoing):**

1. Share registration link via email, social, website embed

2. Monitor real-time registrations and conversion metrics

3. Send automated confirmation/reminder emails

4. Manage attendee list and check-ins

5. Post-event follow-up and reporting

**Post-Event:**

1. Export attendee data and analytics

2. Automated thank-you email sequence

3. Survey/feedback collection

4. ROI reporting and insights

## Technical Requirements

**Frontend Stack:**

- React 18+ with TypeScript

- Tailwind CSS for styling

- React Query for state management

- Framer Motion for animations

- Formik/React Hook Form for form handling

- Responsive design (mobile-first, tested on iOS/Android, desktop)

**Backend Stack:**

- Node.js/Express or Python/FastAPI

- PostgreSQL for relational data (users, events, registrations)

- Redis for caching and real-time features

- JWT-based authentication with refresh token rotation

- Rate limiting and DDoS protection

**Infrastructure:**

- AWS (EC2, RDS, S3, CloudFront) or equivalent cloud provider

- CDN for global asset delivery

- SSL/TLS encryption for all data in transit

- Database encryption at rest (AES-256)

- Automated backups (daily, 30-day retention)

**Security & Compliance:**

- GDPR, CCPA, SOC 2 Type II compliance

- PCI DSS compliance for payment processing (if applicable)

- Regular penetration testing and security audits

- Two-factor authentication (2FA) for user accounts

- IP whitelisting for enterprise customers

- Data residency options (US, EU, APAC)

**Performance Requirements:**

- Page load time <2 seconds (Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1)

- 99.9% uptime SLA

- Support 10,000+ concurrent registrations per event

- API response time <200ms (p95)

## API Integrations

**Webinar Platform Integrations:**

- **Zoom:** Automatic meeting creation, attendee sync, post-event recording links

- **Hopin:** Attendee registration sync, session assignments

- **StreamYard:** Event metadata sync, broadcast notifications

- **Google Meet:** Meeting link generation and attendee invitations

**CRM & Marketing Automation:**

- **HubSpot:** Contact creation, deal association, custom properties

- **Salesforce:** Lead object creation, field mapping

- **Mailchimp:** Audience list sync, automation trigger

- **ActiveCampaign:** Contact creation, tag assignment, automation workflows

**Payment Processing (Future):**

- Stripe for paid event ticketing

- PayPal for international payments

**Analytics & Attribution:**

- Google Analytics 4 event tracking

- Segment for data warehouse integration

- Mixpanel for cohort analysis

**Webhook Specifications:**

- Event triggers: registration.created, registration.updated, registration.deleted, event.published, event.started, event.ended

- Retry logic: exponential backoff (3 attempts over 24 hours)

- Signature verification using HMAC-SHA256

## Real-Time Features

**Live Attendee Updates:**

- WebSocket connection for real-time registration count updates

- Live attendee feed visible to event organizers

- Real-time conversion rate and funnel metrics on dashboard

- Instant notifications for high-value registrations (VIP list)

**Collaborative Features:**

- Multi-user access with role-based permissions (Admin, Editor, Viewer)

- Real-time form preview updates across team members

- Comment/annotation system on registration pages

- Activity log with user action tracking

**Check-In Experience:**

- QR code generation for mobile check-in

- Real-time check-in status updates

- Offline check-in capability with sync on reconnection

- Badge printing integration for in-person events

## Implementation Details

**Phase 1 (MVP - Weeks 1-8):**

- User authentication and account management

- Template-based page builder (5 core templates)

- Basic form customization (fields, branding)

- Attendee database and list management

- Email confirmation automation

- Basic analytics dashboard

- Zoom and HubSpot integrations

**Phase 2 (Weeks 9-16):**

- Advanced form logic (conditional fields, branching)

- Custom domain support

- Email sequence builder (3+ email automation)

- Enhanced analytics (funnel, cohort, attribution)

- Hopin and Mailchimp integrations

- Check-in functionality (QR code)

- Role-based access control

**Phase 3 (Weeks 17-24):**

- Template marketplace (community-created templates)

- Advanced segmentation and audience targeting

- A/B testing framework for registration pages

- Webhook and custom integration support

- Zapier/Make.com integration

- Survey/feedback collection post-event

- Advanced reporting and export options

**Development Workflow:**

- Agile sprints (2-week cycles)

- GitHub for version control with branch protection

- Automated testing (Jest for unit, Cypress for E2E)

- CI/CD pipeline (GitHub Actions or GitLab CI)

- Staging environment for QA before production deployment

- Feature flags for gradual rollout

## MVP Features

**Essential for Launch:**

1. User registration and authentication (email/SSO)

2. Event creation wizard (3-step guided process)

3. Template selection and basic customization

4. Drag-and-drop form builder (10+ field types)

5. Brand customization (logo, colors, fonts)

6. Registration page preview and publish

7. Attendee list with export (CSV, Excel)

8. Email confirmation automation (template-based)

9. Basic analytics dashboard (registrations, conversion rate, traffic source)

10. Zoom integration (automatic meeting creation and sync)

11. HubSpot integration (contact creation)

12. Mobile-responsive design

13. GDPR consent checkbox

14. Help documentation and onboarding videos

**Out of Scope for MVP:**

- Payment processing

- Advanced email sequences (>1 email)

- A/B testing

- Custom domain

- Webhook support

- Check-in functionality

- Template marketplace

## Future Features

**Short-term (3-6 months post-launch):**

- Payment processing (Stripe, PayPal) for paid events

- Advanced email automation (multi-step sequences, conditional sends)

- A/B testing framework for registration pages

- Custom domain support

- Webhook and custom integration builder

- Check-in app (iOS/Android) with QR scanning

- Survey and feedback collection tools

- Advanced segmentation and audience targeting

**Long-term (6-12 months):**

- Template marketplace with community-created designs

- AI-powered page optimization recommendations

- Predictive analytics (no-show forecasting, conversion prediction)

- Multi-language support

- Video hosting integration (Wistia, Vimeo)

- Attendee networking features (matchmaking, virtual booths)

- Enterprise features (SSO, advanced security, custom SLA)

- Mobile app for event organizers

- Affiliate/referral program for template creators

## User Experience Guidelines

**Design Principles:**

- **Simplicity:** 80/20 rule—prioritize core features, hide advanced options in "Advanced" sections

- **Clarity:** Clear CTAs, descriptive labels, contextual help tooltips

- **Consistency:** Unified design system (spacing, typography, color palette)

- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support

- **Performance:** Perceived speed through skeleton screens and progressive loading

**Onboarding:**

- Interactive tutorial on first login (3-5 minute walkthrough)

- Contextual help icons and tooltips

- Sample event template for exploration

- Email-based onboarding sequence (Day 1, 3, 7)

**Navigation:**

- Left sidebar with primary navigation (Events, Attendees, Analytics, Integrations, Settings)

- Breadcrumb navigation for sub-pages

- Search functionality for events and attendees

- Keyboard shortcuts for power users

**Form Builder UX:**

- Drag-and-drop with visual feedback (hover states, drop zones)

- Real-time preview pane (side-by-side or toggle view)

- Undo/redo functionality

- Field customization panel with inline editing

- Template library with search and filtering

**Mobile Experience:**

- Touch-optimized interface (44px minimum touch targets)

- Simplified navigation (hamburger menu)

- Responsive form builder (stack vertically on mobile)

- Mobile-first registration page preview

**Accessibility:**

- ARIA labels and semantic HTML

- Color contrast ratio ≥4.5:1 for text

- Focus indicators for keyboard navigation

- Alt text for all images

- Closed captions for video tutorials

## Code Quality Standards

**Frontend:**

- TypeScript for type safety (strict mode enabled)

- ESLint configuration (Airbnb style guide)

- Prettier for code formatting

- Unit test coverage ≥80% (Jest)

- E2E test coverage for critical user flows (Cypress)

- Storybook for component documentation

- Accessibility testing (axe-core, Lighthouse)

**Backend:**

- TypeScript or Python with type hints

- Linting and formatting (ESLint/Pylint, Prettier/Black)

- Unit test coverage ≥75% (Jest/pytest)

- Integration test coverage for API endpoints

- API documentation (Swagger/OpenAPI)

- Error handling and logging (Winston/structlog)

- Database query optimization and indexing

**General Standards:**

- Code reviews required before merge (2 approvals)

- Commit messages follow Conventional Commits format

- Branch naming convention: feature/*, bugfix/*, hotfix/*

- Semantic versioning for releases

- Changelog maintained (CHANGELOG.md)

- Documentation for all public APIs and complex logic

- Security scanning (Snyk, OWASP ZAP)

- Performance monitoring (New Relic, DataDog)

**DevOps:**

- Infrastructure as Code (Terraform, CloudFormation)

- Automated testing in CI/CD pipeline

- Staging environment mirrors production

- Blue-green deployments for zero-downtime releases

- Rollback capability for failed deployments

- Monitoring and alerting (uptime, error rates, performance)

## Deliverable Format

**Documentation:**

- Product Requirements Document (PRD) with user stories and acceptance criteria

- Technical Architecture Document (system design, data models, API specs)

- API Documentation (Swagger/OpenAPI with examples)

- User Guide and Help Center articles (Markdown, hosted on Docs site)

- Admin Guide for customer support team

- Security and Compliance documentation

**Code Repositories:**

- Frontend repository (React app with component library)

- Backend repository (API and business logic)

- Infrastructure repository (Terraform/CloudFormation templates)

- Documentation repository (Markdown files, Docusaurus or similar)

**Deployment Artifacts:**

- Docker images for frontend and backend

- Docker Compose for local development

- Kubernetes manifests for production deployment (optional)

- Database migration scripts

- Environment configuration templates

**Testing & QA:**

- Unit test suite with coverage reports

- E2E test suite with test data fixtures

- Performance test results and benchmarks

- Security audit report

- Accessibility audit report (WCAG compliance)

- Browser compatibility matrix

**Release Package:**

- Release notes with features, bug fixes, known issues

- Migration guide for database schema changes

- Deployment checklist and runbook

- Rollback procedures

- Customer communication template

**Analytics & Monitoring:**

- Dashboard setup guide (New Relic, DataDog, or similar)

- Alert configuration and escalation procedures

- Key metrics and SLA definitions

- Performance baseline and optimization recommendations

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://eventview.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2b50e091-edd1-4ec0-af57-ce9ecfdf5bfc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

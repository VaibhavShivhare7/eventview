// Default copy for each Landing section. Used as fallback when no override row
// exists in the `landing_sections` table.

export type LandingSectionKey =
  | "hero"
  | "popular_events"
  | "features"
  | "testimonials"
  | "cta";

export interface HeroContent {
  badge: string;
  headline_prefix: string;
  rotating_words: string[];
  subhead: string;
  cta: string;
}

export interface PopularEventsContent {
  title_line_1: string;
  title_line_2: string;
  subhead: string;
  cta_label: string;
}

export interface FeaturesContent {
  eyebrow: string;
  title_line_1: string;
  title_line_2: string;
  subhead: string;
  items: { tag: string; title: string; description: string }[];
}

export interface TestimonialsContent {
  title: string;
  items: { quote: string; name: string; role: string }[];
}

export interface CtaContent {
  title_line_1: string;
  title_line_2: string;
  subhead: string;
  cta_label: string;
}

export const LANDING_DEFAULTS = {
  hero: {
    badge: "Event registration software for organizers",
    headline_prefix: "Event registration software for",
    rotating_words: ["conferences.", "workshops.", "meetups.", "summits."],
    subhead:
      "Create an online event registration page in minutes, sell or track tickets, manage attendee check-in, and see live signup analytics. No code required.",
    cta: "Get started",
  } as HeroContent,
  popular_events: {
    title_line_1: "Popular events",
    title_line_2: "on event view",
    subhead: "A glimpse at the events taking registrations on event view right now.",
    cta_label: "Browse all events",
  } as PopularEventsContent,
  features: {
    eyebrow: "Built for organizers",
    title_line_1: "Everything you need for",
    title_line_2: "online event registration.",
    subhead: "From registration pages to attendee management and post-event analytics, event view is complete event registration software.",
    items: [
      { tag: "Pages", title: "Registration pages in minutes", description: "Build a branded event registration page and share one registration link — no design skills needed." },
      { tag: "Insights", title: "Live registration analytics", description: "Dashboards that show where registrations come from, where attendees drop off, and what converts." },
      { tag: "Integrations", title: "Integrate with everything", description: "Connect Zoom, HubSpot, Mailchimp, and 20+ tools in a few clicks." },
      { tag: "Audience", title: "Attendee management hub", description: "Manage, message, and check in every attendee from a single event management dashboard." },
    ],
  } as FeaturesContent,
  testimonials: {
    title: "Loved by organizers",
    items: [
      { quote: "event view cut our setup time by 80%. We went from spending hours on registration to minutes.", name: "Sarah Chen", role: "Community manager" },
      { quote: "The analytics alone are worth it. We finally know where our attendees are coming from.", name: "Marcus Williams", role: "Event coordinator" },
      { quote: "Clean, professional, and easy to use. Our attendees always compliment the registration experience.", name: "Priya Patel", role: "Startup founder" },
      { quote: "We switched from three different tools to just event view. Everything in one place is a game changer.", name: "James Liu", role: "Tech meetup organizer" },
      { quote: "Our registrations doubled after switching. The pages just look so much more professional.", name: "Amara Osei", role: "Conference director" },
    ],
  } as TestimonialsContent,
  cta: {
    title_line_1: "Start taking event",
    title_line_2: "registrations today.",
    subhead: "Join thousands of organizers who use event view as their event registration and ticketing software.",
    cta_label: "Get started for free",
  } as CtaContent,
};

export type LandingContentMap = {
  hero: HeroContent;
  popular_events: PopularEventsContent;
  features: FeaturesContent;
  testimonials: TestimonialsContent;
  cta: CtaContent;
};

export const LANDING_SECTION_LABELS: Record<LandingSectionKey, string> = {
  hero: "Hero",
  popular_events: "Popular events heading",
  features: "Features grid",
  testimonials: "Testimonials",
  cta: "Final call to action",
};

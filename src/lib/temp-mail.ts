const DOMAINS = [
  "tempmailpro.io",
  "quickmail.dev",
  "shieldmail.co",
  "privbox.net",
  "dropmail.cc",
];

const ADJECTIVES = [
  "swift",
  "calm",
  "bold",
  "keen",
  "pure",
  "cool",
  "fast",
  "safe",
  "zen",
  "nova",
  "eco",
  "pro",
  "neo",
  "lux",
  "max",
  "sol",
  "arc",
  "vex",
  "ion",
  "flux",
];

const NOUNS = [
  "fox",
  "owl",
  "ray",
  "bay",
  "oak",
  "elm",
  "sky",
  "sea",
  "sun",
  "air",
  "hub",
  "lab",
  "box",
  "den",
  "hex",
  "pod",
  "web",
  "app",
  "dev",
  "net",
];

export function generateEmailAddress(): { address: string; domain: string } {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9999) + 1;
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const address = `${adj}.${noun}${num}@${domain}`;
  return { address, domain };
}

export interface SimulatedMessage {
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
}

const SIMULATED_MESSAGES: SimulatedMessage[] = [
  {
    fromName: "GitHub",
    fromEmail: "noreply@github.com",
    subject: "Verify your email address",
    body: `Hello,

Thank you for signing up! Please verify your email address by clicking the link below:

[Verify Email Address]

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Thanks,
The GitHub Team`,
  },
  {
    fromName: "Notion",
    fromEmail: "team@notify.notion.so",
    subject: "Welcome to Notion — Let's get started",
    body: `Hey there! 👋

Welcome to Notion! We're excited to have you on board.

Here are a few things you can do to get started:
• Create your first page
• Import your existing documents
• Invite your team members
• Try one of our templates

Need help? Check out our guides or reach out to support.

Best,
The Notion Team`,
  },
  {
    fromName: "Stripe",
    fromEmail: "receipts@stripe.com",
    subject: "Payment receipt #INV-2024-4829",
    body: `Your payment has been processed successfully.

Receipt #INV-2024-4829
Date: ${new Date().toLocaleDateString()}
Amount: $29.00 USD

Description: Pro Plan — Monthly Subscription

This was a payment for your Pro Plan subscription. You can view your billing history in your account settings.

Thank you for your business.

Stripe Payments`,
  },
  {
    fromName: "Vercel",
    fromEmail: "notifications@vercel.com",
    subject: "Deployment successful — my-app",
    body: `Your deployment was successful! 🎉

Project: my-app
Branch: main
Status: ✅ Ready
URL: https://my-app.vercel.app

Build completed in 32s.

View Deployment → https://vercel.com/dashboard

— The Vercel Team`,
  },
  {
    fromName: "LinkedIn",
    fromEmail: "messages@linkedin.com",
    subject: "You have 3 new connection requests",
    body: `Hi there,

You have 3 new connection requests waiting for you:

1. Sarah Chen — Product Designer at Figma
2. Alex Rivera — Senior Engineer at Stripe
3. Maria Lopez — CTO at TechStartup

Accept these requests to grow your professional network.

View all requests → https://linkedin.com/notifications

— LinkedIn Team`,
  },
  {
    fromName: "Figma",
    fromEmail: "no-reply@figma.com",
    subject: "You've been invited to a project",
    body: `Hi there,

John Doe has invited you to collaborate on a Figma project:

Project: "Design System v2"
Role: Editor

Accept Invitation → https://figma.com/invite/abc123

This invitation will expire in 7 days.

Happy designing,
The Figma Team`,
  },
  {
    fromName: "Amazon",
    fromEmail: "shipment@amazon.com",
    subject: "Your order has been shipped!",
    body: `Great news! Your order has been shipped.

Order #: 114-2849571-6350233
Estimated delivery: ${new Date(Date.now() + 3 * 86400000).toLocaleDateString()}

Items:
• USB-C Hub Adapter — $24.99
• Cable Management Kit — $12.99

Track your package → https://amazon.com/track

Thank you for shopping with us!

Amazon.com`,
  },
  {
    fromName: "Slack",
    fromEmail: "feedback@slack.com",
    subject: "You've been added to #design-team",
    body: `You've been added to the channel #design-team in the workspace Acme Corp.

This channel is for the design team to share work, get feedback, and collaborate.

Some recent messages:
• Sarah: "Just pushed the new mockups for the landing page"
• Alex: "Looking great! Let's review in our next standup"

Open Slack → https://acme.slack.com

— The Slack Team`,
  },
];

export function getRandomMessage(): SimulatedMessage {
  return SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];
}

export function getMultipleMessages(count: number): SimulatedMessage[] {
  const shuffled = [...SIMULATED_MESSAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

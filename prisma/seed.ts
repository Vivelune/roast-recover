// prisma/seed.ts

import { prisma } from "@/lib/prisma";


async function main() {
  // Clean slate for dev — remove if you don't want auto-wipe on every run
  await prisma.outreachEmailEvent.deleteMany();
  await prisma.outreachScheduledEmail.deleteMany();
  await prisma.outreach.deleteMany();
  await prisma.campaign.deleteMany();

  const campaign = await prisma.campaign.create({
    data: {
      name: 'Nashville Cafes - Aug 2026',
      description: 'Cold outreach batch for Nashville independent cafes',
    },
  });

  const leads = await Promise.all([
    prisma.outreach.create({
      data: {
        email: 'test-roze@example.com',
        name: 'Roze Team',
        company: 'Cafe Roze',
        source: 'email_list_nashville',
        status: 'OPENED',
      },
    }),
    prisma.outreach.create({
      data: {
        email: 'test-germantown@example.com',
        name: 'Germantown Team',
        company: 'Germantown Café',
        source: 'email_list_nashville',
        status: 'CONTACTED',
      },
    }),
    prisma.outreach.create({
      data: {
        email: 'test-crema@example.com',
        name: 'Crema Team',
        company: 'Crema Coffee Roasters',
        source: 'email_list_nashville',
        status: 'NEW',
      },
    }),
  ]);

  // A sent email with tracking events, for testing the analytics view
  const sentEmail = await prisma.outreachScheduledEmail.create({
    data: {
      leadId: leads[0].id,
      campaignId: campaign.id,
      subject: 'Quick equipment pricing check for Cafe Roze',
      body: 'Hi Cafe Roze team, ...',
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      status: 'SENT',
    },
  });

  await prisma.outreachEmailEvent.create({
    data: {
      scheduledEmailId: sentEmail.id,
      type: 'OPEN',
    },
  });

  // A follow-up scheduled for the future, linked to the sent email
  await prisma.outreachScheduledEmail.create({
    data: {
      leadId: leads[0].id,
      campaignId: campaign.id,
      subject: 'Re: Quick equipment pricing check for Cafe Roze',
      body: 'Following up with a concrete number...',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      status: 'PENDING',
      parentEmailId: sentEmail.id,
    },
  });

  // A pending first-touch email, not yet sent
  await prisma.outreachScheduledEmail.create({
    data: {
      leadId: leads[2].id,
      campaignId: campaign.id,
      subject: 'Quick equipment pricing check for Crema',
      body: 'Since you\'re roasting in-house...',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now
      status: 'PENDING',
    },
  });

  console.log('Seed complete:', { campaign: campaign.id, leads: leads.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
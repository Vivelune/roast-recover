import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const { data, error } = await resend.emails.send({
    from: "Atif <ritual@roastandrecover.com>",
    to: "test-pfq9nkrop@srv1.mail-tester.com",
    subject: "Test — deliverability check",
    html: "<p>This is a deliverability test for Roast & Recover outreach.</p>",
  });

  if (error) {
    console.error("❌ Send failed:");
    console.error(error);
    return;
  }

  console.log("✅ Email sent!");
  console.log(data);
}

main();
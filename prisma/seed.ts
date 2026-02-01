import { PrismaClient } from "@prisma/client"
import "dotenv/config"

const prisma = new PrismaClient()

const companies = [
  // Tech Giants
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "Nvidia", domain: "nvidia.com" },
  { name: "AMD", domain: "amd.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Dell", domain: "dell.com" },
  { name: "HP", domain: "hp.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Lyft", domain: "lyft.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Twitter", domain: "twitter.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Snapchat", domain: "snapchat.com" },
  { name: "Pinterest", domain: "pinterest.com" },
  { name: "Reddit", domain: "reddit.com" },
  { name: "TikTok", domain: "tiktok.com" },
  { name: "Zoom", domain: "zoom.us" },
  { name: "Slack", domain: "slack.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  
  // Finance & Payments
  { name: "Stripe", domain: "stripe.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Square", domain: "squareup.com" },
  { name: "Visa", domain: "visa.com" },
  { name: "Mastercard", domain: "mastercard.com" },
  { name: "Amex", domain: "americanexpress.com" },
  { name: "Chase", domain: "chase.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  
  // E-commerce & Retail
  { name: "Walmart", domain: "walmart.com" },
  { name: "Target", domain: "target.com" },
  { name: "Costco", domain: "costco.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "Adidas", domain: "adidas.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Etsy", domain: "etsy.com" },
  { name: "eBay", domain: "ebay.com" },
  
  // Media & Entertainment
  { name: "Disney", domain: "disney.com" },
  { name: "Warner Bros", domain: "warnerbros.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "Nintendo", domain: "nintendo.com" },
  
  // Automotive
  { name: "Toyota", domain: "toyota.com" },
  { name: "Volkswagen", domain: "vw.com" },
  { name: "Ford", domain: "ford.com" },
  { name: "BMW", domain: "bmw.com" },
  { name: "Mercedes-Benz", domain: "mercedes-benz.com" },
  
  // Others
  { name: "Coca-Cola", domain: "coca-colacompany.com" },
  { name: "Pepsi", domain: "pepsi.com" },
  { name: "McDonalds", domain: "mcdonalds.com" },
  { name: "Starbucks", domain: "starbucks.com" }
]

async function main() {
  console.log("Start seeding ...")
  for (const company of companies) {
    const logoUrl = "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://" + company.domain + "&size=256"
    
    const existing = await prisma.company.findUnique({ where: { domain: company.domain } })
    if (!existing) {
        const c = await prisma.company.create({
          data: {
            name: company.name,
            domain: company.domain,
            logoUrl: logoUrl,
            description: "Official logo of " + company.name,
            sector: "Various",
            industry: "Various",
          },
        })
        console.log("Created company: " + c.name)
    } else {
      console.log("Skipping existing company: " + company.name)
    }
  }
  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

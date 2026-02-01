import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.company.count()
  console.log("Total companies:", count)
}
main().then(() => prisma.$disconnect())

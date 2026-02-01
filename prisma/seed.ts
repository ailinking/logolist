const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = "KVxeyb1E$DR!Y1"
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.adminUser.upsert({
    where: { username: 'afflink' },
    update: {
      password: hashedPassword,
    },
    create: {
      username: 'afflink',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log({ user })
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

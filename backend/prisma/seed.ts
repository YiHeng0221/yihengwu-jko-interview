import { PrismaClient } from '@prisma/client'
import { SEED_CHARITIES } from './seed-data.js'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const { count } = await prisma.$transaction(async (tx) => {
    await tx.charity.deleteMany()
    return tx.charity.createMany({ data: SEED_CHARITIES })
  })
  console.log(`Seeded ${count} charities`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

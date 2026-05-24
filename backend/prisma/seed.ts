import { PrismaClient } from '@prisma/client'
import { SEED_CHARITIES } from './seed-data.js'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await prisma.charity.deleteMany()
  const { count } = await prisma.charity.createMany({ data: SEED_CHARITIES })
  console.log(`Seeded ${count} charities`)
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect())

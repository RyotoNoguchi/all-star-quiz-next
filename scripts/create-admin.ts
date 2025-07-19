/**
 * Script to create admin user for testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@example.com'
  
  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingUser) {
    // Update existing user to admin
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        role: 'ADMIN',
        name: 'Admin User'
      },
    })
    console.log('Updated existing user to admin:', updatedUser)
  } else {
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })
    console.log('Created new admin user:', adminUser)
  }

  // List all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })
  
  console.log('\nAll users:')
  console.table(allUsers)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
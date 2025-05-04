const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'carpioalephzain@gmail.com' },
    update: {},
    create: {
      email: 'carpioalephzain@gmail.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          location: 'Bulan'
        }
      }
    }
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

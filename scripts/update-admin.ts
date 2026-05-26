import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'simon69193@gmail.com';
  const newPassword = 'simon19';
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      name: 'JK Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`Successfully updated/created admin ${adminEmail} with new password.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

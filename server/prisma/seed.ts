import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@commtechsolutions.com' },
    update: {},
    create: { email: 'admin@commtechsolutions.com', fullName: 'Super Admin', passwordHash: adminPassword, role: 'super_admin' },
  });

  const settings = [
    { key: 'company_name', value: { value: 'Commtech Solutions' } },
    { key: 'currency', value: { value: 'GHS' } },
    { key: 'currency_symbol', value: { value: 'GH₵' } },
    { key: 'delivery_fee', value: { value: 15 } },
    { key: 'free_delivery_threshold', value: { value: 200 } },
    { key: 'guest_checkout', value: { value: true } },
    { key: 'paystack_enabled', value: { value: true } },
    { key: 'cod_enabled', value: { value: true } },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

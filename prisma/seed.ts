import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Password Hash
  const hashedPassword = await hash('password123', 10);
  
  // 2. Bersihkan Data Lama
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  // 3. Buat User
  const user = await prisma.user.create({
    data: {
      email: 'dev@saas.com',
      name: 'Developer Utama',
      password: hashedPassword,
      businessProfile: {
        create: {
          companyName: 'PT INVOICE GENERATOR',
          address: 'Jakarta, Indonesia',
        }
      }
    },
  });

  console.log('User created:', user.email);

  // 4. Buat Customer
  const customer = await prisma.customer.create({
    data: {
      userId: user.id,
      name: 'PT Klien Pertama',
      email: 'klien@test.com',
      address: 'Bandung',
    }
  });

  // 5. Buat Invoice
  await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customer.id,
      invoiceNumber: 'INV-001',
      dueDate: new Date(),
      status: InvoiceStatus.PENDING,
      subTotal: 1000000,
      items: {
        create: [
          { description: 'Jasa Web', quantity: 1, unitPrice: 1000000 }
        ]
      }
    }
  });

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Nomor Invoice wajib diisi"),
  total: z.number().min(1, "Total tidak boleh 0"),
  status: z.enum(["DRAFT", "PENDING", "PAID", "VOID", "OVERDUE"]),
  date: z.date(),
  dueDate: z.number().min(0, "Jatuh tempo minimal 0 hari"),
  fromName: z.string().min(1, "Nama pengirim wajib ada"),
  fromEmail: z.string().email(),
  fromAddress: z.string().optional(),
  clientName: z.string().min(1, "Nama klien wajib diisi"),
  clientEmail: z.string().email("Email klien tidak valid"),
  clientAddress: z.string().optional(),
  currency: z.string().default("IDR"),
  items: z.array(z.object({
    description: z.string().min(1, "Deskripsi wajib diisi"),
    quantity: z.number().min(1, "Min qty 1"),
    rate: z.number().min(0, "Harga min 0")
  })).min(1, "Minimal satu item diperlukan")
});

// Tipe data TypeScript otomatis dari schema Zod
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
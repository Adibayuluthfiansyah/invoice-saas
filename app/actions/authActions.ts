"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { createSession,} from "@/lib/session";
import { 
  registerSchema, 
  RegisterInput, 
  loginSchema, 
  LoginInput 
} from "@/lib/zodSchemas";
import { deleteSession } from "@/lib/session";
import {redirect} from "next/navigation";
import { Resend } from "resend";
import crypto from "crypto";  

const resend = new Resend(process.env.RESEND_API_KEY!);

// REGISTER FUNCTION
export async function registerUser(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Data input tidak valid" };
  }
  const { name, email, password } = result.data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, error: "Email sudah digunakan" };
    }
    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        businessProfile: {
          create: {
            companyName: `${name}'s Business`,
          },
        },
      },
    });
    return { success: true };
} catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
}
}

// LOGIN FUNCTION
export async function loginUser(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Data input tidak valid" };
  }
  const { email, password } = result.data;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {    
      return { success: false, error: "Email atau password salah" };
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Email atau password salah" };
    }
    await createSession(user.id);    
    // Hapus password sebelum dikembalikan ke client 
    const { password: _, ...userWithoutPassword } = user;    
    return { success: true, user: userWithoutPassword };

  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Terjadi kesalahan tak terduga" };
  }
}

// PASSWORD REQUEST RESET FUNCTIONS
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: "Jika email terdaftar, link reset akan dikirim." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Jam

  await prisma.user.update({
    where: { email },
    data: { 
      resetToken, 
      resetTokenExpiry 
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

  try {
    await resend.emails.send({
      from: "7ONG Invoice <onboarding@resend.dev>", 
      to: email,
      subject: "Reset Password Anda",
      html: `
        <p>Anda meminta untuk mereset password.</p>
        <p>Klik link di bawah ini untuk membuat password baru:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Link ini berlaku selama 1 jam.</p>
        <p>Jika Anda tidak meminta ini, abaikan saja.</p>
      `,
    });
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, message: "Gagal mengirim email." };
  }

  return { success: true, message: "Link reset telah dikirim ke email Anda." };
}


// FUNCTION TO RESET PASSWORD
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }, 
    },
  });

  if (!user) {
    return { success: false, error: "Token tidak valid atau sudah kadaluarsa." };
  }
  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { success: true, message: "Password berhasil diubah! Silakan login." };
}

// LOGOUT FUNCTION
export async function logoutUser() {
  try {
    await deleteSession();
    redirect('/login');
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: "Terjadi kesalahan saat logout" };
  }
}

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

export async function logoutUser() {
  try {
    await deleteSession();
    redirect('/login');
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: "Terjadi kesalahan saat logout" };
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { customerSchema } from "@/lib/zodSchemas";
import { redirect } from "next/navigation";
import { SubmissionState } from "./CreateInvoice"; 

export async function createCustomer(
  prevState: SubmissionState,
  formData: FormData
): Promise<SubmissionState> {
  const session = await getSession();
  if (!session?.userId) {
    return { status: "error", message: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
  };

  const validated = customerSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      errors: validated.error.flatten().fieldErrors,
      message: "Gagal memvalidasi data customer.",
    };
  }

  try {
    await prisma.customer.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        address: validated.data.address,
        userId: session.userId as string,
      },
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return { status: "error", message: "Gagal menyimpan data customer." };
  }


  redirect("/customers");
}
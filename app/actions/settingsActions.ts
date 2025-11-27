"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { settingsSchema } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { SubmissionState } from "@/app/actions/CreateInvoice"; 
import { supabase } from "@/lib/supabase";

export async function updateBusinessProfile(
  prevState: SubmissionState, 
  formData: FormData
): Promise<SubmissionState> { 
  
  const session = await getSession();
  if (!session?.userId) {
    return { status: "error", message: "Unauthorized" };
  }

  const rawData = {
    companyName: formData.get("companyName") as string,
    address: formData.get("address") as string,
    taxId: formData.get("taxId") as string,
    invoiceTaxRate: Number(formData.get("invoiceTaxRate") || 0),
    paymentClientKey: formData.get("paymentClientKey") as string,
    paymentServerKey: formData.get("paymentServerKey") as string,
  };

  const validated = settingsSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      errors: validated.error.flatten().fieldErrors,
      message: "Input tidak valid.",
    };
  }

 
  const logoFile = formData.get("logo") as File;
  
  let logoUrlPath: string | null = null;

  if (logoFile && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      return {
        status: "error",
        message: "File logo harus berupa gambar.",
      };
    }
    
    if (logoFile.size > 2 * 1024 * 1024) {
      return {
        status: "error",
        message: "Ukuran file logo maksimal 2MB.",
      };
    }

    try {
      const fileName = `logo-${session.userId}-${Date.now()}.${logoFile.name.split(".").pop()}`;
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage  
        .from("logos")
        .upload(fileName, buffer, {
          contentType: logoFile.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);
        
      logoUrlPath = publicUrlData.publicUrl;
      
    } catch (error) {
      console.error("Upload Error:", error);
      return { status: "error", message: "Gagal mengupload logo." };
    }
  }

  try {
    await prisma.businessProfile.upsert({
      where: {
        userId: session.userId as string,
      },
      update: {
        companyName: validated.data.companyName,
        address: validated.data.address,
        taxId: validated.data.taxId,
        invoiceTaxRate: validated.data.invoiceTaxRate,
        paymentClientKey: validated.data.paymentClientKey,
        paymentServerKey: validated.data.paymentServerKey,
        ...(logoUrlPath && { logoUrl: logoUrlPath }),
      },
      create: {
        userId: session.userId as string,
        companyName: validated.data.companyName,
        address: validated.data.address,
        taxId: validated.data.taxId,
        invoiceTaxRate: validated.data.invoiceTaxRate,
        paymentClientKey: validated.data.paymentClientKey,
        paymentServerKey: validated.data.paymentServerKey,
        logoUrl: logoUrlPath || null, 
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    revalidatePath("/settings"); 
    
    return { status: "success", message: "Profil bisnis dan logo berhasil disimpan!" };
  } catch (error) {
    console.error("Database Error:", error);
    return { status: "error", message: "Gagal menyimpan data." };
  }
}
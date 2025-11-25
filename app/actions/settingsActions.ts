"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { settingsSchema } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { SubmissionState } from "@/app/actions/CreateInvoice"; 
import { supabase } from "@/lib/supabase";
import { th } from "date-fns/locale";


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
  };

  const validated = settingsSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      status: "error",
      errors: validated.error.flatten().fieldErrors,
      message: "Input tidak valid.",
    };
  }

  const logoFIle = formData.get("companyLogo") as File;
  let logoUrlPath: string | null = null;
  if (logoFIle && logoFIle.size > 0) {
    if (!logoFIle.type.startsWith("image/")) {
      return {
        status: "error",
        message: "File logo harus berupa gambar.",
      };
    }
    if (logoFIle.size > 2 * 1024 * 1024) {
      return {
        status: "error",
        message: "Ukuran file logo maksimal 2MB.",
      };
    }
    try {
      const fileName = `logo-${session.userId}-${Date.now()}.${logoFIle.name.split(".").pop()}`;
      const arrayBuffer = await logoFIle.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const {error : uploadError} = await supabase.storage  
        .from("logos")
        .upload(fileName, buffer, {
        contentType: logoFIle.type,
        upsert: true,
        });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);
        logoUrlPath = publicUrlData.publicUrl;
    }catch (error) {
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
        ...(logoUrlPath ? { logoUrl: logoUrlPath } : {}),
      },
      create: {
        userId: session.userId as string,
        companyName: validated.data.companyName,
        address: validated.data.address,
        taxId: validated.data.taxId,
        invoiceTaxRate: validated.data.invoiceTaxRate,
        logoUrl: logoUrlPath || "",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    revalidatePath("/settings"); 
    
    return { status: "success", message: "Profil bisnis dan logo berhasil disimpan!" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Gagal menyimpan data." };
  }
}
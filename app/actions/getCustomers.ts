"use server"
import { prisma } from "@/app/lib/prisma";

export async function getCustomers(userEmail:string) {
    try {

        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });


    const customers = await prisma.customer.findMany({  
        where: { userId: user?.id },
        orderBy: { createdAt: "desc" }
    });
    return customers;
} catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
    }
}

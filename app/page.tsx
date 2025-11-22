import { getCustomers } from "@/app/actions/getCustomers";
import { Customer } from "@prisma/client";

export default async function Home() {
  const customers = await getCustomers("dev@saas.com");

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="grid gap-4">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Belum ada data pelanggan.
          </p>
        ) : (
          customers.map((customer: Customer) => (
            <div
              key={customer.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="font-semibold text-lg">{customer.name}</h2>
              <p className="text-gray-500 text-sm">{customer.email}</p>
              <p className="text-gray-400 text-xs mt-2">
                {customer.address || "Alamat belum diisi"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

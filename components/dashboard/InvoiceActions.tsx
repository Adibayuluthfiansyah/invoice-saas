"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  MoreVertical,
  Pencil,
  Trash,
  XCircle,
} from "lucide-react";
import {
  deleteInvoice,
  updateInvoiceStatus,
} from "@/app/actions/invoiceActions";
import { toast } from "sonner";
import { InvoiceStatus } from "@prisma/client";
import Link from "next/link";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    toast.promise(updateInvoiceStatus(invoiceId, newStatus), {
      loading: "Mengupdate status...",
      success: "Status berhasil diperbarui!",
      error: "Gagal mengupdate status",
    });
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menghapus invoice ini?"
    );
    if (!confirm) return;

    toast.promise(deleteInvoice(invoiceId), {
      loading: "Menghapus invoice...",
      success: "Invoice berhasil dihapus",
      error: "Gagal menghapus invoice",
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Tombol Cepat Ubah Status */}
      {status !== "PAID" && (
        <Button
          size="sm"
          variant="default"
          onClick={() => handleStatusUpdate("PAID")}
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Tandai Lunas
        </Button>
      )}

      {status === "PAID" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate("PENDING")}
        >
          <XCircle className="w-4 h-4 mr-2" /> Tandai Belum Lunas
        </Button>
      )}

      {/* Dropdown Menu Lainnya */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash className="w-4 h-4 mr-2" /> Hapus Invoice
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="cursor-pointer flex items-center"
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Invoice
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

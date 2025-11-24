"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  MoreVertical,
  Trash,
  XCircle,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  deleteInvoice,
  updateInvoiceStatus,
} from "@/app/actions/invoiceActions";
import { toast } from "sonner";
import { InvoiceStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    toast.promise(updateInvoiceStatus(invoiceId, newStatus), {
      loading: "Mengupdate status...",
      success: "Status berhasil diperbarui!",
      error: "Gagal mengupdate status",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus invoice...");

    const result = await deleteInvoice(invoiceId);

    if (result.success) {
      toast.success("Invoice berhasil dihapus", { id: toastId });
      setIsDeleteOpen(false); // Tutup dialog
      router.push("/invoices");
    } else {
      toast.error(result.message, { id: toastId });
      setIsDeleting(false); // Stop loading jika gagal
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Tombol Status */}
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

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/invoices/${invoiceId}/edit`}
                className="cursor-pointer flex items-center"
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Invoice
              </Link>
            </DropdownMenuItem>

            {/* Saat diklik, buka Dialog (jangan langsung hapus) */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault(); // Mencegah dropdown menutup otomatis yang bisa mengganggu dialog
                setIsDeleteOpen(true);
              }}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash className="w-4 h-4 mr-2" /> Hapus Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- DIALOG KONFIRMASI HAPUS --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Invoice?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus invoice ini secara permanen?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                "Hapus Invoice"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

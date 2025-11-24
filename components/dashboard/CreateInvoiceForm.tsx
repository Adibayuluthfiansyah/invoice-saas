"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency } from "@/lib/utils";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { useActionState, useState } from "react";
import { createInvoice, SubmissionState } from "@/app/actions/CreateInvoice";
import { format } from "date-fns";

interface UserProps {
  name: string | null;
  email: string;
  businessProfile: {
    address: string | null;
  } | null;
}

interface CreateInvoiceFormProps {
  user: UserProps;
  invoiceNumber: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

export function CreateInvoiceForm({
  user,
  invoiceNumber,
}: CreateInvoiceFormProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [items, setItems] = useState<InvoiceItem[]>(() => [
    { id: Date.now(), description: "", quantity: 1, rate: 0 },
  ]);

  const initialState: SubmissionState = { status: "success", message: "" };

  const [state, formAction] = useActionState(createInvoice, initialState);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];

    if (field === "description") {
      newItems[index] = { ...newItems[index], description: value as string };
    } else if (field === "quantity" || field === "rate") {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    }

    setItems(newItems);
  };

  const calculateTotal = items.reduce((acc, item) => {
    return acc + item.quantity * item.rate;
  }, 0);

  return (
    <form action={formAction}>
      {state?.status === "error" && state.message && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {state.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomor Invoice</Label>
                  <Input
                    name="invoiceName"
                    defaultValue={invoiceNumber}
                    placeholder="INV-001"
                  />
                  {state?.errors?.invoiceName && (
                    <p className="text-red-500 text-xs">
                      {state.errors.invoiceName[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="PENDING">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label>Tanggal Isu</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal w-full"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Pilih Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <input
                    type="hidden"
                    name="date"
                    value={selectedDate.toISOString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jatuh Tempo (Hari)</Label>
                  <Select name="dueDate" defaultValue="0">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Hari ini</SelectItem>
                      <SelectItem value="15">15 Hari</SelectItem>
                      <SelectItem value="30">30 Hari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ... DATA CLIENT ... */}
          <Card>
            <CardContent className="p-6 grid gap-4">
              <h3 className="font-semibold">Data Klien</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Klien</Label>
                  <Input name="clientName" placeholder="PT Maju Mundur" />
                  {state?.errors?.clientName && (
                    <p className="text-red-500 text-xs">
                      {state.errors.clientName[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email Klien</Label>
                  <Input
                    name="clientEmail"
                    placeholder="finance@klien.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat Klien</Label>
                <Textarea
                  name="clientAddress"
                  placeholder="Alamat lengkap..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ...  Item Tagihan ... */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Item Tagihan</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="col-span-6 space-y-2">
                      {index === 0 && <Label>Deskripsi</Label>}
                      <Input
                        name="itemDescription"
                        placeholder="Deskripsi item..."
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      {index === 0 && <Label>Qty</Label>}
                      <Input
                        name="itemQuantity"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      {index === 0 && <Label>Harga</Label>}
                      <Input
                        name="itemRate"
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-1 flex justify-end pb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ... Bagian Kanan (Total & Submit) ... */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-muted/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span>{formatCurrency(calculateTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Pajak (0%)</span>
                <span>Rp 0</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg underline decoration-primary decoration-4 underline-offset-4">
                  {formatCurrency(calculateTotal)}
                </span>
                <input type="hidden" name="total" value={calculateTotal} />
              </div>
            </CardContent>
          </Card>

          <input type="hidden" name="fromName" value={user.name || ""} />
          <input type="hidden" name="fromEmail" value={user.email} />
          <input
            type="hidden"
            name="fromAddress"
            value={user.businessProfile?.address || ""}
          />
          <input type="hidden" name="currency" value="IDR" />

          <Button className="w-full" size="lg" type="submit">
            Simpan Invoice
          </Button>
        </div>
      </div>
    </form>
  );
}

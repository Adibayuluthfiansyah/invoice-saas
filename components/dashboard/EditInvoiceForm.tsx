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
import { CalendarIcon, Plus, Trash, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { updateInvoice } from "@/app/actions/updateInvoice";
import { SubmissionState } from "@/app/actions/CreateInvoice";
import { format, differenceInDays } from "date-fns";
import { Invoice, InvoiceItem, Customer } from "@prisma/client";

// Tipe data gabungan untuk props
type InvoiceData = Invoice & {
  items: InvoiceItem[];
  customer: Customer;
};

interface EditInvoiceFormProps {
  invoice: InvoiceData;
}

export function EditInvoiceForm({ invoice }: EditInvoiceFormProps) {
  const [selectedDate, setSelectedDate] = useState(new Date(invoice.issueDate));

  const daysDiff = differenceInDays(
    new Date(invoice.dueDate),
    new Date(invoice.issueDate)
  );

  const [items, setItems] = useState(() =>
    invoice.items.map((item) => ({
      id: Math.random(),
      description: item.description,
      quantity: item.quantity,
      rate: item.unitPrice,
    }))
  );

  const initialState: SubmissionState = { status: "success", message: "" };
  const [state, formAction] = useActionState(updateInvoice, initialState);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...items];
    // @ts-expect-error: Dynamic key assignment type safety
    newItems[index][field] = field === "description" ? value : Number(value);
    setItems(newItems);
  };

  const calculateTotal = items.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={invoice.id} />
      <input type="hidden" name="fromName" value="My Company" />{" "}
      <input type="hidden" name="fromEmail" value="email@company.com" />
      <input type="hidden" name="fromAddress" value="Alamat..." />
      <input type="hidden" name="currency" value="IDR" />
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
                    defaultValue={invoice.invoiceNumber}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={invoice.status}>
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
                  <Select name="dueDate" defaultValue={daysDiff.toString()}>
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

          <Card>
            <CardContent className="p-6 grid gap-4">
              <h3 className="font-semibold">Data Klien</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Klien</Label>
                  <Input
                    name="clientName"
                    defaultValue={invoice.customer.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Klien</Label>
                  <Input
                    name="clientEmail"
                    type="email"
                    defaultValue={invoice.customer.email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat Klien</Label>
                <Textarea
                  name="clientAddress"
                  defaultValue={invoice.customer.address || ""}
                />
              </div>
            </CardContent>
          </Card>

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
                      <Label className={index !== 0 ? "sr-only" : ""}>
                        Deskripsi
                      </Label>
                      <Input
                        name="itemDescription"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className={index !== 0 ? "sr-only" : ""}>
                        Qty
                      </Label>
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
                      <Label className={index !== 0 ? "sr-only" : ""}>
                        Harga
                      </Label>
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
                        className="text-red-500"
                        onClick={() => handleRemoveItem(index)}
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

        <div className="md:col-span-1 space-y-4">
          <Card className="bg-muted/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span>{formatCurrency(calculateTotal)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-primary">
                  {formatCurrency(calculateTotal)}
                </span>
                <input type="hidden" name="total" value={calculateTotal} />
              </div>
            </CardContent>
          </Card>
          <Button className="w-full" size="lg" type="submit">
            <Save className="w-4 h-4 mr-2" /> Update Invoice
          </Button>
        </div>
      </div>
    </form>
  );
}

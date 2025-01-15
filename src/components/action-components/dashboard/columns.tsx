"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Invoice } from "@/model/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import CreatorsAction from "./creators-action";
import CancelInvoice from "./cancel-payment";
import ReleaseInvoice from "./release-invoice";
import RefundPayer from "./refund-payer";
import { timeLeft } from "@/utils";
import generateSecureLink from "@/lib/generate-link";

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice id
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="bold">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Time Created ",
    cell: ({ row }) => <div className="bold">{row.getValue("createdAt")}</div>,
  },
  {
    accessorKey: "paidAt",
    header: "Time Left",
    cell: ({ row }) => {
      const paidAtTimestamp = row.getValue("paidAt");
      const payment = row.original;
      return (
        <div className="bold">
          {payment?.status === "ACCEPTED" || payment?.status === "REJECTED"
            ? "Action Taken"
            : timeLeft(paidAtTimestamp)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.getValue("price") + " POL"}
        </div>
      );
    },
  },
  {
    accessorKey: "amountPaid",
    header: () => <div className="text-right">Paid Amount</div>,
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="text-right font-medium">
          {payment.amountPaid
            ? row.getValue("amountPaid") + " POL"
            : "Not paid"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {payment.type === "Creator" && (
              <>
                <DropdownMenuItem
                  onClick={async () => {
                    const domain =
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "";
                    const encodedEncryptedData = generateSecureLink(payment);
                    navigator.clipboard.writeText(
                      `${domain}/pay/?data=${encodedEncryptedData}`
                    );
                    toast.success("Copied");
                  }}
                >
                  Copy payment URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {payment?.status === "PAID" && payment.type === "Creator" && (
              <>
                <DropdownMenuItem>
                  <CreatorsAction
                    invoiceId={payment.id}
                    state={true}
                    text="Accept Payment"
                    key="0"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreatorsAction
                    invoiceId={payment.id}
                    state={false}
                    text="Reject Payment"
                    key="1"
                  />
                </DropdownMenuItem>
              </>
            )}
            {payment?.status === "CREATED" && (
              <DropdownMenuItem>
                <CancelInvoice invoiceId={payment.id} />
              </DropdownMenuItem>
            )}

            {payment?.status === "ACCEPTED" && payment.type === "Creator" && (
              <DropdownMenuItem>
                <ReleaseInvoice invoiceId={payment.id} />
              </DropdownMenuItem>
            )}
            {payment?.status !== "REFUNDED" &&
              payment?.status !== "REJECTED" &&
              payment?.type === "Payer" && (
                <DropdownMenuItem>
                  <RefundPayer
                    invoiceId={payment.id}
                    timeStamp={payment.paidAt}
                  />
                </DropdownMenuItem>
              )}
            {payment?.status === "REFUNDED" ||
              (payment?.status === "REJECTED" && payment?.type === "Payer" && (
                <DropdownMenuItem>
                  <Button className="w-full">All Settled</Button>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default columns;

"use client";
import { useContext } from "react";
import columns from "./columns";
import DataTable from "./data-table";
import { ContractContext } from "@/context/contract-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
// const data = [
//   {
//     id: "1",
//     date: "2025-01-01",
//     customer: "John Doe",
//     email: "john@example.com",
//     status: "processing",
//     price: 500.0,
//   },
//   {
//     id: "2",
//     date: "2025-01-03",
//     customer: "Jane Smith",
//     email: "jane@example.com",
//     status: "Pending",
//     price: 350.0,
//   },
//   {
//     id: "3",
//     date: "2025-01-05",
//     customer: "James Brown",
//     email: "james@example.com",
//     status: "success",
//     price: 150.0,
//   },
//   {
//     id: "4",
//     date: "2025-01-06",
//     customer: "Alice Johnson",
//     email: "alice@example.com",
//     status: "failed",
//     price: 600.0,
//   },
//   {
//     id: "5",
//     date: "2025-01-07",
//     customer: "Bob Lee",
//     email: "bob@example.com",
//     status: "Paid",
//     price: 450.0,
//   },
//   {
//     id: "6",
//     date: "2025-01-10",
//     customer: "Charlie Brown",
//     email: "charlie@example.com",
//     status: "Pending",
//     price: 200.0,
//   },
//   {
//     id: "7",
//     date: "2025-01-12",
//     customer: "David Green",
//     email: "david@example.com",
//     status: "processing",
//     price: 120.0,
//   },
//   {
//     id: "8",
//     date: "2025-01-14",
//     customer: "Emily White",
//     email: "emily@example.com",
//     status: "Paid",
//     price: 700.0,
//   },
//   {
//     id: "9",
//     date: "2025-01-15",
//     customer: "Frank Black",
//     email: "frank@example.com",
//     status: "failed",
//     price: 100.0,
//   },
//   {
//     id: "10",
//     date: "2025-01-17",
//     customer: "Grace Purple",
//     email: "grace@example.com",
//     status: "success",
//     price: 250.0,
//   },
//   {
//     id: "11",
//     date: "2025-01-18",
//     customer: "Henry Blue",
//     email: "henry@example.com",
//     status: "Paid",
//     price: 500.0,
//   },
// ];

const RecentPayment = () => {
  const { invoiceData } = useContext(ContractContext);
  const filteredCreatedInvoices = invoiceData.filter(
    (invoice) => invoice.type === "Creator"
  );
  const filteredPaidInvoices = invoiceData.filter(
    (invoice) => invoice.type === "Payer"
  );
  return (
    <div className="container mx-auto">
      <Tabs defaultValue="creator">
        <TabsList>
          <TabsTrigger value="creator">Created Invoice</TabsTrigger>
          <TabsTrigger value="payer">Paid Invoice</TabsTrigger>
        </TabsList>
        <TabsContent value="creator">
          <DataTable columns={columns} data={filteredCreatedInvoices} />
        </TabsContent>
        <TabsContent value="payer">
          <DataTable columns={columns} data={filteredPaidInvoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentPayment;

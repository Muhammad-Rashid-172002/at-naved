import type { Metadata } from "next";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return <CustomersTable />;
}

export type Invoice = {
  id: string;
  amountPaid?: string | null;
  createdAt?: string | null;
  paidAt?: string;
  price?: string | null;
  status?: string;
  type?: "Payer" | "Creator";
};

export interface UserCreatedInvoice extends Invoice {
  type?: "Creator";
}

export interface UserPaidInvoice extends Invoice {
  type?: "Payer";
}

export type PaymentCardProps = {
  data: { id: string; price: string; status: string };
};

export type ErrorMessages = {
  [key: string]: string;
};

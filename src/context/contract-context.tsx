import { Invoice } from "@/model/model";
import React from "react";
import { Address } from "viem";

export interface ContractContextData {
  isLoading: string | undefined;
  invoiceData: Invoice[];
  createInvoice: (invoicePrice: bigint) => Promise<boolean>;
  makeInvoicePayment: (amount: bigint, invoiceId: bigint) => Promise<boolean>;
  creatorsAction: (invoiceId: bigint, state: boolean) => Promise<boolean>;
  cancelInvoice: (invoiceId: bigint) => Promise<boolean>;
  releaseInvoice: (invoiceId: bigint) => Promise<boolean>;
  refundPayerAfterWindow: (invoiceId: bigint) => Promise<boolean>;
  setFeeReceiversAddress: (address: Address) => Promise<boolean>;
  setInvoiceHoldPeriod: (
    invoiceId: bigint,
    holdPeriod: number
  ) => Promise<boolean>;
  setDefaultHoldPeriod: (newDefaultHoldPeriod: bigint) => Promise<boolean>;
  setFee: (newFee: bigint) => Promise<boolean>;
  withdrawFees: () => Promise<boolean>;
  refetchInvoiceData?: () => Promise<void>;
}
export const contractContextDefaults: ContractContextData = {
  isLoading: undefined,
  invoiceData: [],
  createInvoice: async () => Promise.resolve(false),
  makeInvoicePayment: async () => Promise.resolve(false),
  creatorsAction: async () => Promise.resolve(false),
  cancelInvoice: async () => Promise.resolve(false),
  releaseInvoice: async () => Promise.resolve(false),
  refundPayerAfterWindow: async () => Promise.resolve(false),
  setFeeReceiversAddress: async () => Promise.resolve(false),
  setInvoiceHoldPeriod: async () => Promise.resolve(false),
  setDefaultHoldPeriod: async () => Promise.resolve(false),
  setFee: async () => Promise.resolve(false),
  withdrawFees: async () => Promise.resolve(false),
  refetchInvoiceData: async () => Promise.resolve(),
};
export const ContractContext = React.createContext<ContractContextData>(
  contractContextDefaults
);

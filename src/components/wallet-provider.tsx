/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { formatEther } from "ethers";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PaymentProcessor__factory } from "@/typechain";
import { Address, encodeFunctionData } from "viem";
import { createClient } from "urql";
import { ContractContext } from "@/context/contract-context";
import {
  INVOICE_ADDRESS,
  POLYGON_AMOY,
  THE_GRAPH_API_URL,
  errorMessages,
} from "@/constants";
import { UserCreatedInvoice, Invoice, UserPaidInvoice } from "@/model/model";
import { polygonAmoy } from "viem/chains";

type Props = {
  children?: ReactNode;
};
const client = (chainId: number) =>
  createClient({
    url: THE_GRAPH_API_URL[chainId],
  });
const invoiceQuery = `query ($address: String!) {
    user (id: $address) {
      createdInvoices {
        amountPaid
        createdAt
        id
        paidAt
        price
        status
      }
      paidInvoices {
        amountPaid
        createdAt
        id
        paidAt
        price
        status
      }
  }
}`;

const WalletProvider = ({ children }: Props) => {
  const { chain, address } = useAccount();
  const chainId = !chain ? POLYGON_AMOY : chain?.id;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState<string>();
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);

  useEffect(() => {
    const onAddress = async () => {
      await getInvoiceData();
    };
    if (!address || !chain) {
      setInvoiceData([]);
    } else {
      onAddress();
    }
  }, [address, chain]);

  const getError = (error: any) => {
    if (
      error.message.includes("user rejected transaction") ||
      error.message.includes("User denied transaction.")
    ) {
      return;
    }
    const errorData = error.error?.data || error?.data;

    if (errorData) {
      for (const [errorCode, message] of Object.entries(errorMessages)) {
        if (errorData.includes(errorCode)) {
          toast.error(message);
          return;
        }
      }
    }

    const message = error?.data?.message || error?.error?.data?.message;
    toast.error(message || "Something went wrong");
  };

  const getInvoiceData = async () => {
    try {
      const { data, error } = await client(chainId)
        .query(invoiceQuery, { address: address?.toLowerCase() })
        .toPromise();

      if (error) {
        console.log(error.message);
      }

      const createdInvoice: UserCreatedInvoice[] =
        data?.user?.createdInvoices || [];
      const paidInvoices: UserPaidInvoice[] = data?.user?.paidInvoices || [];

      const createdInvoiceData: UserCreatedInvoice[] = createdInvoice.map(
        (invoice: any) => ({
          id: invoice?.id,
          createdAt: invoice.createdAt
            ? new Date(invoice.createdAt * 1000).toDateString()
            : null,
          paidAt: invoice.paidAt || "Not Paid",
          status: invoice.status || "Unknown",
          price: invoice.price ? formatEther(invoice.price) : null,
          amountPaid: invoice.amountPaid
            ? formatEther(invoice.amountPaid)
            : null,
          type: "Creator",
        })
      );

      const paidInvoiceData: UserPaidInvoice[] = paidInvoices.map(
        (invoice: any) => ({
          id: invoice.id,
          createdAt: invoice.createdAt
            ? new Date(invoice.createdAt * 1000).toDateString()
            : null,
          paidAt: invoice.paidAt || "Not Paid",
          status: invoice.status || "Unknown",
          price: invoice.price ? formatEther(invoice.price) : null,
          amountPaid: invoice.amountPaid
            ? formatEther(invoice.amountPaid)
            : null,
          type: "Payer",
        })
      );

      const allInvoiceData: (UserCreatedInvoice | UserPaidInvoice)[] = [
        ...createdInvoiceData,
        ...paidInvoiceData,
      ];

      setInvoiceData(allInvoiceData || []);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  const createInvoice = async (invoicePrice: bigint): Promise<boolean> => {
    setIsLoading("createInvoice");

    let success = false;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "createInvoice",
          args: [invoicePrice],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);
      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "createInvoice",
          args: [invoicePrice],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.success("Invoice successfully created");
        await getInvoiceData();
        success = true;
      } else {
        toast.error("Error creating invoice, Please try again.");
      }
    } catch (error) {
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const makeInvoicePayment = async (
    amount: bigint,
    invoiceId: bigint
  ): Promise<boolean> => {
    setIsLoading("makeInvoicePayment");

    let success = false;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "makeInvoicePayment",
          args: [invoiceId],
        }),
        value: amount,
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);
      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "makeInvoicePayment",
          args: [invoiceId],
        }),
        value: amount,
        gas: gasWithBuffer,
        gasPrice,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });

      if (receipt?.status === "success") {
        toast.success("Invoice Payment Successful");
        success = true;
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } catch (error) {
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const creatorsAction = async (
    invoiceId: bigint,
    state: boolean
  ): Promise<boolean> => {
    const action = state ? "accepted" : "rejected";

    setIsLoading(action);
    let success = false;
    let progressToastId;

    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "creatorsAction",
          args: [invoiceId, state],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "creatorsAction",
          args: [invoiceId, state],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });

      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success(`Successfully ${action} the invoice.`);
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("something went wrong, Please try again.");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const cancelInvoice = async (invoiceId: bigint): Promise<boolean> => {
    setIsLoading("cancelInvoice");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "cancelInvoice",
          args: [invoiceId],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "cancelInvoice",
          args: [invoiceId],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Invoice successfully cancelled");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("something went wrong, Please try again.");
      }
    } catch (error) {
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const releaseInvoice = async (invoiceId: bigint): Promise<boolean> => {
    setIsLoading("releaseInvoice");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "releaseInvoice",
          args: [invoiceId],
        }),
      });
      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);
      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "releaseInvoice",
          args: [invoiceId],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Invoice successfully released");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("something went wrong, Please try again.");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const refundPayerAfterWindow = async (
    invoiceId: bigint
  ): Promise<boolean> => {
    setIsLoading("refundPayerAfterWindow");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "refundPayerAfterWindow",
          args: [invoiceId],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);

      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "refundPayerAfterWindow",
          args: [invoiceId],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Refund to payer successfully processed");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("An unexpected error occurred during refund.");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const setFeeReceiversAddress = async (address: Address): Promise<boolean> => {
    setIsLoading("setFeeReceiversAddress");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setFeeReceiversAddress",
          args: [address],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);
      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setFeeReceiversAddress",
          args: [address],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });

      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Fee receiver address updated successfully");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("Failed to update fee receiver address. Please try again.");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const setInvoiceHoldPeriod = async (
    invoiceId: bigint,
    holdPeriod: number
  ): Promise<boolean> => {
    setIsLoading("setInvoiceHoldPeriod");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setInvoiceHoldPeriod",
          args: [invoiceId, holdPeriod],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);
      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setInvoiceHoldPeriod",
          args: [invoiceId, holdPeriod],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });

      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Invoice hold period successfully set");
        await getInvoiceData();
        success = true;
      } else {
        toast.error("Failed to set invoice hold period. Please try again");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const setDefaultHoldPeriod = async (
    newDefaultHoldPeriod: bigint
  ): Promise<boolean> => {
    setIsLoading("setDefaultHoldPeriod");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setDefaultHoldPeriod",
          args: [newDefaultHoldPeriod],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);
      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);

      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setDefaultHoldPeriod",
          args: [newDefaultHoldPeriod],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Successfully set new default hold period");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("Failed to set new default hold period. Please try again");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const setFee = async (newFee: bigint): Promise<boolean> => {
    setIsLoading("setFee");

    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setFee",
          args: [newFee],
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);
      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);
      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "setFee",
          args: [newFee],
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });

      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Successfully set new fee");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("Failed to set new fee. Please try again");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  const withdrawFees = async (): Promise<boolean> => {
    setIsLoading("withdrawFees");
    let success = false;
    let progressToastId;
    try {
      const estimatedGas = await publicClient?.estimateGas({
        account: walletClient?.account,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "withdrawFees",
        }),
      });

      let gasPrice = await publicClient?.getGasPrice();
      gasPrice = (gasPrice! * BigInt(300)) / BigInt(100);
      const gasWithBuffer = (estimatedGas! * BigInt(500)) / BigInt(100);
      const tx = await walletClient?.sendTransaction({
        chain: polygonAmoy,
        to: INVOICE_ADDRESS[chainId],
        data: encodeFunctionData({
          abi: PaymentProcessor__factory.abi,
          functionName: "withdrawFees",
        }),
        gas: gasWithBuffer,
        gasPrice,
      });

      progressToastId = toast.info("Transaction in progress...", {
        duration: Infinity,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx!,
      });
      if (receipt?.status) {
        toast.dismiss(progressToastId);
        toast.success("Successfully withdraw fees");
        await getInvoiceData();
        success = true;
      } else {
        toast.dismiss(progressToastId);
        toast.error("Failed to set new fee. Please try again");
      }
    } catch (error) {
      toast.dismiss(progressToastId);
      getError(error);
    }
    setIsLoading("");
    return success;
  };

  return (
    <ContractContext.Provider
      value={{
        isLoading,
        invoiceData,
        createInvoice,
        makeInvoicePayment,
        creatorsAction,
        cancelInvoice,
        releaseInvoice,
        refundPayerAfterWindow,
        setFeeReceiversAddress,
        setInvoiceHoldPeriod,
        setDefaultHoldPeriod,
        setFee,
        withdrawFees,
        refetchInvoiceData: async () => {
          await getInvoiceData();
        },
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
export default WalletProvider;

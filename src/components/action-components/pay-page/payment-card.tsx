"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useGetFee } from "@/hooks/useGetFee";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractContext } from "@/context/contract-context";
import { Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { PaymentCardProps } from "@/model/model";
import { formatEther, parseEther } from "viem";
import { toast } from "sonner";

const PaymentCard = ({ data }: PaymentCardProps) => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: fees } = useGetFee();
  const [amount, setAmount] = useState("");
  const { makeInvoicePayment, isLoading } = useContext(ContractContext);

  const formatedFee = fees ? formatEther(fees) : "0";
  const isAmountValid =
    parseFloat(amount) > parseFloat(formatedFee) &&
    parseFloat(amount) <= parseFloat(data?.price || "0");

  const handleClick = async () => {
    toast.info("Transaction in progress... Please wait");
    const invoiceID = BigInt(data?.id);
    const amountInWei = parseEther(amount);
    const success = await makeInvoicePayment(amountInWei, invoiceID);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Pay invoice </CardTitle>
        <CardDescription>Make your invoice payment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="id">Invoice ID</Label>
            <Input id="id" placeholder={`${data?.id || "N/A"}`} disabled />
          </div>

          <div className="flex flex-col space-y-2 mt-3">
            <Label htmlFor="price">Request Amount</Label>
            <Input
              id="price"
              placeholder={`${data?.price || "N/A"} POL`}
              disabled
            />
          </div>

          <div className="flex flex-col space-y-4 mt-3">
            <Label htmlFor="amount">Payer Amount</Label>
            <Input
              id="amount"
              value={amount}
              placeholder={`amount > ${formatedFee} and ≤ ${
                data?.price || "N/A"
              }`}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={data?.status !== "CREATED"}
            />
            <p className="text-sm text-red-400">
              *Invoice creator cannot make this payment, Additional fee of{" "}
              {formatedFee} POL applies excluding gas fee*
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex">
        {address ? (
          <Button
            onClick={handleClick}
            className="w-full"
            disabled={!isAmountValid || data?.status !== "CREATED"}
          >
            {isLoading === "makeInvoicePayment" ? (
              <>
                <p>processing...</p>
                <Loader2
                  className="inline-flex animate-spin"
                  size={10}
                  color="#cee7d6"
                />
              </>
            ) : data?.status === "CREATED" ? (
              "Make Payment"
            ) : (
              `This Invoice is ${data?.status}`
            )}
          </Button>
        ) : (
          <ConnectKitButton mode="dark" />
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;

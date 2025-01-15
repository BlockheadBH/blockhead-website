"use client";
import { useContext, useState } from "react";
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
import { parseEther } from "ethers";
import { useAccount } from "wagmi";
import { useGetOwner } from "@/hooks/useGetOwner";
import { Address } from "viem";
import { toast } from "sonner";

const AdminCard = () => {
  const { address } = useAccount();
  const { data: allowedAddress } = useGetOwner();

  const [receiverAdd, setReceiverAdd] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [holdPeriod, setHoldPeriod] = useState("");
  const [defaultPeriod, setDefaultPeriod] = useState("");
  const [blockHeadFee, setBlockHeadFee] = useState("");

  const {
    setFeeReceiversAddress,
    setInvoiceHoldPeriod,
    setDefaultHoldPeriod,
    setFee,
    isLoading,
  } = useContext(ContractContext);

  const handleReceiverAdd = async () => {
    toast.info("Transaction in progress... Please wait");
    await setFeeReceiversAddress(receiverAdd as Address);
  };

  const handleInvoiceHoldPeriod = async () => {
    toast.info("Transaction in progress... Please wait");
    const invoiceIdBigNumber = BigInt(invoiceId);
    const holdPeriodInSecond = Number(holdPeriod) * 24 * 60 * 60;
    await setInvoiceHoldPeriod(invoiceIdBigNumber, holdPeriodInSecond);
  };

  const handleDefaultPeriod = async () => {
    toast.info("Transaction in progress... Please wait");
    const defaultPeriodInSecond = BigInt(Number(defaultPeriod) * 24 * 60 * 60);
    await setDefaultHoldPeriod(defaultPeriodInSecond);
  };

  const handleBlockHeadFee = async () => {
    toast.info("Transaction in progress... Please wait");
    const blockHeadFeeInWei = parseEther(blockHeadFee);
    await setFee(blockHeadFeeInWei);
  };

  if (address !== allowedAddress) {
    return (
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are not authorized to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Admin Page</CardTitle>
        <CardDescription>
          *Only permitted address are allowed to see this page*
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="my-3 space-y-1.5">
            <Label htmlFor="setFeeAdd">Set Fee receivers address</Label>
            <div className="flex flex-col-2 gap-2">
              <Input
                id="setFeeAdd"
                placeholder="0xxxxxxxx"
                value={receiverAdd}
                onChange={(e) => setReceiverAdd(e.target.value)}
              />
              <Button onClick={handleReceiverAdd}>
                {isLoading === "setFeeReceiversAddress" ? (
                  <Loader2
                    className="inline-flex animate-spin"
                    size={10}
                    color="#cee7d6"
                  />
                ) : (
                  "Deploy"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Updates the address of the fee receiver.
            </p>
          </div>

          <div className="my-3 space-y-1.5">
            <Label htmlFor="holdPeriodID">Invoice Hold period</Label>
            <div className="flex flex-col-2 gap-2">
              <Input
                id="holdPeriodID"
                placeholder="Invoice Id"
                type="number"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
              />
              <Input
                id="invoicePeriod"
                placeholder="in (Days) ..."
                type="number"
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(e.target.value)}
              />
              <Button onClick={handleInvoiceHoldPeriod}>
                {isLoading === "setInvoiceHoldPeriod" ? (
                  <Loader2
                    className="inline-flex animate-spin"
                    size={10}
                    color="#cee7d6"
                  />
                ) : (
                  "Deploy"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sets a custom hold period for a specific invoice.
            </p>
          </div>

          <div className="my-3 space-y-1.5">
            <Label htmlFor="defaulthold">Default Hold Period</Label>
            <div className="flex flex-col-2 gap-2">
              <Input
                id="defaulthold"
                type="number"
                placeholder="in (Days) ..."
                value={defaultPeriod}
                onChange={(e) => setDefaultPeriod(e.target.value)}
              />
              <Button onClick={handleDefaultPeriod}>
                {" "}
                {isLoading === "setDefaultHoldPeriod" ? (
                  <Loader2
                    className="inline-flex animate-spin"
                    size={10}
                    color="#cee7d6"
                  />
                ) : (
                  "Deploy"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Updates the default hold period for all new invoices.
            </p>
          </div>

          <div className="my-3 space-y-1.5">
            <Label htmlFor="setFee">Set Fee</Label>
            <div className="flex flex-col-2 gap-2">
              <Input
                id="setFee"
                type="number"
                placeholder="amount of fee in POL"
                value={blockHeadFee}
                onChange={(e) => setBlockHeadFee(e.target.value)}
              />
              <Button onClick={handleBlockHeadFee}>
                {isLoading === "setFee" ? (
                  <Loader2
                    className="inline-flex animate-spin"
                    size={10}
                    color="#cee7d6"
                  />
                ) : (
                  "Deploy"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Updates the fee for using Blockhead service.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button> */}
      </CardFooter>
    </Card>
  );
};

export default AdminCard;

"use client";
import { useContext } from "react";
import { ContractContext } from "@/context/contract-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CancelInvoice = ({ invoiceId }: { invoiceId: string }) => {
  const { cancelInvoice, isLoading } = useContext(ContractContext);

  const handleClick = async () => {
    toast.info("Transaction in progress... Please wait");
    await cancelInvoice(BigInt(invoiceId));
  };

  return (
    <>
      <Button variant="destructive" onClick={handleClick} className="w-full">
        {isLoading ? (
          <>
            <Loader2
              className="inline-flex animate-spin"
              size={10}
              color="#cee7d6"
            />
          </>
        ) : (
          "Cancel Invoice"
        )}
      </Button>
    </>
  );
};
export default CancelInvoice;

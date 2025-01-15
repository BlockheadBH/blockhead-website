"use client";
import { useContext } from "react";
import { ContractContext } from "@/context/contract-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ReleaseInvoice = ({ invoiceId }: { invoiceId: string }) => {
  const { releaseInvoice, isLoading } = useContext(ContractContext);

  const handleClick = async () => {
    toast.info("Transaction in progress... Please wait");
    await releaseInvoice(BigInt(invoiceId));
  };

  return (
    <>
      <Button onClick={handleClick} className="w-full">
        {isLoading ? (
          <>
            <p>processing...</p>
            <Loader2 className="animate-spin" size={10} color="#cee7d6" />
          </>
        ) : (
          "Release Payment"
        )}
      </Button>
    </>
  );
};
export default ReleaseInvoice;

import { INVOICE_ADDRESS } from "@/constants";
import { PaymentProcessor__factory } from "@/typechain";
import { polygonAmoy } from "wagmi/chains";
import { useAccount, useChainId, useReadContract } from "wagmi";

export const useGetOwner = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data, refetch, isLoading } = useReadContract({
    abi: PaymentProcessor__factory.abi,
    chainId: polygonAmoy.id,
    address: INVOICE_ADDRESS[chainId],
    functionName: "owner",
    account: address,
  });

  return { data, refetch, isLoading };
};


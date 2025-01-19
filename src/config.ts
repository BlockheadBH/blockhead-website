import { createConfig, http, fallback } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { polygonAmoy } from "wagmi/chains";

const apiKey = process.env.NEXT_PUBLIC_INFURA_ID;
const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const config = createConfig(
  getDefaultConfig({
    chains: [polygonAmoy],
    transports: {
      [polygonAmoy.id]: fallback([
        http(`https://polygon-amoy.infura.io/v3/${apiKey}`),
      ]),
    },
    appName: "BlockHead Invoice",
    walletConnectProjectId: "42cba5131fe1c9722463e9113837bb9a",
    ssr: true,
  })
);
export default config;

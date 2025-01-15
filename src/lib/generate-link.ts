import { Invoice } from "@/model/model";
import CryptoJS from "crypto-js";

const generateSecureLink = (payment: Invoice | undefined) => {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
  if (!secretKey) {
    return;
  }

  if (!payment || !payment.id || !payment.price || !payment.status) {
    return;
  }

  if (payment) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify({
          id: payment.id,
          price: payment.price,
          status: payment.status,
        }),
        secretKey
      ).toString();

      const encodedEncryptedData = encodeURIComponent(encrypted);

      return encodedEncryptedData;
    } catch (error) {
      console.log("Error generating secure link:", error);
      return null;
    }
  }
};

export default generateSecureLink;

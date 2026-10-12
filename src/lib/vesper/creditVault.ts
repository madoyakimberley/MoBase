import CryptoJS from "crypto-js";
import { vesperDb } from "./vesperLocalDb";

const LOCAL_SECRET = "mobase_vesper_local_vault_key_2026";
const DEFAULT_CREDITS = 1000;

export async function getOrInitializeCredits(): Promise<number> {
  if (typeof window === "undefined") return DEFAULT_CREDITS;

  let profile = await vesperDb.profiles.get("local_dev");

  if (!profile) {
    const encrypted = CryptoJS.AES.encrypt(
      DEFAULT_CREDITS.toString(),
      LOCAL_SECRET,
    ).toString();

    profile = {
      id: "local_dev",
      encryptedCredits: encrypted,
      salt: "mobase_salt",
      updatedAt: new Date().toISOString(),
    };

    await vesperDb.profiles.put(profile);
    return DEFAULT_CREDITS;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(profile.encryptedCredits, LOCAL_SECRET);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    const balance = parseInt(decryptedStr, 10);
    return isNaN(balance) ? 0 : balance;
  } catch {
    return 0;
  }
}

export async function deductCredits(cost: number = 10): Promise<number> {
  const currentBalance = await getOrInitializeCredits();

  if (currentBalance < cost) {
    throw new Error(`Insufficient local credits. Available: ${currentBalance}`);
  }

  const newBalance = currentBalance - cost;
  const encrypted = CryptoJS.AES.encrypt(
    newBalance.toString(),
    LOCAL_SECRET,
  ).toString();

  await vesperDb.profiles.update("local_dev", {
    encryptedCredits: encrypted,
    updatedAt: new Date().toISOString(),
  });

  return newBalance;
}

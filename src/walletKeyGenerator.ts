import Elliptic from "elliptic";
export const { ec: ECDSA } = Elliptic;
// Initialize with the elliptic-curve
export const Secp256k1CurveECDSAKeyGenerator = new ECDSA("secp256k1");

export type KeyPair = Elliptic.ec.KeyPair;

export function generateECDSAKey() {
  const keyPair = Secp256k1CurveECDSAKeyGenerator.genKeyPair();
  const publicKey = keyPair.getPublic("hex");
  const privateKey = keyPair.getPrivate("hex");

  return { keyPair, publicKey, privateKey };
}

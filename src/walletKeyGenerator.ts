import Elliptic from "elliptic";
const { ec: ECDSA } = Elliptic;
// Initialize with the elliptic-curve
const ecdsaKeyGenerator = new ECDSA("secp256k1");

export function generateECDSAKey() {
  const key = ecdsaKeyGenerator.genKeyPair();
  const publicKey = key.getPublic("hex");
  const privateKey = key.getPrivate("hex");

  return { key, publicKey, privateKey };
}

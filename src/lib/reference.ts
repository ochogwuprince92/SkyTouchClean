export function generateReference(serviceType: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const serviceCode = serviceType === "laundry" ? "LAU" : serviceType === "cleaning" ? "CLA" : "FUM";
  return `STC-${serviceCode}-${random}`;
}

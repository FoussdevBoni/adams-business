export const shopName = 'Adam’s Business';
export const whatsappNumber = '2290194717113';
export const whatsappGroup =
  'https://chat.whatsapp.com/DFNxjCWjZc027o2zmEVMn6?s=cl&p=a&mlu=4&ilr=4';

export function whatsappLink(message?: string) {
  const url = `https://wa.me/${whatsappNumber}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

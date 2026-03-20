export function encodeWhatsApp(phone: string, message: string): string {
  // Remove non-digits, ensure country code
  const cleaned = phone.replace(/\D/g, '');
  const withCountry = cleaned.startsWith('92') ? cleaned : `92${cleaned.replace(/^0/, '')}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${withCountry}?text=${encoded}`;
}

export function udhaarReminderMessage(
  customerName: string,
  balance: number,
  shopName: string
): string {
  return `السلام علیکم ${customerName} بھائی،
آپ کا بقایا: Rs ${balance.toLocaleString('en-PK')}
براہ کرم جلد ادائیگی کریں۔
شکریہ — ${shopName}`;
}

export function restaurantDailyMessage(
  restaurantName: string,
  kg: number,
  ratePerKg: number,
  todayAmount: number,
  totalBalance: number,
  shopName: string
): string {
  return `${restaurantName} صاحب،
آج کی خریداری: ${kg} کلو @ Rs ${ratePerKg}/kg
آج کا حساب: Rs ${todayAmount.toLocaleString('en-PK')}
کل بقایا: Rs ${totalBalance.toLocaleString('en-PK')}
— ${shopName}`;
}

export function restaurantMonthlyMessage(
  restaurantName: string,
  month: string,
  totalKg: number,
  totalAmount: number,
  paid: number,
  balance: number
): string {
  return `${restaurantName} — ماہانہ حساب
مہینہ: ${month}
کل خریداری: ${totalKg} کلو
کل رقم: Rs ${totalAmount.toLocaleString('en-PK')}
ادائیگی: Rs ${paid.toLocaleString('en-PK')}
بقایا: Rs ${balance.toLocaleString('en-PK')}`;
}

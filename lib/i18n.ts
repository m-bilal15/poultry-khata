export type Lang = 'ur' | 'en';

export const t = {
  // Nav
  home:        { ur: 'ہوم',        en: 'Home' },
  khata:       { ur: 'خاتہ',       en: 'Khata' },
  udhaar:      { ur: 'ادھار',      en: 'Udhaar' },
  restaurants: { ur: 'ریسٹورنٹ',  en: 'Restaurants' },
  reports:     { ur: 'رپورٹ',      en: 'Reports' },

  // Brand
  brandName:   { ur: 'صفدر اینڈ سنز', en: 'Safdar & Sons' },
  brandSub:    { ur: 'Poultry Traders — Lahore', en: 'Poultry Traders — Lahore' },

  // Dashboard
  todayProfit:     { ur: 'آج کا خالص منافع',      en: "Today's Net Profit" },
  allShopsCombined:{ ur: 'تمام دکانوں کا مجموعہ',  en: 'All shops combined' },
  totalUdhaarDue:  { ur: 'کل ادھار بقایا',          en: 'Total Udhaar Due' },
  restaurantDue:   { ur: 'ریسٹورنٹ بقایا',          en: 'Restaurant Due' },
  quickEntry:      { ur: 'فوری اندراج',              en: 'Quick Entry' },
  writeKhata:      { ur: 'خاتہ لکھیں',              en: 'Write Khata' },
  writeUdhaar:     { ur: 'ادھار لکھیں',             en: 'Write Udhaar' },
  todayShops:      { ur: 'آج کی دکانیں',            en: "Today's Shops" },
  noEntry:         { ur: 'کوئی داخلہ نہیں',         en: 'No entry' },

  // Shop selector
  noShopFound:     { ur: 'کوئی دکان نہیں',          en: 'No shops found' },
  addShopFirst:    { ur: 'پہلے اپنی دکان شامل کریں', en: 'Add your first shop' },
  addShop:         { ur: '+ دکان شامل کریں',         en: '+ Add Shop' },
  newShop:         { ur: 'نئی دکان',                 en: 'New Shop' },
  shopName:        { ur: 'دکان کا نام',              en: 'Shop name' },
  shopNameReq:     { ur: 'دکان کا نام *',            en: 'Shop name *' },
  address:         { ur: 'پتہ (اختیاری)',             en: 'Address (optional)' },
  save:            { ur: 'محفوظ کریں',               en: 'Save' },
  add:             { ur: 'شامل',                     en: 'Add' },
  addShopShort:    { ur: '+ دکان',                   en: '+ Shop' },

  // Daily entry
  dailyKhata:      { ur: 'روزانہ خاتہ',             en: 'Daily Khata' },
  dailyEntry:      { ur: 'روزانہ داخلہ',            en: 'Daily Entry' },
  liveWeight:      { ur: 'زندہ وزن (kg)',            en: 'Live Weight (kg)' },
  purchaseCost:    { ur: 'خریداری قیمت (Rs)',        en: 'Purchase Cost (Rs)' },
  purchaseRate:    { ur: 'خریداری ریٹ (Rs/kg)',       en: 'Purchase Rate (Rs/kg)' },
  totalCostCalc:   { ur: 'کل خریداری لاگت',          en: 'Total Purchase Cost' },
  meatSold:        { ur: 'فروخت گوشت (kg)',          en: 'Meat Sold (kg)' },
  cashCollected:   { ur: 'نقد وصولی (Rs)',           en: 'Cash Collected (Rs)' },
  saved:           { ur: '✓ محفوظ ہو گیا',           en: '✓ Saved' },
  todaySummary:    { ur: 'آج کا خلاصہ',             en: "Today's Summary" },
  yieldPct:        { ur: 'Yield %',                  en: 'Yield %' },
  grossProfit:     { ur: 'مجموعی منافع',             en: 'Gross Profit' },
  totalExpenses:   { ur: 'کل اخراجات',              en: 'Total Expenses' },
  netProfit:       { ur: 'خالص منافع',              en: 'Net Profit' },
  expenses:        { ur: 'اخراجات',                 en: 'Expenses' },
  rent:            { ur: 'کرایہ',                   en: 'Rent' },
  generator:       { ur: 'جنریٹر',                  en: 'Generator' },
  labor:           { ur: 'مزدوری',                  en: 'Labour' },
  misc:            { ur: 'دیگر',                    en: 'Other' },
  amount:          { ur: 'رقم',                     en: 'Amount' },
  note:            { ur: 'نوٹ (اختیاری)',            en: 'Note (optional)' },
  noteShort:       { ur: 'نوٹ',                     en: 'Note' },
  addExpense:      { ur: '+ خرچہ شامل کریں',        en: '+ Add Expense' },
  selectShop:      { ur: 'پہلے ایک دکان منتخب کریں', en: 'Please select a shop first' },
  weeklySummary:   { ur: 'ہفتہ وار خلاصہ',         en: 'Weekly Summary' },

  // Udhaar
  udhaarLedger:    { ur: 'ادھار کھاتہ',             en: 'Udhaar Ledger' },
  customer:        { ur: 'گاہک',                    en: 'Customer' },
  customers:       { ur: 'گاہک',                    en: 'Customers' },
  totalUdhaar:     { ur: 'کل بقایا ادھار',           en: 'Total Udhaar Due' },
  customersRemain: { ur: 'گاہک باقی ہیں',            en: 'customers pending' },
  searchPlaceholder: { ur: 'نام یا نمبر سے تلاش کریں...', en: 'Search by name or number...' },
  addNewCustomer:  { ur: 'نیا گاہک شامل کریں',      en: 'Add New Customer' },
  nameReq:         { ur: 'نام *',                   en: 'Name *' },
  whatsappNum:     { ur: 'WhatsApp نمبر (اختیاری)', en: 'WhatsApp Number (optional)' },
  cancel:          { ur: 'منسوخ',                   en: 'Cancel' },
  noCustomers:     { ur: 'کوئی گاہک نہیں',           en: 'No customers yet' },
  addCustomerHint: { ur: 'اوپر + گاہک بٹن سے شامل کریں', en: 'Tap + Customer above to add' },
  creditGiven:     { ur: 'ادھار دیا',               en: 'Credit Given' },
  debitLabel:      { ur: 'ادھار',                   en: 'Udhaar' },
  paymentReceived: { ur: 'ادائیگی ملی',             en: 'Payment Received' },
  paymentLabel:    { ur: 'ادائیگی',                 en: 'Payment' },
  sendReminder:    { ur: 'یاددہانی بھیجیں',         en: 'Send Reminder' },
  due:             { ur: 'بقایا',                   en: 'Due' },
  overpaid:        { ur: 'زیادہ ادائیگی',           en: 'Overpaid' },
  clear:           { ur: 'صاف ✓',                   en: 'Clear ✓' },
  txHistory:       { ur: 'لین دین کی تاریخ',        en: 'Transaction History' },
  addUdhaar:       { ur: '+ ادھار',                 en: '+ Udhaar' },
  addPayment:      { ur: '+ ادائیگی',               en: '+ Payment' },

  // Restaurants
  restaurantPage:  { ur: 'ریسٹورنٹ',               en: 'Restaurants' },
  addRestaurant:   { ur: '+ ریسٹورنٹ',             en: '+ Restaurant' },
  totalAmountDue:  { ur: 'کل بقایا رقم',            en: 'Total Amount Due' },
  newRestaurant:   { ur: 'نیا ریسٹورنٹ',           en: 'New Restaurant' },
  restaurantName:  { ur: 'ریسٹورنٹ کا نام *',      en: 'Restaurant name *' },
  defaultRate:     { ur: 'معمول کا ریٹ (Rs/kg)',    en: 'Default rate (Rs/kg)' },
  noRestaurants:   { ur: 'کوئی ریسٹورنٹ نہیں',     en: 'No restaurants yet' },
  addRestHint:     { ur: 'اوپر + ریسٹورنٹ بٹن سے شامل کریں', en: 'Tap + Restaurant above to add' },
  totalCharged:    { ur: 'کل رقم',                  en: 'Total Charged' },
  paid:            { ur: 'ادائیگی',                 en: 'Paid' },
  balance:         { ur: 'بقایا',                   en: 'Balance' },
  todayPurchase:   { ur: 'آج کی خریداری',           en: "Today's Purchase" },
  paymentRecvd:    { ur: 'ادائیگی وصول ہوئی',      en: 'Payment Received' },
  todayBill:       { ur: 'آج کا حساب',              en: "Today's Bill" },
  monthlyStmt:     { ur: 'ماہانہ حساب',             en: 'Monthly Statement' },
  recentEntries:   { ur: 'حالیہ داخلے',            en: 'Recent Entries' },
  addPurchase:     { ur: '+ خریداری شامل کریں',     en: '+ Add Purchase' },
  addPaymentBtn:   { ur: '+ ادائیگی شامل کریں',    en: '+ Add Payment' },

  // Reports
  reportsPage:     { ur: 'رپورٹس',                 en: 'Reports' },
  week:            { ur: 'ہفتہ',                   en: 'Week' },
  month:           { ur: 'مہینہ',                  en: 'Month' },
  all:             { ur: 'سب',                     en: 'All' },
  totalNetProfit:  { ur: 'کل خالص منافع',           en: 'Total Net Profit' },
  revenue:         { ur: 'آمدنی',                  en: 'Revenue' },
  purchase:        { ur: 'خریداری',                en: 'Purchase' },
  perShopBreakdown:{ ur: 'دکان وار تفصیل',         en: 'Per Shop Breakdown' },
  days:            { ur: 'دن',                     en: 'Days' },
  meat:            { ur: 'گوشت',                  en: 'Meat' },
  highestUdhaar:   { ur: 'سب سے زیادہ ادھار',      en: 'Highest Udhaar' },
  topBuyers:       { ur: 'سب سے زیادہ خریدار',     en: 'Top Buyers' },
  noDataPeriod:    { ur: 'اس مدت میں کوئی ڈیٹا نہیں', en: 'No data for this period' },
  writeKhataHint:  { ur: 'خاتہ میں داخلے لکھیں',   en: 'Write entries in Khata' },

  // Offline
  offlineMode:     { ur: 'آف لائن موڈ — ڈیٹا محفوظ ہو رہا ہے', en: 'Offline — Data is being saved locally' },
} as const;

export type TKey = keyof typeof t;

export function tr(key: TKey, lang: Lang): string {
  return t[key][lang];
}

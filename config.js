/* ==========================================================
   PN7 Automobile — CONFIG FILE
   ==========================================================
   ⭐ ဒီဖိုင်က ဆိုက်ရဲ့ ဆက်တင်အားလုံး ပါတယ်။
   URL / ဖုန်းနံပါတ် / Contact ပြောင်းချင်ရင် ဒီဖိုင်ပဲ ပြင်ပါ။

   ပြင်ပြီးရင် သိမ်း (Save) လိုက်ရုံပါပဲ။
   ========================================================== */

const CONFIG = {

  /* ---------- 1. SheetDB URL ---------- */
  // မင်းရဲ့ SheetDB URL ကို ဒီမှာ ထည့်ပါ
  // ပုံစံ: https://sheetdb.io/api/v1/abc123xyz
  sheetdbUrl: "https://sheetdb.io/api/v1/YOUR_API_ID_HERE",

  /* ---------- 2. Cache ကာလ ---------- */
  // ၂၄ နာရီ = 86400000 ms
  // Cache မကုန်သေးရင် SheetDB ကို ထပ်မခေါ်ဘူး
  cacheDurationMs: 24 * 60 * 60 * 1000,

  // localStorage key — ဗားရှင်း ပြောင်းရင် ဒါကိုပါ ပြောင်း (v1 → v2)
  cacheKey: "pn7_cars_cache_v1",

  /* ---------- 3. Contact Information ---------- */
  contact: {
    // ဖုန်းနံပါတ်များ (International format — + ပါ)
    phone1: "+959403718599",
    phone1Display: "09403718599",
    phone2: "+959761112344",
    phone2Display: "09761112344",

    // Viber / WhatsApp — နိုင်ငံကုဒ် ပါရမယ် (+ မပါ)
    viberNumber: "959403718599",
    whatsappNumber: "959403718599",

    // Messenger — Facebook Page username (placeholder ထားထားတယ်)
    // FB Page ရှိပြီးရင် "pn7automobile" ကို မင်း page name နဲ့ အစားထိုး
    messengerPage: "pn7automobile",
  },

  /* ---------- 4. လိပ်စာ & အချိန် ---------- */
  business: {
    addressLines: [
      "No.(413), 62nd Street,",
      "Between 35th & 36th Streets,",
      "MaharAungMyay Township, Mandalay."
    ],
    openHours: "09:00 AM – 05:00 PM",
    openDays: "Open Daily"
  }
};

/* ==========================================================
   FALLBACK DATA
   ==========================================================
   SheetDB မရရင် (internet မရှိ / URL မှား / server ပျက်)
   ဒီ data ကို သုံးမယ်။ ကား ၉ စီး ပါတယ်။

   SheetDB ကို အသုံးမပြုခင် ဒီ data ကို စမ်းကြည့်လို့ရတယ်။
   ========================================================== */

const FALLBACK_CARS = [
  {
    id: 1, brand: "Sinotruk", name: "Sinotruk VGV U70 Pro",
    engine: "1.5T", model: "2025", seats: 7, hp: "156 HP",
    gear: "6-Speed Automatic",
    dimensions: "15 ft 10 in x 6 ft 2 in x 5 ft 7 in",
    groundClearance: "7.9 in",
    stock: "In Stock",
    description: "7-seater family SUV with modern styling and spacious interior. Ideal for daily family use.",
    images: {
      front:    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1503376760361-b978a16590c1?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 2, brand: "Sinotruk", name: "Sinotruk VGV U75 Plus",
    engine: "2.0T", model: "2025", seats: 7, hp: "224 HP",
    gear: "8-Speed Automatic",
    dimensions: "15 ft 10 in x 6 ft 2 in x 5 ft 7 in",
    groundClearance: "7.9 in",
    stock: "In Stock",
    description: "Powerful 2.0T 7-seater with premium features and 8-speed automatic transmission.",
    images: {
      front:    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 3, brand: "Sinotruk", name: "Sinotruk Bolden S7",
    engine: "2.0T", model: "2025", seats: 7, hp: "224 HP",
    gear: "8-Speed Automatic",
    dimensions: "16 ft 8 in x 6 ft 6 in x 6 ft 4 in",
    groundClearance: "8.3 in",
    stock: "Pre-order",
    description: "Flagship SUV with generous cabin space and strong road presence.",
    images: {
      front:    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 4, brand: "Jetour", name: "Jetour X50",
    engine: "1.5T", model: "2025", seats: 5, hp: "156 HP",
    gear: "6-Speed DCT",
    dimensions: "14 ft 5 in x 6 ft 0 in x 5 ft 5 in",
    groundClearance: "7.1 in",
    stock: "In Stock",
    description: "Compact 5-seater SUV, perfect for city driving with efficient fuel economy.",
    images: {
      front:    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1486495330452-27756fdf0618?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 5, brand: "Jetour", name: "Jetour T1",
    engine: "1.5T", model: "2025", seats: 5, hp: "197 HP",
    gear: "7-Speed DCT",
    dimensions: "15 ft 5 in x 6 ft 5 in x 6 ft 1 in",
    groundClearance: "8.1 in",
    stock: "In Stock",
    description: "Off-road capable SUV with rugged design and modern technology features.",
    images: {
      front:    "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1502489597346-bf1051566cb8?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf02b?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 6, brand: "Jetour", name: "Jetour T2",
    engine: "2.0T", model: "2026", seats: 5, hp: "254 HP",
    gear: "7-Speed DCT",
    dimensions: "15 ft 8 in x 6 ft 7 in x 6 ft 2 in",
    groundClearance: "8.7 in",
    stock: "Pre-order",
    description: "2026 flagship off-roader. High ground clearance, powerful 2.0T engine.",
    images: {
      front:    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1616422285623-14fb795e59d6?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 7, brand: "Jetour", name: "Jetour Dashing",
    engine: "1.6T", model: "2025", seats: 5, hp: "197 HP",
    gear: "7-Speed DCT",
    dimensions: "15 ft 1 in x 6 ft 3 in x 5 ft 6 in",
    groundClearance: "6.3 in",
    stock: "In Stock",
    description: "Sporty crossover with sleek silhouette and turbocharged performance.",
    images: {
      front:    "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 8, brand: "Beijing", name: "Beijing X7",
    engine: "1.5T", model: "2025", seats: 5, hp: "188 HP",
    gear: "7-Speed DCT",
    dimensions: "15 ft 5 in x 6 ft 2 in x 5 ft 8 in",
    groundClearance: "7.9 in",
    stock: "In Stock",
    description: "Refined SUV with premium interior and advanced driver assistance features.",
    images: {
      front:    "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    id: 9, brand: "Forthing", name: "Forthing M4 U-Tour",
    engine: "1.5T", model: "2025", seats: 7, hp: "197 HP",
    gear: "7-Speed DCT",
    dimensions: "15 ft 11 in x 6 ft 3 in x 5 ft 8 in",
    groundClearance: "6.7 in",
    stock: "In Stock",
    description: "7-seater MPV ideal for families. Smooth ride, generous cargo space.",
    images: {
      front:    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800",
      back:     "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1605810731668-c11be4737bc6?auto=format&fit=crop&q=80&w=800",
      left:     "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      right:    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800"
    }
  }
];

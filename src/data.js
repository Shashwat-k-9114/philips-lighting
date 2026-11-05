/* Catalogue snapshot + site content. Sources: in.shop.lighting.philips.com (public pages, captured 5 Nov 2026).
   Every figure carries provenance. Nothing here is a live feed. */
export const STORE = 'https://in.shop.lighting.philips.com';
const CDN = STORE + '/cdn/shop/files/';
export const LOGO = 'https://images.philips.com/is/image/PhilipsConsumer/Philips_Wordmark-ALI-global?wid=400&$jpgsmall$';
export const SIGNIFY_LOGO = 'https://www.lighting.philips.com/b-dam/brand-logos/search_brand_logo_Signify.png';
export const LIVE_ASSETS = {
  hero: CDN + 'Living_Room_9e5d68a7-6661-491d-a8ec-d54e3d12d24d.png?v=1751007852&width=1600',
  campaign: CDN + 'D2C_Website_Banner.png?v=1791543435&width=1920',
  bedroom: CDN + '990X530_Sky.png?v=1789980511&width=1100',
  bathroom: CDN + 'bathroom-banner.jpg?v=1750064710&width=1100',
  kitchen: CDN + 'Kitchen_Image_new.png?v=1750923805&width=1100',
  outdoor: CDN + 'Outdoor-Lights-Website-Banner-final-file.jpg?v=1750068616&width=1100',
  blogStrip: STORE + '/cdn/shop/articles/Blog_2-_image.png?v=1774422778&width=900',
  blogBedroom: STORE + '/cdn/shop/articles/1200X1200.png?v=1774424182&width=900',
  blogLiving: STORE + '/cdn/shop/articles/Naica_Scene_4_e61a79c1-4c8f-4550-b849-f44b7b29c004.jpg?v=1774423139&width=900'
};

export const CONTACT = {
  phone: '000 800 050 7777', hours: 'Monday–Saturday, 09:00–18:00 IST', email: 'support.philipslightingIndia@signify.com',
  grievance: { name: 'Aniket Narula', role: 'Compliance Officer & Grievance Redressal Officer', email: 'grievance.shop@signify.com' },
  company: 'Signify Innovations India Ltd (formerly Philips Lighting India Ltd)',
  offices: [
    { k: 'Registered office · Kolkata', a: 'PS Arcadia Central, 3A, 3rd Floor, 4A Abanindranath Thakur Sarani (Camac Street), Kolkata 700 017', t: '+91 73030 84237' },
    { k: 'Corporate office · Gurugram', a: '9th Floor, DLF 9B, DLF Cyber City, DLF Phase 3, Gurugram 122002', t: '+91 73030 84234' },
    { k: 'Western region · Mumbai', a: 'Boomerang, B2 Wing, 5th Floor, Unit 506, Chandivali Farm Road, Andheri (East), Mumbai 400 072' },
    { k: 'Southern region · Chennai', a: 'Sunny Side, 3rd Floor, Block C, Shafee Mohammed Rd, Off Greams Road, Chennai 600 008' }
  ],
  social: [
    { n: 'Instagram', u: 'https://www.instagram.com/philipslightingindia/', h: '@philipslightingindia', v: true },
    { n: 'Facebook', u: 'https://www.facebook.com/PhilipsLightingIndia/', h: 'PhilipsLightingIndia', v: true },
    { n: 'X', u: 'https://x.com/PhilipsLightIND', h: '@PhilipsLightIND', v: true },
    { n: 'YouTube', u: '', h: 'Proposed channel', v: false },
    { n: 'WhatsApp', u: '', h: 'Proposed: order & support updates', v: false }
  ]
};

/* the 19 categories in the official mega-menu (+ All products), grouped for a clearer IA */
export const CATEGORIES = [
  { id: 'chandeliers', n: 'Chandeliers', g: 'Statement', ic: 'chandelier' },
  { id: 'hanging', n: 'Hanging lights', g: 'Statement', ic: 'pendant' },
  { id: 'decorative', n: 'Decorative lights', g: 'Statement', ic: 'orb' },
  { id: 'ceiling', n: 'Ceiling lights', g: 'Everyday', ic: 'panel' },
  { id: 'bulbs', n: 'Bulbs', g: 'Everyday', ic: 'bulb' },
  { id: 'tube', n: 'Tube lights', g: 'Everyday', ic: 'tube' },
  { id: 'track', n: 'Track lights', g: 'Everyday', ic: 'track' },
  { id: 'smart', n: 'Smart lights', g: 'Smart', ic: 'smart' },
  { id: 'strips', n: 'Light strips', g: 'Smart', ic: 'strip' },
  { id: 'string', n: 'String lights', g: 'Smart', ic: 'string' },
  { id: 'wall', n: 'Wall lights', g: 'Accent', ic: 'wall' },
  { id: 'picture', n: 'Picture lights', g: 'Accent', ic: 'picture' },
  { id: 'bathroom', n: 'Bathroom lights', g: 'Accent', ic: 'mirror' },
  { id: 'table', n: 'Table lamps', g: 'Lamps', ic: 'table' },
  { id: 'floor', n: 'Floor lamps', g: 'Lamps', ic: 'floor' },
  { id: 'bedside', n: 'Bedside light', g: 'Lamps', ic: 'bedside' },
  { id: 'outdoor', n: 'Outdoor lights', g: 'Outdoor & safety', ic: 'outdoor' },
  { id: 'solar', n: 'Solar lights', g: 'Outdoor & safety', ic: 'solar' },
  { id: 'emergency', n: 'Emergency lights', g: 'Outdoor & safety', ic: 'emergency' }
];
export const catById = id => CATEGORIES.find(c => c.id === id);

/*
 studio: photometric model for the Light Studio.
   kind: rgb | tw | white | fixed | variant      mount: ceiling | floor | desk | cove | pendant
   flux/watts/cct entries are {v, s} where s = 'listing' (stated on the official page) or 'assumed' (class-typical; replace with datasheet / IES)
*/
const A = (v) => ({ v, s: 'assumed' }), L = (v) => ({ v, s: 'listing' });
export const PRODUCTS = [
  { id: 'gradient', name: 'Wi-Fi Gradient Floor Lamp', price: 9850, old: 11999, cats: ['floor', 'smart'], cls: 'RGBIC floor lamp', tag: 'A canvas of colour', best: true,
    img: CDN + '0_bf3d50b0-1151-4209-b4f2-c00091a12675.png?v=1769687517', scene: CDN + '1_24073960-a4dc-4893-8423-18f82d2091b1.png?v=1769687517',
    url: STORE + '/products/philips-wi-fi-gradient-floor-lamp', rooms: ['Living room', 'Bedroom'],
    features: ['RGBIC gradient: several colours at once on the wall', 'Music-reactive via smartphone', 'Preset dynamic and static scenes', '1363 mm, one-piece, no assembly'],
    details: [['Height', '1363 mm (listing)'], ['Light', 'RGBIC multicolour (listing)'], ['Origin', 'China · imported by Signify Innovations India Ltd.'], ['Works with', 'Philips Wi-Fi HDMI Sync Box (sold separately)'], ['Dispatch', 'Usually within 48 h · delivery 5–7 business days']],
    note: 'Accent light. Lumens, wattage and CCT are not stated on the listing.',
    studio: { kind: 'rgb', mount: 'floor', flux: A(800), watts: A(12), cct: null, presets: ['Cinema', 'Sunset', 'Ocean', 'Focus'] } },
  { id: 'rune', name: 'Rune WiZ Smart Ceiling Light', price: 9700, old: 19999, cats: ['ceiling', 'smart'], cls: 'Ceiling · RGB + tunable white', tag: 'Full-spectrum living', best: true,
    img: CDN + 'Artboard1_c66ab69b-3259-413a-9ac4-ff7c009951f7.png?v=1753340615', scene: CDN + 'Artboard4_ee46ea3a-2614-4d2d-8b0f-e9b819d70151.png?v=1753340615',
    url: STORE + '/products/philips-rune-wiz-smart-ceiling-light', rooms: ['Living room', 'Bedroom'],
    features: ['21W high-brightness output, ideal for medium–large rooms', 'Tunable white 2700–6500 K plus millions of colours', 'WiZ app, Alexa, Google Assistant', 'Dimmable'],
    details: [['Wattage', '21 W (listing)'], ['White', '2700–6500 K (listing)'], ['Colour', 'RGB + tunable white'], ['Mounting', 'Ceiling'], ['Made in', 'India · Signify Innovations India Ltd.']],
    note: 'Luminous flux is not stated on the listing page; the studio uses an assumed class value you can overwrite with the datasheet.',
    studio: { kind: 'rgb', mount: 'ceiling', flux: A(2100), watts: L(21), cct: { min: 2700, max: 6500, def: 3000, s: 'listing' }, presets: ['Relax', 'Focus', 'Sunset', 'Ocean'], size: 0.3 } },
  { id: 'superslim', name: 'SuperSlim WiZ Smart Ceiling Light', price: 5221, old: 7999, cats: ['ceiling', 'smart'], cls: 'Ceiling · connected', tag: 'Invisible form, endless mood',
    img: CDN + '0.jpg?v=1769758860', url: STORE + '/products/philips-superslim-wiz-smart-ceiling-light', rooms: ['Living room', 'Bedroom'],
    features: ['RGB + tunable white', 'WiZ connectivity', 'App and voice control', 'Slim ceiling profile'],
    details: [['Light', 'RGB + tunable white (listing)'], ['White', '2700–6500 K (listing)'], ['Connectivity', 'Wi-Fi / WiZ']],
    note: 'Listing data has variant inconsistencies; confirm the SKU and watts before implementation.',
    studio: { kind: 'rgb', mount: 'ceiling', flux: A(1500), watts: A(15), cct: { min: 2700, max: 6500, def: 3000, s: 'listing' }, presets: ['Relax', 'Focus', 'Sunset', 'Ocean'], size: 0.32 } },
  { id: 'strip', name: 'Smart Wi-Fi Tunable White LED Strip', price: 4889, old: 5499, cats: ['strips', 'smart'], cls: '5 m tunable white strip', tag: 'Architecture in light',
    img: CDN + '929003551501.jpg?v=1784718273', scene: CDN + '61P1X2egjbL._SL1416.jpg?v=1782895099', url: STORE + '/products/philips-smart-wi-fi-tunable-white-led-strip', rooms: ['Living room', 'Bedroom', 'Workspace', 'Kitchen'],
    features: ['5-metre flexible strip', 'Warm-to-cool tunable white', 'Philips Smart app: schedules and scenes', 'Cabinets, TV back-light, cove, shelves, stairs'],
    details: [['Length', '5 m (listing)'], ['Light', 'Tunable white only (listing)'], ['Kelvin range', 'Not stated on listing'], ['Made in', 'India · Signify Innovations India Ltd.']],
    note: 'White only: no RGB. The Kelvin endpoints are not on the listing, so the studio uses an assumed 2700–6500 K range.',
    studio: { kind: 'tw', mount: 'cove', flux: A(1000), watts: A(10), cct: { min: 2700, max: 6500, def: 3000, s: 'assumed' }, presets: ['Relax', 'Focus', 'Evening'], length: 5 } },
  { id: 'downlight', name: 'Dura Slim LED Downlight', price: 795, old: 1200, cats: ['ceiling'], cls: 'Recessed · fixed white', tag: 'Lighting without distraction', best: true,
    img: CDN + '929001951828.png?v=1784717937', url: STORE + '/products/philips-dura-slim-led-downlight-copy', rooms: ['Living room', 'Bedroom', 'Workspace', 'Kitchen'],
    features: ['Slim recessed profile · die-cast aluminium', 'Warm / natural / cool daylight chosen at purchase', '50,000 h lifetime (listing)', '7 / 12 / 15 / 22 W variants'],
    details: [['Lifetime', '50,000 h (listing)'], ['Body', 'Die-cast aluminium, white'], ['Made in', 'India · Signify Innovations India Ltd.'], ['Lumens / CCT / CRI', 'Not stated on listing']],
    note: 'Colour is a purchase-time choice: it cannot be changed after installation.',
    variants: [
      { w: 7, c: 'Warm white', p: 795, ok: true }, { w: 7, c: 'Natural white', p: null, ok: false }, { w: 7, c: 'Cool daylight', p: null, ok: false },
      { w: 12, c: 'Warm white', p: null, ok: false }, { w: 12, c: 'Natural white', p: 920, ok: true }, { w: 12, c: 'Cool daylight', p: 920, ok: true },
      { w: 15, c: 'Warm white', p: 1175, ok: true }, { w: 15, c: 'Natural white', p: 1175, ok: true }, { w: 15, c: 'Cool daylight', p: 1175, ok: true },
      { w: 22, c: 'Natural white', p: 1860, ok: true }, { w: 22, c: 'Cool daylight', p: 1860, ok: true }],
    studio: { kind: 'variant', mount: 'ceiling', flux: A(0), watts: L(12), cct: null, size: 0.16, efficacy: A(90), cctMap: { 'Warm white': 3000, 'Natural white': 4000, 'Cool daylight': 6500 } } },
  { id: 'eyelamp', name: 'EyeComfort Orbit LED Desk Lamp', price: 1880, cats: ['table'], cls: 'Task light · 5 W', tag: 'Designed for concentration',
    img: CDN + 'Artboard1_6dd867e5-2832-4f83-87fc-8e1e1cf7c019.png?v=1782900948', scene: CDN + 'Artboard2_7793f97f-8a1f-403d-b6a8-bdc3b732bc4a.png?v=1782900948', url: STORE + '/products/philips-eyecomfort-orbit-led-desk-lamp-copy', rooms: ['Bedroom', 'Workspace'],
    features: ['5 W integrated LED', 'Philips EyeComfort', 'Reading / desk / bedside'], details: [['Wattage', '5 W (listing)'], ['Type', 'Integrated LED']],
    note: 'No app dimming or RGB claimed on the listing.',
    studio: { kind: 'fixed', mount: 'desk', flux: A(400), watts: L(5), cct: { min: 4000, max: 4000, def: 4000, s: 'assumed' }, size: 0.14 } },
  { id: 'chandelier', name: 'Majesté 5 Head Crystal Chandelier', price: 32686, cats: ['chandeliers', 'decorative', 'hanging'], cls: 'Decorative · 5 × E14', tag: 'A room-defining statement', isNew: true,
    img: CDN + '915006349565.png?v=1784530731', scene: CDN + 'Artboard3_cb1a5dfd-50ef-41c4-9f89-79730b59cd2a.png?v=1784278721', url: STORE + '/products/philips-majeste-5-head-crystal-chandelier', rooms: ['Living room'],
    features: ['Five E14 lamp holders', 'K9 crystal detailing', 'Ceiling-suspended', 'Living / dining / foyer'], details: [['Holders', '5 × E14 (listing)'], ['Crystal', 'K9']],
    note: 'Light colour and brightness depend on the separately chosen E14 lamps (studio assumes 5 × 470 lm, 2700 K).',
    studio: { kind: 'fixed', mount: 'pendant', flux: A(2350), watts: A(25), cct: { min: 2700, max: 2700, def: 2700, s: 'assumed' } } },
  { id: 'bulb', name: 'Smart Wi-Fi Pro LED Bulb', price: 549, cats: ['bulbs', 'smart'], cls: 'Wi-Fi · B22 / E27', tag: 'A smarter everyday bulb', isNew: true,
    img: CDN + 'Artboard_1_4134af43-8227-409d-bd12-b42bf1af098b.png?v=1782895252', url: STORE + '/products/philips-smart-wi-fi-pro-led-bulb', rooms: ['Living room', 'Bedroom', 'Workspace'],
    features: ['9 / 10 / 12 W', 'B22 / E27 caps', 'App control and scheduling', 'Voice assistant compatible'], details: [['Wattage', '9 / 10 / 12 W'], ['Cap', 'B22 / E27']],
    note: 'Colour capability varies by variant; excluded from the studio until verified.' },
  { id: 'batten', name: 'Smart Wi-Fi LED Batten', price: 749, cats: ['tube', 'smart'], cls: 'Linear · surface', tag: 'Light, simplified',
    img: CDN + 'Artboard1_9db6eaa8-ff02-44c9-834e-21b6cc6a7685.png?v=1782896245', url: STORE + '/collections/led-tube-lights/products/philips-smart-wi-fi-led-batten', rooms: ['Living room', 'Workspace'],
    features: ['20 W', 'Wi-Fi app and voice control', 'White / colour variants'], details: [['Wattage', '20 W'], ['Mounting', 'Surface']], note: 'Colour capability varies by variant.' },
  { id: 'plug', name: 'WiZ Smart Plug', price: 799, old: 2499, cats: ['smart'], cls: 'Wi-Fi accessory', tag: 'Connected by design', best: true,
    img: CDN + '51duObovICL._SL1080_50e02ee5-dbf2-436c-97be-ea71ad1003ba.jpg?v=1769705280', url: STORE + '/products/philips-wiz-smart-plug', rooms: ['Living room', 'Bedroom', 'Workspace'],
    features: ['Remote switching', 'Scheduling', 'WiZ-connected'], details: [['Type', 'Smart plug']], note: 'An accessory, not a light source.' },
  { id: 'lucidus', name: 'Lucidus Chandelier', price: 11383, old: 16720, cats: ['chandeliers', 'hanging'], cls: 'Chandelier', tag: 'Cascading light', best: true,
    img: CDN + '41Joc2EHmpL.jpg?v=1769685584', url: STORE + '/collections/our-bestsellers-1/products/philips-lucidus-pendant-light', rooms: ['Living room'],
    features: ['Bestseller on the official store', 'Statement pendant for living and dining spaces'], details: [['Price', '₹11,383 (official homepage snapshot)'], ['Availability', 'Verify live variant on official store']], note: 'Price and availability are a public-store snapshot; verify the live listing before purchase.' },
  { id: 'divine', name: 'Divine 1-head Wall Light', price: 4925, old: 5390, cats: ['wall'], cls: 'Wall light', tag: 'A quiet accent',
    img: CDN + 'Divine-1head-Wall_light.png?v=1769879207', url: STORE + '/collections/our-bestsellers-1/products/philips-divine-wall-light-french-gold', rooms: ['Living room', 'Bedroom'],
    features: ['Bestselling wall light', 'French-gold finish for a warm accent'], details: [['Price', '₹4,925 (official homepage snapshot)'], ['Category', 'Wall light']], note: 'Public listing snapshot. Confirm finish, stock and delivery on the official store.' },
  { id: 'trumpet', name: 'Trumpet Wall Light', price: 1023, old: 1350, cats: ['wall'], cls: 'Wall light', tag: 'Soft edges',
    img: CDN + 'PhilipsTrumpetWalllight.png?v=1747311521', url: STORE + '/collections/our-bestsellers-1/products/philips-trumpet-wall-light', rooms: ['Living room', 'Bedroom'],
    features: ['Bestselling wall light', 'Compact accent for bedrooms and living spaces'], details: [['Price', '₹1,023 (official homepage snapshot)'], ['Category', 'Wall light']], note: 'Public listing snapshot. Confirm finish, stock and delivery on the official store.' },
  { id: 'glow', name: 'Glow Wall Light', price: 1023, old: 1350, cats: ['wall'], cls: 'Wall light', tag: 'Warm wash',
    img: CDN + 'PhilipsGlowWalllight.png?v=1747311518', url: STORE + '/collections/our-bestsellers-1/products/philips-glow-wall-light', rooms: ['Living room', 'Bedroom'],
    features: ['Bestselling wall light', 'A simple layer of warm, indirect light'], details: [['Price', '₹1,023 (official homepage snapshot)'], ['Category', 'Wall light']], note: 'Public listing snapshot. Confirm finish, stock and delivery on the official store.' },
  { id: 'fullglow', name: 'Full Glow LED Surface Light', price: 595, old: 775, cats: ['ceiling'], cls: 'Surface ceiling light', tag: 'Even and calm',
    img: CDN + 'PhilipsFullGlowLEDSurfacelight6W.png?v=1747311845', url: STORE + '/collections/our-bestsellers-1/products/philips-full-glow-led-surface-light-copy', rooms: ['Living room', 'Bedroom', 'Kitchen'],
    features: ['Bestselling ceiling light', 'Wide, even light for spaces without a false ceiling'], details: [['Price', '₹595 (official homepage snapshot)'], ['Category', 'Surface ceiling light']], note: 'Public listing snapshot. Confirm wattage, stock and delivery on the official store.' },
  { id: 'ultraglow', name: 'Ultra Glow 3-in-1 LED Downlight', price: 670, old: 950, cats: ['ceiling'], cls: 'Downlight · 3-in-1', tag: 'Three whites, one fitting',
    img: CDN + 'PhilipsUltraGlow3-in-1LEDDownlight1.png?v=1769766320', url: STORE + '/collections/our-bestsellers-1/products/philips-ultraglow-downlight-tunable-white', rooms: ['Living room', 'Kitchen', 'Workspace'],
    features: ['Bestselling ceiling light', 'Warm, natural and cool white options'], details: [['Price', '₹670 (official homepage snapshot)'], ['Category', '3-in-1 LED downlight']], note: 'Public listing snapshot. Confirm wattage, stock and delivery on the official store.' }
];
export const byId = id => PRODUCTS.find(p => p.id === id);
export const STUDIO_IDS = PRODUCTS.filter(p => p.studio).map(p => p.id);

export const ROOMS = {
  'Living room': { W: 5.0, D: 4.8, H: 2.8, blurb: 'General, accent and decorative light in balance.', tag: 'The art of unwinding',
    img: LIVE_ASSETS.hero, acts: [['Relaxing', 100], ['General', 150], ['Reading / hobby', 300]] },
  'Bedroom': { W: 4.0, D: 3.75, H: 2.7, blurb: 'Warm, low and personal. Light that lets the day end.', tag: 'Let the world slow down',
    img: LIVE_ASSETS.bedroom, acts: [['Winding down', 50], ['General', 100], ['Reading in bed', 300]] },
  'Workspace': { W: 4.0, D: 3.0, H: 2.7, blurb: 'Task-first brightness with fewer distractions.', tag: 'Light for your best work',
    img: LIVE_ASSETS.blogBedroom, acts: [['Calls & casual', 300], ['Desk work', 500], ['Detailed tasks', 750]] },
  'Kitchen': { W: 3.6, D: 3.4, H: 2.7, blurb: 'Bright where hands work, soft where people gather.', tag: 'Where it all happens',
    img: LIVE_ASSETS.kitchen, acts: [['General', 200], ['Food prep', 300], ['Detail tasks', 500]] }
};
export const FINISHES = { Light: { ceil: .8, wall: .7, floor: .3 }, Medium: { ceil: .7, wall: .5, floor: .2 }, Dark: { ceil: .5, wall: .25, floor: .1 } };

export const BLOG = [
  { t: '5 Ways to Use Strip & Rope Lights for Home Decor', d: '02 Jan 2025', k: 'Decor', hue: 28, img: LIVE_ASSETS.blogStrip, href: STORE + '/blogs/inspiration/5-ways-to-use-strip-and-rope-lights' },
  { t: 'Enhance Your Space with Smart Bedroom Lighting', d: '15 Feb 2025', k: 'Smart home', hue: 265, img: LIVE_ASSETS.blogBedroom, href: STORE + '/blogs/inspiration/smart-lighting-in-bedrooms' },
  { t: 'Light up your living room with the Right Lighting Fixtures!', d: '10 Apr 2025', k: 'Living room', hue: 190, img: LIVE_ASSETS.blogLiving, href: STORE + '/blogs/inspiration/transform-your-living-area-with-the-right-lighting-fixtures' },
  { t: 'Top 7 Living Room Lighting Ideas To Create More Spacious Home', d: '21 Jul 2026', k: 'Living room', hue: 330 },
  { t: 'How to Choose a Dining Room Chandelier That Fits Just Right', d: '31 Aug 2026', k: 'Dining', hue: 45 },
  { t: '7 Bedroom Lighting Tips And Rules To Get That Perfect Sleep', d: '19 Jun 2026', k: 'Bedroom', hue: 240 }
];

export const LOOKS = [
  { n: 'Kitchen', ids: ['strip', 'ultraglow', 'downlight'], hue: 38, line: 'Bright where hands work.', img: LIVE_ASSETS.kitchen },
  { n: 'Bathroom', ids: ['fullglow', 'downlight'], hue: 195, line: 'Clean, even, glare-aware.', img: LIVE_ASSETS.bathroom },
  { n: 'Living Room', ids: ['gradient', 'rune', 'chandelier', 'strip'], hue: 280, line: 'Layered atmosphere.', img: LIVE_ASSETS.hero },
  { n: 'Outdoor', ids: ['plug'], hue: 150, line: 'Safe paths, warm entrances.', img: LIVE_ASSETS.outdoor },
  { n: 'Entertainment Room', ids: ['gradient', 'strip', 'plug'], hue: 305, line: 'Light that moves with the film.', img: LIVE_ASSETS.blogLiving }
];

export const HUB_CITIES = [
  { n: 'Delhi NCR', x: 77.1, y: 28.6, office: 'Corporate office · Gurugram' }, { n: 'Jalandhar', x: 75.6, y: 31.3 }, { n: 'Mumbai', x: 72.9, y: 19.1, office: 'Western region' },
  { n: 'Ahmedabad', x: 72.6, y: 23.0 }, { n: 'Pune', x: 73.9, y: 18.5 }, { n: 'Hyderabad', x: 78.5, y: 17.4 }, { n: 'Bengaluru', x: 77.6, y: 12.97 },
  { n: 'Chennai', x: 80.2, y: 13.1, office: 'Southern region' }, { n: 'Kolkata', x: 88.4, y: 22.6, office: 'Registered office' }
];
export const INDIA = [[68.1,23.6],[69,22.4],[70.2,20.9],[72.8,21],[72.9,19],[73.8,15.6],[74.9,12.9],[76.3,9.2],[77.5,8.1],[78.4,9.2],[79.8,10.3],[80.3,13],[80.2,15.5],[82.2,16.8],[85,19.5],[86.9,21.5],[88.8,21.7],[89.1,26.3],[92,26.7],[94,27.2],[96,28.3],[97.2,28],[95,26],[93,24.5],[92.5,22.5],[91.3,23.7],[90,25.2],[88.3,26.5],[88,27.8],[84,28.2],[80.5,30.3],[79,31],[78.7,32.5],[79.5,34.6],[77.8,35.5],[75.5,36.5],[74,34.7],[74.7,32.5],[73.3,31.2],[71.5,29.4],[70.5,28],[69.3,26.5],[68.2,24.4]];

export const money = n => '₹' + Number(n).toLocaleString('en-IN');
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

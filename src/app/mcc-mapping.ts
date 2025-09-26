// MCC (Merchant Category Code) Mapping
// Comprehensive standard MCC code classification system
// Dataset-agnostic mapping for universal transaction categorization

import {
  UtensilsCrossed, ShoppingBag, Car, Gamepad2, MapPin, Briefcase,
  Heart, Stethoscope, Zap, Building2, CreditCard, Wrench,
  Home, GraduationCap, HeartHandshake, Building, HelpCircle
} from 'lucide-react';

export interface MCCCategory {
  code: string;
  description: string;
  category: string;
  subcategory?: string;
}

export const MCC_CATEGORIES = {
  // Primary spending categories
  FOOD_DINING: 'Food & Dining',
  RETAIL_SHOPPING: 'Retail & Shopping', 
  TRANSPORTATION: 'Transportation',
  ENTERTAINMENT: 'Entertainment & Recreation',
  TRAVEL_LODGING: 'Travel & Lodging',
  SERVICES: 'Professional Services',
  PERSONAL_CARE: 'Personal Care',
  HEALTHCARE: 'Healthcare & Medical',
  UTILITIES: 'Utilities & Telecom',
  GOVERNMENT: 'Government & Taxes',
  FINANCIAL: 'Financial Services',
  AUTOMOTIVE: 'Automotive',
  HOME_GARDEN: 'Home & Garden',
  EDUCATION: 'Education',
  CHARITY: 'Charitable & Non-Profit',
  BUSINESS: 'Business Services',
  OTHER: 'Other'
} as const;

export const CATEGORY_ICONS = {
  [MCC_CATEGORIES.FOOD_DINING]: UtensilsCrossed,
  [MCC_CATEGORIES.RETAIL_SHOPPING]: ShoppingBag,
  [MCC_CATEGORIES.TRANSPORTATION]: Car,
  [MCC_CATEGORIES.ENTERTAINMENT]: Gamepad2,
  [MCC_CATEGORIES.TRAVEL_LODGING]: MapPin,
  [MCC_CATEGORIES.SERVICES]: Briefcase,
  [MCC_CATEGORIES.PERSONAL_CARE]: Heart,
  [MCC_CATEGORIES.HEALTHCARE]: Stethoscope,
  [MCC_CATEGORIES.UTILITIES]: Zap,
  [MCC_CATEGORIES.GOVERNMENT]: Building2,
  [MCC_CATEGORIES.FINANCIAL]: CreditCard,
  [MCC_CATEGORIES.AUTOMOTIVE]: Wrench,
  [MCC_CATEGORIES.HOME_GARDEN]: Home,
  [MCC_CATEGORIES.EDUCATION]: GraduationCap,
  [MCC_CATEGORIES.CHARITY]: HeartHandshake,
  [MCC_CATEGORIES.BUSINESS]: Building,
  [MCC_CATEGORIES.OTHER]: HelpCircle
} as const;

export const MCC_MAPPING: Record<string, MCCCategory> = {
  // AGRICULTURAL SERVICES (0001-0799)
  '0742': { code: '0742', description: 'Veterinary Services', category: MCC_CATEGORIES.HEALTHCARE },
  '0763': { code: '0763', description: 'Agricultural Cooperatives', category: MCC_CATEGORIES.BUSINESS },

  // CONTRACTED SERVICES (1500-2999)
  '1520': { code: '1520', description: 'General Contractors - Residential and Commercial', category: MCC_CATEGORIES.SERVICES },
  '1771': { code: '1771', description: 'Concrete Work Contractors', category: MCC_CATEGORIES.SERVICES },
  '1799': { code: '1799', description: 'Special Trade Contractors', category: MCC_CATEGORIES.SERVICES },
  '2741': { code: '2741', description: 'Miscellaneous Publishing and Printing', category: MCC_CATEGORIES.BUSINESS },
  '2791': { code: '2791', description: 'Typesetting, Plate Making', category: MCC_CATEGORIES.BUSINESS },

  // AIRLINES (3000-3350)
  '3000': { code: '3000', description: 'United Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3001': { code: '3001', description: 'American Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3002': { code: '3002', description: 'Pan American', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3003': { code: '3003', description: 'Delta Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3004': { code: '3004', description: 'Northwest Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3005': { code: '3005', description: 'British Airways', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3006': { code: '3006', description: 'Japan Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3007': { code: '3007', description: 'Air France', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3008': { code: '3008', description: 'Lufthansa', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3009': { code: '3009', description: 'Air Canada', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3010': { code: '3010', description: 'KLM (Royal Dutch Airlines)', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3011': { code: '3011', description: 'Aeroflot', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3012': { code: '3012', description: 'Qantas', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3013': { code: '3013', description: 'Alitalia', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3014': { code: '3014', description: 'Saudi Arabian Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3015': { code: '3015', description: 'Swiss International Air Lines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3016': { code: '3016', description: 'SAS (Scandinavian Airlines)', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3017': { code: '3017', description: 'South African Airways', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3018': { code: '3018', description: 'Varig (Brazilian Airlines)', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3026': { code: '3026', description: 'Emirates', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3029': { code: '3029', description: 'Brussels Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3042': { code: '3042', description: 'Finnair', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3047': { code: '3047', description: 'Turkish Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3049': { code: '3049', description: 'Tunisair', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3051': { code: '3051', description: 'Austrian Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3102': { code: '3102', description: 'Iberia', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3136': { code: '3136', description: 'Qatar Airways', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3182': { code: '3182', description: 'LOT Polish Airlines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3245': { code: '3245', description: 'EasyJet', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3246': { code: '3246', description: 'Ryanair', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '3301': { code: '3301', description: 'Wizz Air', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },

  // CAR RENTAL (3351-3441)
  '3381': { code: '3381', description: 'Europcar', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },
  '3389': { code: '3389', description: 'Avis', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },
  '3390': { code: '3390', description: 'Hertz', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },
  '3391': { code: '3391', description: 'Budget Rent-A-Car', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },
  '3393': { code: '3393', description: 'National Car Rental', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },

  // LODGING (3501-3800)
  '3501': { code: '3501', description: 'Holiday Inns', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3502': { code: '3502', description: 'Best Western', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3503': { code: '3503', description: 'Sheraton', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3504': { code: '3504', description: 'Hilton', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3505': { code: '3505', description: 'Ramada', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3506': { code: '3506', description: 'La Quinta', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3507': { code: '3507', description: 'Days Inn', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3508': { code: '3508', description: 'Howard Johnson', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3509': { code: '3509', description: 'Red Roof Inns', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3533': { code: '3533', description: 'Ibis', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3535': { code: '3535', description: 'Marriott', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3543': { code: '3543', description: 'Four Seasons', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3548': { code: '3548', description: 'Melia', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '3640': { code: '3640', description: 'Hyatt', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },

  // TRANSPORTATION (4000-4799)
  '4111': { code: '4111', description: 'Local/Suburban Commuter Passenger Transportation', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Public Transit' },
  '4112': { code: '4112', description: 'Passenger Railways', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Rail' },
  '4119': { code: '4119', description: 'Ambulance Services', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Emergency' },
  '4121': { code: '4121', description: 'Taxicabs and Limousines', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Taxi' },
  '4131': { code: '4131', description: 'Bus Lines', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Bus' },
  '4411': { code: '4411', description: 'Cruise Lines', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Cruise' },
  '4468': { code: '4468', description: 'Marinas, Marine Service', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Marine' },
  '4511': { code: '4511', description: 'Airlines and Air Carriers', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Airlines' },
  '4582': { code: '4582', description: 'Airports, Flying Fields, Airport Terminals', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Airport' },
  '4722': { code: '4722', description: 'Travel Agencies, Tour Operators', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Travel Services' },
  '4784': { code: '4784', description: 'Bridge and Road Fees, Tolls', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Tolls' },
  '4789': { code: '4789', description: 'Transportation Services', category: MCC_CATEGORIES.TRANSPORTATION },
  '4812': { code: '4812', description: 'Telecommunication Equipment', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Telecom Equipment' },
  '4814': { code: '4814', description: 'Telecommunication Services', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Phone Services' },
  '4816': { code: '4816', description: 'Computer Network Services', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Internet' },
  '4821': { code: '4821', description: 'Telegraph Services', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Communication' },
  '4829': { code: '4829', description: 'Wires, Money Orders', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Money Transfer' },
  '4899': { code: '4899', description: 'Cable, Satellite, Pay Television, Radio', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Cable/Satellite' },
  '4900': { code: '4900', description: 'Utilities', category: MCC_CATEGORIES.UTILITIES },

  // RETAIL OUTLETS (5000-5699)
  '5013': { code: '5013', description: 'Motor Vehicle Supplies and New Parts', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Parts' },
  '5021': { code: '5021', description: 'Office and Commercial Furniture', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Office Supplies' },
  '5039': { code: '5039', description: 'Construction Materials', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Construction' },
  '5044': { code: '5044', description: 'Photographic, Photocopy, Microfilm Equipment', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Equipment' },
  '5045': { code: '5045', description: 'Computers, Computer Peripheral Equipment', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Electronics' },
  '5046': { code: '5046', description: 'Commercial Equipment', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Equipment' },
  '5047': { code: '5047', description: 'Medical, Dental, Ophthalmic, Hospital Equipment', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Equipment' },
  '5072': { code: '5072', description: 'Hardware Equipment and Supplies', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Hardware' },
  '5099': { code: '5099', description: 'Durable Goods', category: MCC_CATEGORIES.RETAIL_SHOPPING },
  '5111': { code: '5111', description: 'Stationery, Office Supplies', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Office Supplies' },
  '5139': { code: '5139', description: 'Commercial Footwear', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Footwear' },
  '5169': { code: '5169', description: 'Chemicals and Allied Products', category: MCC_CATEGORIES.BUSINESS },
  '5192': { code: '5192', description: 'Books, Periodicals, Newspapers', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Books' },
  '5199': { code: '5199', description: 'Nondurable Goods', category: MCC_CATEGORIES.RETAIL_SHOPPING },
  '5200': { code: '5200', description: 'Home Supply Warehouse Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Home Improvement' },
  '5211': { code: '5211', description: 'Lumber, Building Materials Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Construction' },
  '5231': { code: '5231', description: 'Glass, Paint, Wallpaper Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Home Improvement' },
  '5251': { code: '5251', description: 'Hardware Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Hardware' },
  '5261': { code: '5261', description: 'Lawn and Garden Supply Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Garden' },
  '5271': { code: '5271', description: 'Mobile Home Dealers', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Real Estate' },
  '5300': { code: '5300', description: 'Wholesale Clubs', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Warehouse Clubs' },
  '5309': { code: '5309', description: 'Duty Free Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Duty Free' },
  '5310': { code: '5310', description: 'Discount Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Discount' },
  '5311': { code: '5311', description: 'Department Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Department' },
  '5331': { code: '5331', description: 'Variety Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Variety' },
  '5399': { code: '5399', description: 'Miscellaneous General Merchandise', category: MCC_CATEGORIES.RETAIL_SHOPPING },
  '5411': { code: '5411', description: 'Grocery Stores, Supermarkets', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Groceries' },
  '5422': { code: '5422', description: 'Freezer and Locker Meat Provisioners', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Meat' },
  '5441': { code: '5441', description: 'Candy, Nut, Confectionery Stores', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Sweets' },
  '5451': { code: '5451', description: 'Dairy Products Stores', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Dairy' },
  '5462': { code: '5462', description: 'Bakeries', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Bakery' },
  '5499': { code: '5499', description: 'Miscellaneous Food Stores, Convenience Stores', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Convenience' },
  '5511': { code: '5511', description: 'Car and Truck Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Dealers' },
  '5521': { code: '5521', description: 'Car and Truck Dealers (Used Only)', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Used Cars' },
  '5532': { code: '5532', description: 'Automotive Tire Stores', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Tires' },
  '5533': { code: '5533', description: 'Automotive Parts and Accessories Stores', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Parts' },
  '5541': { code: '5541', description: 'Service Stations', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Gas Stations' },
  '5542': { code: '5542', description: 'Automated Fuel Dispensers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Gas Stations' },
  '5551': { code: '5551', description: 'Boat Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Boats' },
  '5561': { code: '5561', description: 'Camper, Recreational Vehicle Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'RV' },
  '5571': { code: '5571', description: 'Motorcycle Shops and Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Motorcycles' },
  '5592': { code: '5592', description: 'Motor Homes Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'RV' },
  '5598': { code: '5598', description: 'Snowmobile Dealers', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Recreational' },
  '5599': { code: '5599', description: 'Miscellaneous Automotive, Aircraft, Farm Equipment Dealers', category: MCC_CATEGORIES.AUTOMOTIVE },
  '5611': { code: '5611', description: "Men's and Boy's Clothing and Accessories Stores", category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Clothing' },
  '5621': { code: '5621', description: "Women's Ready-To-Wear Stores", category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Clothing' },
  '5631': { code: '5631', description: "Women's Accessory and Specialty Stores", category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Accessories' },
  '5641': { code: '5641', description: "Children's and Infants' Wear Stores", category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Clothing' },
  '5651': { code: '5651', description: 'Family Clothing Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Clothing' },
  '5655': { code: '5655', description: 'Sports and Riding Apparel Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Sports Apparel' },
  '5661': { code: '5661', description: 'Shoe Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Footwear' },
  '5681': { code: '5681', description: 'Furriers and Fur Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Specialty' },
  '5691': { code: '5691', description: "Men's and Women's Clothing Stores", category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Clothing' },
  '5699': { code: '5699', description: 'Miscellaneous Apparel and Accessory Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Accessories' },

  // HOME AND GARDEN (5712-5999)
  '5712': { code: '5712', description: 'Furniture, Home Furnishings, Equipment Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Furniture' },
  '5713': { code: '5713', description: 'Floor Covering Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Flooring' },
  '5714': { code: '5714', description: 'Drapery, Window Covering, Upholstery Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Window Treatments' },
  '5718': { code: '5718', description: 'Fireplaces, Fireplace Screens, Accessories Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Fireplace' },
  '5719': { code: '5719', description: 'Miscellaneous House Furnishing Specialty Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Home Decor' },
  '5722': { code: '5722', description: 'Household Appliance Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Appliances' },
  '5732': { code: '5732', description: 'Electronics Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Electronics' },
  '5733': { code: '5733', description: 'Music Stores—Musical Instruments, Pianos, Sheet Music', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Music' },
  '5734': { code: '5734', description: 'Computer Software Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Software' },
  '5735': { code: '5735', description: 'Record Stores', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Music' },
  '5811': { code: '5811', description: 'Caterers', category: MCC_CATEGORIES.SERVICES, subcategory: 'Catering' },
  '5812': { code: '5812', description: 'Eating Places, Restaurants', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Restaurants' },
  '5813': { code: '5813', description: 'Drinking Places (Alcoholic Beverages), Bars, Taverns', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Bars' },
  '5814': { code: '5814', description: 'Fast Food Restaurants', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Fast Food' },
  '5815': { code: '5815', description: 'Digital Goods Media – Books, Movies, Music', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Digital Media' },
  '5816': { code: '5816', description: 'Digital Goods – Games', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Games' },
  '5817': { code: '5817', description: 'Digital Goods – Applications (Excluding Games)', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Apps' },
  '5818': { code: '5818', description: 'Digital Goods – Large Digital Goods Merchant', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Digital' },
  '5912': { code: '5912', description: 'Drug Stores and Pharmacies', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Pharmacy' },
  '5921': { code: '5921', description: 'Package Stores-Beer, Wine, Liquor', category: MCC_CATEGORIES.FOOD_DINING, subcategory: 'Alcohol' },
  '5931': { code: '5931', description: 'Used Merchandise, Secondhand Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Used Goods' },
  '5932': { code: '5932', description: 'Antique Reproductions', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Antiques' },
  '5933': { code: '5933', description: 'Pawn Shops', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Pawn' },
  '5940': { code: '5940', description: 'Bicycle Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Bicycles' },
  '5941': { code: '5941', description: 'Sporting Goods Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Sports' },
  '5942': { code: '5942', description: 'Book Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Books' },
  '5943': { code: '5943', description: 'Stationery, Office, School Supply Stores', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Office Supplies' },
  '5944': { code: '5944', description: 'Jewelry Stores, Watches, Clocks, Silverware Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Jewelry' },
  '5945': { code: '5945', description: 'Hobby, Toy, Game Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Toys' },
  '5946': { code: '5946', description: 'Camera and Photographic Supply Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Photography' },
  '5947': { code: '5947', description: 'Gift, Card, Novelty, Souvenir Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Gifts' },
  '5948': { code: '5948', description: 'Leather Goods, Luggage Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Luggage' },
  '5949': { code: '5949', description: 'Fabric, Needlework, Piece Goods, Notions Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Fabric' },
  '5950': { code: '5950', description: 'Glassware, Crystal Stores', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Glassware' },
  '5960': { code: '5960', description: 'Direct Marketing - Insurance Services', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Insurance' },
  '5962': { code: '5962', description: 'Direct Marketing - Travel', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Travel Services' },
  '5963': { code: '5963', description: 'Door-To-Door Sales', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Direct Sales' },
  '5964': { code: '5964', description: 'Direct Marketing - Catalog Merchant', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Catalog' },
  '5965': { code: '5965', description: 'Direct Marketing - Combination Catalog and Retail Merchant', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Catalog' },
  '5966': { code: '5966', description: 'Direct Marketing - Outbound Telemarketing Merchant', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Telemarketing' },
  '5967': { code: '5967', description: 'Direct Marketing - Inbound Telemarketing Merchant', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Telemarketing' },
  '5968': { code: '5968', description: 'Direct Marketing - Continuity/Subscription Merchant', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Subscription' },
  '5969': { code: '5969', description: 'Direct Marketing - Not Elsewhere Classified', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Direct Marketing' },
  '5970': { code: '5970', description: 'Artist Supply, Craft Shops', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Arts & Crafts' },
  '5971': { code: '5971', description: 'Art Dealers and Galleries', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Art' },
  '5972': { code: '5972', description: 'Stamp and Coin Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Collectibles' },
  '5973': { code: '5973', description: 'Religious Goods Stores', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Religious' },
  '5975': { code: '5975', description: 'Hearing Aids Sales and Supplies', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Medical Equipment' },
  '5976': { code: '5976', description: 'Orthopedic Goods, Prosthetic Devices', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Medical Equipment' },
  '5977': { code: '5977', description: 'Cosmetic Stores', category: MCC_CATEGORIES.PERSONAL_CARE, subcategory: 'Cosmetics' },
  '5978': { code: '5978', description: 'Typewriter Stores', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Office Equipment' },
  '5983': { code: '5983', description: 'Fuel Dealers (Fuel Oil, Wood, Coal, Liquefied Petroleum)', category: MCC_CATEGORIES.UTILITIES, subcategory: 'Fuel' },
  '5992': { code: '5992', description: 'Florists', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Flowers' },
  '5993': { code: '5993', description: 'Cigar Stores and Stands', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Tobacco' },
  '5994': { code: '5994', description: 'News Dealers and Newsstands', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'News' },
  '5995': { code: '5995', description: 'Pet Shops, Pet Food, Supplies', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Pets' },
  '5996': { code: '5996', description: 'Swimming Pools Sales, Supplies', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Pool' },
  '5997': { code: '5997', description: 'Electric Razor Stores', category: MCC_CATEGORIES.PERSONAL_CARE, subcategory: 'Personal Care' },
  '5998': { code: '5998', description: 'Tent and Awning Shops', category: MCC_CATEGORIES.HOME_GARDEN, subcategory: 'Outdoor' },
  '5999': { code: '5999', description: 'Miscellaneous Specialty Retail', category: MCC_CATEGORIES.RETAIL_SHOPPING },

  // CONTRACTED SERVICES (6000-6513)
  '6010': { code: '6010', description: 'Manual Cash Disburse', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'ATM' },
  '6011': { code: '6011', description: 'Automated Cash Disburse', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'ATM' },
  '6012': { code: '6012', description: 'Financial Institutions', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Banking' },
  '6050': { code: '6050', description: 'Quasi Cash Merchant', category: MCC_CATEGORIES.FINANCIAL },
  '6051': { code: '6051', description: 'Non-FI, Money Orders', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Money Orders' },
  '6300': { code: '6300', description: 'Insurance', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Insurance' },
  '6513': { code: '6513', description: 'Real Estate Agents, Property Managers', category: MCC_CATEGORIES.SERVICES, subcategory: 'Real Estate' },

  // BUSINESS SERVICES (7000-7699)
  '7011': { code: '7011', description: 'Hotels, Motels, Inns, Resorts', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Hotels' },
  '7032': { code: '7032', description: 'Sporting/Recreation Camps', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Camps' },
  '7033': { code: '7033', description: 'Trailer Parks, Campgrounds', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Camping' },
  '7210': { code: '7210', description: 'Laundry, Cleaning Services', category: MCC_CATEGORIES.SERVICES, subcategory: 'Cleaning' },
  '7211': { code: '7211', description: 'Laundries', category: MCC_CATEGORIES.SERVICES, subcategory: 'Laundry' },
  '7216': { code: '7216', description: 'Dry Cleaners', category: MCC_CATEGORIES.SERVICES, subcategory: 'Dry Cleaning' },
  '7217': { code: '7217', description: 'Carpet and Upholstery Cleaning', category: MCC_CATEGORIES.SERVICES, subcategory: 'Cleaning' },
  '7221': { code: '7221', description: 'Photographic Studios', category: MCC_CATEGORIES.SERVICES, subcategory: 'Photography' },
  '7230': { code: '7230', description: 'Barber and Beauty Shops', category: MCC_CATEGORIES.PERSONAL_CARE, subcategory: 'Hair & Beauty' },
  '7251': { code: '7251', description: 'Shoe Repair/Hat Cleaning', category: MCC_CATEGORIES.SERVICES, subcategory: 'Repair' },
  '7261': { code: '7261', description: 'Funeral Services, Crematories', category: MCC_CATEGORIES.SERVICES, subcategory: 'Funeral' },
  '7273': { code: '7273', description: 'Dating/Escort Services', category: MCC_CATEGORIES.SERVICES, subcategory: 'Personal' },
  '7276': { code: '7276', description: 'Tax Preparation Services', category: MCC_CATEGORIES.SERVICES, subcategory: 'Tax' },
  '7277': { code: '7277', description: 'Debt Counseling Services', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Credit Counseling' },
  '7278': { code: '7278', description: 'Buying/Shopping Clubs, Services', category: MCC_CATEGORIES.RETAIL_SHOPPING, subcategory: 'Shopping Services' },
  '7295': { code: '7295', description: 'Baby Care Services', category: MCC_CATEGORIES.SERVICES, subcategory: 'Childcare' },
  '7296': { code: '7296', description: 'Clothing Rental', category: MCC_CATEGORIES.SERVICES, subcategory: 'Rental' },
  '7297': { code: '7297', description: 'Massage Parlors', category: MCC_CATEGORIES.PERSONAL_CARE, subcategory: 'Massage' },
  '7298': { code: '7298', description: 'Health and Beauty Spas', category: MCC_CATEGORIES.PERSONAL_CARE, subcategory: 'Spa' },
  '7299': { code: '7299', description: 'Miscellaneous Personal Services', category: MCC_CATEGORIES.SERVICES },
  '7311': { code: '7311', description: 'Advertising Services', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Advertising' },
  '7321': { code: '7321', description: 'Consumer Credit Reporting Agencies', category: MCC_CATEGORIES.FINANCIAL, subcategory: 'Credit Services' },
  '7333': { code: '7333', description: 'Commercial Photography, Art, Graphics', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Creative Services' },
  '7338': { code: '7338', description: 'Quick Copy, Reprography, Blueprinting', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Printing' },
  '7349': { code: '7349', description: 'Cleaning and Maintenance', category: MCC_CATEGORIES.SERVICES, subcategory: 'Cleaning' },
  '7361': { code: '7361', description: 'Employment/Temp Agencies', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Employment' },
  '7372': { code: '7372', description: 'Computer Programming', category: MCC_CATEGORIES.BUSINESS, subcategory: 'IT Services' },
  '7375': { code: '7375', description: 'Information Retrieval Services', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Information Services' },
  '7379': { code: '7379', description: 'Computer Maintenance and Repair', category: MCC_CATEGORIES.BUSINESS, subcategory: 'IT Services' },
  '7392': { code: '7392', description: 'Consulting, Public Relations', category: MCC_CATEGORIES.BUSINESS, subcategory: 'Consulting' },
  '7393': { code: '7393', description: 'Detective Agencies', category: MCC_CATEGORIES.SERVICES, subcategory: 'Security' },
  '7394': { code: '7394', description: 'Equipment Rental', category: MCC_CATEGORIES.SERVICES, subcategory: 'Rental' },
  '7395': { code: '7395', description: 'Photo Developing', category: MCC_CATEGORIES.SERVICES, subcategory: 'Photography' },
  '7399': { code: '7399', description: 'Miscellaneous Business Services', category: MCC_CATEGORIES.BUSINESS },
  '7512': { code: '7512', description: 'Automobile Rental Agency', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'Car Rental' },
  '7513': { code: '7513', description: 'Truck/Utility Trailer Rental', category: MCC_CATEGORIES.SERVICES, subcategory: 'Vehicle Rental' },
  '7519': { code: '7519', description: 'Recreational Vehicle Rental', category: MCC_CATEGORIES.TRAVEL_LODGING, subcategory: 'RV Rental' },
  '7523': { code: '7523', description: 'Parking Lots, Garages', category: MCC_CATEGORIES.TRANSPORTATION, subcategory: 'Parking' },
  '7534': { code: '7534', description: 'Tire Retreading and Repair', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Tire Services' },
  '7535': { code: '7535', description: 'Auto Paint Shops', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Auto Services' },
  '7538': { code: '7538', description: 'Auto Service Shops', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Auto Services' },
  '7542': { code: '7542', description: 'Car Washes', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Car Wash' },
  '7549': { code: '7549', description: 'Towing Services', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Towing' },
  '7622': { code: '7622', description: 'Electronics Repair Shops', category: MCC_CATEGORIES.SERVICES, subcategory: 'Electronics Repair' },
  '7623': { code: '7623', description: 'A/C, Refrigeration Repair', category: MCC_CATEGORIES.SERVICES, subcategory: 'Appliance Repair' },
  '7629': { code: '7629', description: 'Small Appliance Repair', category: MCC_CATEGORIES.SERVICES, subcategory: 'Appliance Repair' },
  '7631': { code: '7631', description: 'Watch, Jewelry Repair', category: MCC_CATEGORIES.SERVICES, subcategory: 'Jewelry Repair' },
  '7641': { code: '7641', description: 'Furniture Repair, Refinishing', category: MCC_CATEGORIES.SERVICES, subcategory: 'Furniture Repair' },
  '7692': { code: '7692', description: 'Welding Repair', category: MCC_CATEGORIES.SERVICES, subcategory: 'Welding' },
  '7699': { code: '7699', description: 'Miscellaneous Repair Shops', category: MCC_CATEGORIES.SERVICES, subcategory: 'Repair' },

  // ENTERTAINMENT SERVICES (7800-7999)
  '7800': { code: '7800', description: 'Government Lottery', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Gambling' },
  '7801': { code: '7801', description: 'Internet Gambling', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Gambling' },
  '7802': { code: '7802', description: 'Horse/Dog Racing', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Gambling' },
  '7829': { code: '7829', description: 'Motion Picture/Video Tape Production', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Media Production' },
  '7832': { code: '7832', description: 'Motion Picture Theaters', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Movies' },
  '7841': { code: '7841', description: 'Video Tape Rental Stores', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Video Rental' },
  '7911': { code: '7911', description: 'Dance Halls, Studios, Schools', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Dance' },
  '7922': { code: '7922', description: 'Theatrical Ticket Agencies', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Tickets' },
  '7929': { code: '7929', description: 'Bands, Orchestras', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Music' },
  '7932': { code: '7932', description: 'Pool and Billiard Halls', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Pool Halls' },
  '7933': { code: '7933', description: 'Bowling Alleys', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Bowling' },
  '7941': { code: '7941', description: 'Commercial Sports, Professional Sports Clubs', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Sports' },
  '7991': { code: '7991', description: 'Tourist Attractions and Exhibits', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Attractions' },
  '7992': { code: '7992', description: 'Golf Courses - Public', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Golf' },
  '7993': { code: '7993', description: 'Video Amusement Game Supplies', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Games' },
  '7994': { code: '7994', description: 'Video Game Arcades', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Arcades' },
  '7995': { code: '7995', description: 'Betting/Casino Gambling', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Gambling' },
  '7996': { code: '7996', description: 'Amusement Parks, Carnivals', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Amusement Parks' },
  '7997': { code: '7997', description: 'Country Clubs', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Clubs' },
  '7998': { code: '7998', description: 'Aquariums, Zoos, Dolphinariums', category: MCC_CATEGORIES.ENTERTAINMENT, subcategory: 'Zoos' },
  '7999': { code: '7999', description: 'Recreation Services', category: MCC_CATEGORIES.ENTERTAINMENT },

  // PROFESSIONAL SERVICES (8000-8999)
  '8011': { code: '8011', description: 'Doctors', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Physicians' },
  '8021': { code: '8021', description: 'Dentists, Orthodontists', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Dental' },
  '8031': { code: '8031', description: 'Osteopaths', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Specialists' },
  '8041': { code: '8041', description: 'Chiropractors', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Chiropractic' },
  '8042': { code: '8042', description: 'Optometrists, Ophthalmologists', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Eye Care' },
  '8043': { code: '8043', description: 'Opticians, Eyeglasses', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Eye Care' },
  '8049': { code: '8049', description: 'Podiatrists, Chiropodists', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Specialists' },
  '8050': { code: '8050', description: 'Nursing/Personal Care', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Nursing' },
  '8062': { code: '8062', description: 'Hospitals', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Hospitals' },
  '8071': { code: '8071', description: 'Medical and Dental Labs', category: MCC_CATEGORIES.HEALTHCARE, subcategory: 'Labs' },
  '8099': { code: '8099', description: 'Medical Services', category: MCC_CATEGORIES.HEALTHCARE },
  '8111': { code: '8111', description: 'Legal Services, Attorneys', category: MCC_CATEGORIES.SERVICES, subcategory: 'Legal' },
  '8220': { code: '8220', description: 'Colleges, Universities', category: MCC_CATEGORIES.EDUCATION, subcategory: 'Higher Education' },
  '8244': { code: '8244', description: 'Schools, Business and Secretarial', category: MCC_CATEGORIES.EDUCATION, subcategory: 'Business Schools' },
  '8249': { code: '8249', description: 'Schools, Trade/Vocational', category: MCC_CATEGORIES.EDUCATION, subcategory: 'Trade Schools' },
  '8299': { code: '8299', description: 'Schools and Educational Services', category: MCC_CATEGORIES.EDUCATION },
  '8398': { code: '8398', description: 'Charitable and Social Service Organizations', category: MCC_CATEGORIES.CHARITY },
  '8641': { code: '8641', description: 'Civic, Social, Fraternal Associations', category: MCC_CATEGORIES.CHARITY, subcategory: 'Associations' },
  '8651': { code: '8651', description: 'Political Organizations', category: MCC_CATEGORIES.CHARITY, subcategory: 'Political' },
  '8661': { code: '8661', description: 'Religious Organizations', category: MCC_CATEGORIES.CHARITY, subcategory: 'Religious' },
  '8675': { code: '8675', description: 'Automobile Associations', category: MCC_CATEGORIES.AUTOMOTIVE, subcategory: 'Auto Associations' },
  '8699': { code: '8699', description: 'Membership Organizations', category: MCC_CATEGORIES.CHARITY },
  '8931': { code: '8931', description: 'Accounting/Bookkeeping Services', category: MCC_CATEGORIES.SERVICES, subcategory: 'Accounting' },
  '8999': { code: '8999', description: 'Professional Services', category: MCC_CATEGORIES.SERVICES },

  // GOVERNMENT SERVICES (9000-9999)
  '9211': { code: '9211', description: 'Court Costs, Alimony, Child Support', category: MCC_CATEGORIES.GOVERNMENT, subcategory: 'Court Fees' },
  '9222': { code: '9222', description: 'Fines - Government Administrative Entities', category: MCC_CATEGORIES.GOVERNMENT, subcategory: 'Fines' },
  '9311': { code: '9311', description: 'Tax Payments - Government Administrative Entities', category: MCC_CATEGORIES.GOVERNMENT, subcategory: 'Taxes' },
  '9399': { code: '9399', description: 'Government Services', category: MCC_CATEGORIES.GOVERNMENT },
  '9401': { code: '9401', description: 'Intra-Government Purchases', category: MCC_CATEGORIES.GOVERNMENT },
  '9402': { code: '9402', description: 'Postal Services - Government Only', category: MCC_CATEGORIES.GOVERNMENT, subcategory: 'Postal' },
  '9405': { code: '9405', description: 'U.S. Federal Government Agencies or Departments', category: MCC_CATEGORIES.GOVERNMENT, subcategory: 'Federal' }
};

// Helper function to get category for an MCC code
export function getMCCCategory(mccCode: string): MCCCategory {
  // Remove any country prefixes or extra characters
  const cleanCode = mccCode.replace(/^[A-Z]+,?/, '').trim();
  
  return MCC_MAPPING[cleanCode] || inferMCCCategory(cleanCode);
}

// Infer category based on code range for unknown MCCs
function inferMCCCategory(mccCode: string): MCCCategory {
  const code = parseInt(mccCode);
  
  if (isNaN(code)) {
    return {
      code: mccCode,
      description: 'Unknown Merchant Category',
      category: MCC_CATEGORIES.OTHER
    };
  }

  // MCC range-based inference
  if (code >= 1 && code <= 1499) {
    return {
      code: mccCode,
      description: 'Agricultural Services',
      category: MCC_CATEGORIES.BUSINESS
    };
  } else if (code >= 1500 && code <= 2999) {
    return {
      code: mccCode,
      description: 'Contracted Services',
      category: MCC_CATEGORIES.SERVICES
    };
  } else if (code >= 3000 && code <= 3299) {
    return {
      code: mccCode,
      description: 'Airlines',
      category: MCC_CATEGORIES.TRAVEL_LODGING,
      subcategory: 'Airlines'
    };
  } else if (code >= 3351 && code <= 3441) {
    return {
      code: mccCode,
      description: 'Car Rental',
      category: MCC_CATEGORIES.TRAVEL_LODGING,
      subcategory: 'Car Rental'
    };
  } else if (code >= 3501 && code <= 3999) {
    return {
      code: mccCode,
      description: 'Lodging/Hotels',
      category: MCC_CATEGORIES.TRAVEL_LODGING,
      subcategory: 'Hotels'
    };
  } else if (code >= 4000 && code <= 4799) {
    return {
      code: mccCode,
      description: 'Transportation Services',
      category: MCC_CATEGORIES.TRANSPORTATION
    };
  } else if (code >= 4800 && code <= 4999) {
    return {
      code: mccCode,
      description: 'Utility Services',
      category: MCC_CATEGORIES.UTILITIES
    };
  } else if (code >= 5000 && code <= 5599) {
    return {
      code: mccCode,
      description: 'Retail Outlet Services',
      category: MCC_CATEGORIES.RETAIL_SHOPPING
    };
  } else if (code >= 5600 && code <= 5699) {
    return {
      code: mccCode,
      description: 'Clothing Stores',
      category: MCC_CATEGORIES.RETAIL_SHOPPING,
      subcategory: 'Clothing'
    };
  } else if (code >= 5700 && code <= 5799) {
    return {
      code: mccCode,
      description: 'Miscellaneous Stores',
      category: MCC_CATEGORIES.RETAIL_SHOPPING
    };
  } else if (code >= 5800 && code <= 5999) {
    return {
      code: mccCode,
      description: 'Restaurants/Food Services',
      category: MCC_CATEGORIES.FOOD_DINING
    };
  } else if (code >= 6000 && code <= 6999) {
    return {
      code: mccCode,
      description: 'Financial Services',
      category: MCC_CATEGORIES.FINANCIAL
    };
  } else if (code >= 7000 && code <= 7299) {
    return {
      code: mccCode,
      description: 'Business Services',
      category: MCC_CATEGORIES.BUSINESS
    };
  } else if (code >= 7300 && code <= 7699) {
    return {
      code: mccCode,
      description: 'Personal Services',
      category: MCC_CATEGORIES.SERVICES
    };
  } else if (code >= 7800 && code <= 7999) {
    return {
      code: mccCode,
      description: 'Recreation/Entertainment Services',
      category: MCC_CATEGORIES.ENTERTAINMENT
    };
  } else if (code >= 8000 && code <= 8999) {
    return {
      code: mccCode,
      description: 'Professional Services',
      category: MCC_CATEGORIES.SERVICES
    };
  } else if (code >= 9000 && code <= 9999) {
    return {
      code: mccCode,
      description: 'Government Services',
      category: MCC_CATEGORIES.GOVERNMENT
    };
  }

  return {
    code: mccCode,
    description: 'Unknown Merchant Category',
    category: MCC_CATEGORIES.OTHER
  };
}

// Helper function to get all codes by category
export function getMCCsByCategory(category: string): MCCCategory[] {
  return Object.values(MCC_MAPPING).filter(mcc => mcc.category === category);
}

// Get all available categories
export function getAllCategories(): string[] {
  return Object.values(MCC_CATEGORIES);
}

// Get category statistics from mapping
export function getMCCCategoryStats() {
  const categories = Object.values(MCC_CATEGORIES);
  return categories.map(category => ({
    category,
    codes: getMCCsByCategory(category),
    codeCount: getMCCsByCategory(category).length
  })).sort((a, b) => b.codeCount - a.codeCount);
}
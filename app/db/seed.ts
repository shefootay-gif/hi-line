import { getDb } from "../api/queries/connection";
import {
  products,
  categories,
  faqs,
  storeSettings,
  paymentSettings,
  shippingSettings,
} from "./schema";

async function seed() {
  const db = getDb();

  console.log("Seeding database...");

  // Seed categories
  await db
    .insert(categories)
    .values([
      {
        nameEn: "All Products",
        nameAr: "ظƒظ„ ط§ظ„ظ…ظ†طھط¬ط§طھ",
        slug: "all-products",
        sortOrder: 0,
      },
      {
        nameEn: "Deodorant Roll On",
        nameAr: "ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚",
        slug: "deodorant-roll-on",
        sortOrder: 1,
      },
      {
        nameEn: "Fresh Scents",
        nameAr: "ط±ظˆط§ط¦ط­ ظ…ظ†ط¹ط´ط©",
        slug: "fresh-scents",
        sortOrder: 2,
      },
      {
        nameEn: "Fruity Scents",
        nameAr: "ط±ظˆط§ط¦ط­ ظپظˆط§ظƒظ‡",
        slug: "fruity-scents",
        sortOrder: 3,
      },
      {
        nameEn: "Fragrance Free",
        nameAr: "ط¨ط¯ظˆظ† ط¹ط·ط±",
        slug: "fragrance-free",
        sortOrder: 4,
      },
      {
        nameEn: "Summer Collection",
        nameAr: "ظ…ط¬ظ…ظˆط¹ط© ط§ظ„طµظٹظپ",
        slug: "summer-collection",
        sortOrder: 5,
      },
      {
        nameEn: "Best Sellers",
        nameAr: "ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ظ‹ط§",
        slug: "best-sellers",
        sortOrder: 6,
      },
      {
        nameEn: "Offers",
        nameAr: "ط§ظ„ط¹ط±ظˆط¶",
        slug: "offers",
        sortOrder: 7,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Categories seeded");

  // Seed products
  await db
    .insert(products)
    .values([
      {
        nameEn: "Hi Line Deodorant Roll On - Tropical Breeze",
        nameAr: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ - طھط±ظˆط¨ظٹظƒط§ظ„ ط¨ط±ظٹط²",
        slug: "hi-line-deodorant-roll-on-tropical-breeze",
        descriptionEn:
          "Experience the refreshing sensation of Tropical Breeze. This Hi Line Deodorant Roll On delivers up to 48 hours of protection with our exclusive Lebanese Formula. 0% Aluminum for a clean, healthy care routine. The tropical scent transports you to paradise with every application.",
        descriptionAr:
          "ط¬ط±ط¨ ط§ظ„ط¥ط­ط³ط§ط³ ط§ظ„ظ…ظ†ط¹ط´ ظ„طھط±ظˆط¨ظٹظƒط§ظ„ ط¨ط±ظٹط². ظٹظ‚ط¯ظ… ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط§ظ„ط¹ط±ظ‚ ط­ظ…ط§ظٹط© طھطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط© ط¨ظپط¶ظ„ طھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ظ„ط¨ظ†ط§ظ†ظٹط© ط§ظ„ط­طµط±ظٹط©. 0% ط£ظ„ظ…ظ†ظٹظˆظ… ظ„ط±ظˆطھظٹظ† ظ†ط¸ظٹظپ ظˆطµط­ظٹ. ط§ظ„ط±ط§ط¦ط­ط© ط§ظ„ط§ط³طھظˆط§ط¦ظٹط© طھظ†ظ‚ظ„ظƒ ط¥ظ„ظ‰ ط§ظ„ط¬ظ†ط© ظ…ط¹ ظƒظ„ ط§ط³طھط®ط¯ط§ظ….",
        shortDescriptionEn: "Up to 48h protection with tropical freshness",
        shortDescriptionAr: "ط­ظ…ط§ظٹط© طھطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط© ط¨ط§ظ†طھط¹ط§ط´ ط§ط³طھظˆط§ط¦ظٹ",
        price: "85.00",
        salePrice: null,
        stock: 100,
        sku: "HL-TB-001",
        scent: "Tropical Breeze",
        scentColor: "#159C73",
        categoryId: 2,
        images: ["/products/tropical-breeze.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "ط§ظ†طھط¹ط§ط´ ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©",
          "طھط±ظƒظٹط¨ط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ…",
          "طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©",
          "طھط·ط¨ظٹظ‚ ط³ظ„ط³ ط¨ط§ظ„ط±ظˆظ„",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Aloe Vera Extract",
        ingredientsAr:
          "ظ…ط§ط،طŒ ط¨ط±ظˆط¨ظٹظ„ظٹظ† ط¬ظ„ظٹظƒظˆظ„طŒ ط¬ظ„ظٹط³ط±ظٹظ†طŒ ط¹ط·ط±طŒ ط³طھظٹط±ط§طھ ط§ظ„طµظˆط¯ظٹظˆظ…طŒ ط³ظٹطھظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ ط³طھظٹط±ظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ طھظˆظƒظˆظپظٹط±ظٹظ„ ط£ط³ظٹطھط§طھ (ظپظٹطھط§ظ…ظٹظ† ظ‡ظ€)طŒ ظ…ط³طھط®ظ„طµ ط§ظ„ط£ظ„ظˆظپظٹط±ط§",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "ط±ط¬ ط¬ظٹط¯ط§ظ‹ ظ‚ط¨ظ„ ط§ظ„ط§ط³طھط®ط¯ط§ظ…. ط¶ط¹ ط¹ظ„ظ‰ ط§ظ„ط¥ط¨ط·ظٹظ† ط§ظ„ظ†ط¸ظٹظپظٹظ† ظˆط§ظ„ط¬ط§ظپظٹظ†. ط§طھط±ظƒ ط­طھظ‰ ظٹط¬ظپ ظ‚ط¨ظ„ ط§ط±طھط¯ط§ط، ط§ظ„ظ…ظ„ط§ط¨ط³. ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„ظ†طھط§ط¦ط¬طŒ ط§ط³طھط®ط¯ظ… ظٹظˆظ…ظٹط§ظ‹.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Tropical Breeze - 48h Protection",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Tropical Breeze. 48 hours protection, 0% Aluminum, Lebanese Formula. Fresh tropical scent for daily confidence.",
        relatedProducts: [2, 3, 4],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Voyage",
        nameAr: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ - ظپظˆظٹط§ط¬",
        slug: "hi-line-deodorant-roll-on-voyage",
        descriptionEn:
          "Set sail with Voyage. This sophisticated scent combines oceanic freshness with our trusted Lebanese Formula. Enjoy up to 48 hours of aluminum-free protection that keeps you feeling fresh through every adventure.",
        descriptionAr:
          "ط§ظ†ط·ظ„ظ‚ ظپظٹ ط±ط­ظ„ط© ظ…ط¹ ظپظˆظٹط§ط¬. طھط¬ظ…ط¹ ظ‡ط°ظ‡ ط§ظ„ط±ط§ط¦ط­ط© ط§ظ„ظ…طھط·ظˆط±ط© ط¨ظٹظ† ط§ظ†طھط¹ط§ط´ ط§ظ„ظ…ط­ظٹط· ظˆطھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ظ„ط¨ظ†ط§ظ†ظٹط© ط§ظ„ظ…ظˆط«ظˆظ‚ط©. ط§ط³طھظ…طھط¹ ط¨ط­ظ…ط§ظٹط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ… طھطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط© طھط¨ظ‚ظٹظƒ ظ…ظ†طھط¹ط´ط§ظ‹ ط®ظ„ط§ظ„ ظƒظ„ ظ…ط؛ط§ظ…ط±ط©.",
        shortDescriptionEn: "Ocean-fresh protection for the modern explorer",
        shortDescriptionAr: "ط­ظ…ط§ظٹط© ظ…ظ†طھط¹ط´ط© ظƒط§ظ„ظ…ط­ظٹط· ظ„ظ„ظ…ط³طھظƒط´ظپ ط§ظ„ط¹طµط±ظٹ",
        price: "85.00",
        salePrice: null,
        stock: 100,
        sku: "HL-VG-002",
        scent: "Voyage",
        scentColor: "#1E6D9E",
        categoryId: 2,
        images: ["/products/voyage.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "ط§ظ†طھط¹ط§ط´ ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©",
          "طھط±ظƒظٹط¨ط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ…",
          "طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©",
          "طھط·ط¨ظٹظ‚ ط³ظ„ط³ ط¨ط§ظ„ط±ظˆظ„",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Sea Salt Extract",
        ingredientsAr:
          "ظ…ط§ط،طŒ ط¨ط±ظˆط¨ظٹظ„ظٹظ† ط¬ظ„ظٹظƒظˆظ„طŒ ط¬ظ„ظٹط³ط±ظٹظ†طŒ ط¹ط·ط±طŒ ط³طھظٹط±ط§طھ ط§ظ„طµظˆط¯ظٹظˆظ…طŒ ط³ظٹطھظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ ط³طھظٹط±ظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ طھظˆظƒظˆظپظٹط±ظٹظ„ ط£ط³ظٹطھط§طھ (ظپظٹطھط§ظ…ظٹظ† ظ‡ظ€)طŒ ظ…ط³طھط®ظ„طµ ظ…ظ„ط­ ط§ظ„ط¨ط­ط±",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "ط±ط¬ ط¬ظٹط¯ط§ظ‹ ظ‚ط¨ظ„ ط§ظ„ط§ط³طھط®ط¯ط§ظ…. ط¶ط¹ ط¹ظ„ظ‰ ط§ظ„ط¥ط¨ط·ظٹظ† ط§ظ„ظ†ط¸ظٹظپظٹظ† ظˆط§ظ„ط¬ط§ظپظٹظ†. ط§طھط±ظƒ ط­طھظ‰ ظٹط¬ظپ ظ‚ط¨ظ„ ط§ط±طھط¯ط§ط، ط§ظ„ظ…ظ„ط§ط¨ط³. ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„ظ†طھط§ط¦ط¬طŒ ط§ط³طھط®ط¯ظ… ظٹظˆظ…ظٹط§ظ‹.",
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        seoTitle: "Hi Line Deodorant Roll On Voyage - Ocean Fresh Scent",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Voyage. Ocean fresh scent with 48h protection. 0% Aluminum, Lebanese Formula. Perfect for daily freshness.",
        relatedProducts: [1, 3, 5],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Candy Pop",
        nameAr: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ - ظƒط§ظ†ط¯ظٹ ط¨ظˆط¨",
        slug: "hi-line-deodorant-roll-on-candy-pop",
        descriptionEn:
          "Sweet, playful, and irresistibly fresh. Candy Pop brings a burst of joyful fragrance with our signature Lebanese Formula. Up to 48 hours of aluminum-free protection wrapped in a delightful candy-inspired scent.",
        descriptionAr:
          "ط­ظ„ظˆطŒ ظ…ط±ط­طŒ ظˆظ…ظ†ط¹ط´ ط¨ط´ظƒظ„ ظ„ط§ ظٹظ‚ط§ظˆظ…. طھط¬ظ„ط¨ ظƒط§ظ†ط¯ظٹ ط¨ظˆط¨ ط§ظ†ط¯ظپط§ط¹ط© ظ…ظ† ط§ظ„ط¹ط·ط± ط§ظ„ظ…ط¨ظ‡ط¬ ظ…ط¹ طھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ظ„ط¨ظ†ط§ظ†ظٹط© ط§ظ„ظ…ظ…ظٹط²ط©. ط­ظ…ط§ظٹط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ… طھطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط© ظ…ط؛ظ„ظپط© ط¨ط±ط§ط¦ط­ط© ط­ظ„ظˆظ‰ ط´ظ‡ظٹط©.",
        shortDescriptionEn: "Playful sweetness with long-lasting freshness",
        shortDescriptionAr: "ط­ظ„ط§ظˆط© ظ…ط±ط­ط© ظ…ط¹ ط§ظ†طھط¹ط§ط´ ط·ظˆظٹظ„ ط§ظ„ط£ظ…ط¯",
        price: "85.00",
        salePrice: null,
        stock: 100,
        sku: "HL-CP-003",
        scent: "Candy Pop",
        scentColor: "#C85BAA",
        categoryId: 2,
        images: ["/products/candy-pop.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "ط§ظ†طھط¹ط§ط´ ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©",
          "طھط±ظƒظٹط¨ط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ…",
          "طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©",
          "طھط·ط¨ظٹظ‚ ط³ظ„ط³ ط¨ط§ظ„ط±ظˆظ„",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Berry Extract",
        ingredientsAr:
          "ظ…ط§ط،طŒ ط¨ط±ظˆط¨ظٹظ„ظٹظ† ط¬ظ„ظٹظƒظˆظ„طŒ ط¬ظ„ظٹط³ط±ظٹظ†طŒ ط¹ط·ط±طŒ ط³طھظٹط±ط§طھ ط§ظ„طµظˆط¯ظٹظˆظ…طŒ ط³ظٹطھظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ ط³طھظٹط±ظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ طھظˆظƒظˆظپظٹط±ظٹظ„ ط£ط³ظٹطھط§طھ (ظپظٹطھط§ظ…ظٹظ† ظ‡ظ€)طŒ ظ…ط³طھط®ظ„طµ ط§ظ„طھظˆطھ",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "ط±ط¬ ط¬ظٹط¯ط§ظ‹ ظ‚ط¨ظ„ ط§ظ„ط§ط³طھط®ط¯ط§ظ…. ط¶ط¹ ط¹ظ„ظ‰ ط§ظ„ط¥ط¨ط·ظٹظ† ط§ظ„ظ†ط¸ظٹظپظٹظ† ظˆط§ظ„ط¬ط§ظپظٹظ†. ط§طھط±ظƒ ط­طھظ‰ ظٹط¬ظپ ظ‚ط¨ظ„ ط§ط±طھط¯ط§ط، ط§ظ„ظ…ظ„ط§ط¨ط³. ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„ظ†طھط§ط¦ط¬طŒ ط§ط³طھط®ط¯ظ… ظٹظˆظ…ظٹط§ظ‹.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Candy Pop - Sweet Freshness",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Candy Pop. Sweet playful scent with 48h protection. 0% Aluminum, Lebanese Formula. Daily freshness guaranteed.",
        relatedProducts: [1, 2, 4],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Sweet Mango",
        nameAr: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ - ط³ظˆظٹطھ ظ…ط§ظ†ط¬ظˆ",
        slug: "hi-line-deodorant-roll-on-sweet-mango",
        descriptionEn:
          "Indulge in the tropical sweetness of Sweet Mango. This vibrant scent combines juicy mango notes with our proven Lebanese Formula for up to 48 hours of aluminum-free freshness. A summer favorite!",
        descriptionAr:
          "ط§ط³طھظ…طھط¹ ط¨ط­ظ„ط§ظˆط© ط§ظ„ظ…ط§ظ†ط¬ظˆ ط§ظ„ط§ط³طھظˆط§ط¦ظٹط© ظ…ط¹ ط³ظˆظٹطھ ظ…ط§ظ†ط¬ظˆ. طھط¬ظ…ط¹ ظ‡ط°ظ‡ ط§ظ„ط±ط§ط¦ط­ط© ط§ظ„ظ†ط§ط¨ط¶ط© ط¨ظٹظ† ظ†ط؛ظ…ط§طھ ط§ظ„ظ…ط§ظ†ط¬ظˆ ط§ظ„ط¹طµظٹط±ظٹط© ظˆطھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ظ„ط¨ظ†ط§ظ†ظٹط© ط§ظ„ظ…ط«ط¨طھط© ظ„ط§ظ†طھط¹ط§ط´ ط®ط§ظ„ظٹ ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ… ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©. ط§ظ„ظ…ظپط¶ظ„ ظپظٹ ط§ظ„طµظٹظپ!",
        shortDescriptionEn: "Tropical mango freshness for sunny days",
        shortDescriptionAr: "ط§ظ†طھط¹ط§ط´ ط§ظ„ظ…ط§ظ†ط¬ظˆ ط§ظ„ط§ط³طھظˆط§ط¦ظٹ ظ„ط£ظٹط§ظ… ظ…ط´ظ…ط³ط©",
        price: "85.00",
        salePrice: null,
        stock: 100,
        sku: "HL-SM-004",
        scent: "Sweet Mango",
        scentColor: "#F28A24",
        categoryId: 2,
        images: ["/products/sweet-mango.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "ط§ظ†طھط¹ط§ط´ ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©",
          "طھط±ظƒظٹط¨ط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ…",
          "طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©",
          "طھط·ط¨ظٹظ‚ ط³ظ„ط³ ط¨ط§ظ„ط±ظˆظ„",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Mango Extract",
        ingredientsAr:
          "ظ…ط§ط،طŒ ط¨ط±ظˆط¨ظٹظ„ظٹظ† ط¬ظ„ظٹظƒظˆظ„طŒ ط¬ظ„ظٹط³ط±ظٹظ†طŒ ط¹ط·ط±طŒ ط³طھظٹط±ط§طھ ط§ظ„طµظˆط¯ظٹظˆظ…طŒ ط³ظٹطھظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ ط³طھظٹط±ظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ طھظˆظƒظˆظپظٹط±ظٹظ„ ط£ط³ظٹطھط§طھ (ظپظٹطھط§ظ…ظٹظ† ظ‡ظ€)طŒ ظ…ط³طھط®ظ„طµ ط§ظ„ظ…ط§ظ†ط¬ظˆ",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "ط±ط¬ ط¬ظٹط¯ط§ظ‹ ظ‚ط¨ظ„ ط§ظ„ط§ط³طھط®ط¯ط§ظ…. ط¶ط¹ ط¹ظ„ظ‰ ط§ظ„ط¥ط¨ط·ظٹظ† ط§ظ„ظ†ط¸ظٹظپظٹظ† ظˆط§ظ„ط¬ط§ظپظٹظ†. ط§طھط±ظƒ ط­طھظ‰ ظٹط¬ظپ ظ‚ط¨ظ„ ط§ط±طھط¯ط§ط، ط§ظ„ظ…ظ„ط§ط¨ط³. ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„ظ†طھط§ط¦ط¬طŒ ط§ط³طھط®ط¯ظ… ظٹظˆظ…ظٹط§ظ‹.",
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        seoTitle: "Hi Line Deodorant Roll On Sweet Mango - Tropical Freshness",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Sweet Mango. Tropical mango scent with 48h protection. 0% Aluminum, Lebanese Formula. Summer essential!",
        relatedProducts: [1, 3, 5],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Fragrance Free",
        nameAr: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ - ط¨ط¯ظˆظ† ط¹ط·ط±",
        slug: "hi-line-deodorant-roll-on-fragrance-free",
        descriptionEn:
          "Pure protection without the scent. Our Fragrance Free formula delivers the same 48-hour protection and 0% Aluminum benefits in a clean, unscented formula. Perfect for sensitive skin and those who prefer no fragrance.",
        descriptionAr:
          "ط­ظ…ط§ظٹط© ظ†ظ‚ظٹط© ط¨ط¯ظˆظ† ط±ط§ط¦ط­ط©. طھظˆظپط± طھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط¹ط·ط± ظ†ظپط³ ط§ظ„ط­ظ…ط§ظٹط© ظ„ظ…ط¯ط© 48 ط³ط§ط¹ط© ظˆظ†ظپط³ ظپظˆط§ط¦ط¯ 0% ط£ظ„ظ…ظ†ظٹظˆظ… ظپظٹ طھط±ظƒظٹط¨ط© ظ†ط¸ظٹظپط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط±ط§ط¦ط­ط©. ظ…ط«ط§ظ„ظٹط© ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط© ظˆظ„ظ…ظ† ظٹظپط¶ظ„ظˆظ† ط¹ط¯ظ… ظˆط¬ظˆط¯ ط¹ط·ط±.",
        shortDescriptionEn: "Gentle protection for sensitive skin",
        shortDescriptionAr: "ط­ظ…ط§ظٹط© ظ„ط·ظٹظپط© ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط©",
        price: "85.00",
        salePrice: null,
        stock: 100,
        sku: "HL-FF-005",
        scent: "Fragrance Free",
        scentColor: "#222222",
        categoryId: 2,
        images: ["/products/fragrance-free.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Ideal for sensitive skin",
        ],
        benefitsAr: [
          "ط§ظ†طھط¹ط§ط´ ظٹطµظ„ ط¥ظ„ظ‰ 48 ط³ط§ط¹ط©",
          "طھط±ظƒظٹط¨ط© ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ…",
          "طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©",
          "ظ…ط«ط§ظ„ظٹط© ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط©",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Chamomile Extract",
        ingredientsAr:
          "ظ…ط§ط،طŒ ط¨ط±ظˆط¨ظٹظ„ظٹظ† ط¬ظ„ظٹظƒظˆظ„طŒ ط¬ظ„ظٹط³ط±ظٹظ†طŒ ط³طھظٹط±ط§طھ ط§ظ„طµظˆط¯ظٹظˆظ…طŒ ط³ظٹطھظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ ط³طھظٹط±ظٹظ„ ط§ظ„ظƒط­ظˆظ„طŒ طھظˆظƒظˆظپظٹط±ظٹظ„ ط£ط³ظٹطھط§طھ (ظپظٹطھط§ظ…ظٹظ† ظ‡ظ€)طŒ ظ…ط³طھط®ظ„طµ ط§ظ„ط¨ط§ط¨ظˆظ†ط¬",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "ط±ط¬ ط¬ظٹط¯ط§ظ‹ ظ‚ط¨ظ„ ط§ظ„ط§ط³طھط®ط¯ط§ظ…. ط¶ط¹ ط¹ظ„ظ‰ ط§ظ„ط¥ط¨ط·ظٹظ† ط§ظ„ظ†ط¸ظٹظپظٹظ† ظˆط§ظ„ط¬ط§ظپظٹظ†. ط§طھط±ظƒ ط­طھظ‰ ظٹط¬ظپ ظ‚ط¨ظ„ ط§ط±طھط¯ط§ط، ط§ظ„ظ…ظ„ط§ط¨ط³. ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط£ظپط¶ظ„ ط§ظ„ظ†طھط§ط¦ط¬طŒ ط§ط³طھط®ط¯ظ… ظٹظˆظ…ظٹط§ظ‹.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Fragrance Free - Sensitive Skin",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Fragrance Free. Unscented, 0% Aluminum, Lebanese Formula. Perfect for sensitive skin. 48h protection.",
        relatedProducts: [1, 2, 3],
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Products seeded");

  // Seed FAQs
  await db
    .insert(faqs)
    .values([
      {
        questionEn: "How long does the protection last?",
        questionAr: "ظƒظ… طھط³طھظ…ط± ط§ظ„ط­ظ…ط§ظٹط©طں",
        answerEn:
          "Hi Line provides up to 48 hours of freshness and protection with a single application.",
        answerAr:
          "ظٹظˆظپط± ظ‡ط§ظٹ ظ„ط§ظٹظ† ط­طھظ‰ 48 ط³ط§ط¹ط© ظ…ظ† ط§ظ„ط§ظ†طھط¹ط§ط´ ظˆط§ظ„ط­ظ…ط§ظٹط© ط¨طھط·ط¨ظٹظ‚ ظˆط§ط­ط¯.",
        category: "product",
        sortOrder: 1,
      },
      {
        questionEn: "Is it safe for sensitive skin?",
        questionAr: "ظ‡ظ„ ظ‡ظˆ ط¢ظ…ظ† ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط©طں",
        answerEn:
          "Yes, our 0% Aluminum formula is designed for daily use on all skin types. We also offer a Fragrance Free option specifically for sensitive skin.",
        answerAr:
          "ظ†ط¹ظ…طŒ طھط±ظƒظٹط¨طھظ†ط§ ط§ظ„ط®ط§ظ„ظٹط© ظ…ظ† ط§ظ„ط£ظ„ظ…ظ†ظٹظˆظ… ظ…طµظ…ظ…ط© ظ„ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظٹظˆظ…ظٹ ط¹ظ„ظ‰ ط¬ظ…ظٹط¹ ط£ظ†ظˆط§ط¹ ط§ظ„ط¨ط´ط±ط©. ظ†ظ‚ط¯ظ… ط£ظٹط¶ظ‹ط§ ط®ظٹط§ط±ظ‹ط§ ط®ط§ظ„ظچ ظ…ظ† ط§ظ„ط¹ط·ط± ظ…ط®طµطµظ‹ط§ ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط©.",
        category: "product",
        sortOrder: 2,
      },
      {
        questionEn: "What sizes are available?",
        questionAr: "ظ…ط§ ظ‡ظٹ ط§ظ„ط£ط­ط¬ط§ظ… ط§ظ„ظ…طھظˆظپط±ط©طں",
        answerEn: "Currently available in 60ml Roll On bottles.",
        answerAr: "ظ…طھط§ط­ ط­ط§ظ„ظٹظ‹ط§ ظپظٹ ط²ط¬ط§ط¬ط§طھ ط±ظˆظ„ ط£ظˆظ† 60 ظ…ظ„.",
        category: "product",
        sortOrder: 3,
      },
      {
        questionEn: "How do I place an order?",
        questionAr: "ظƒظٹظپ ط£ظ‚ظˆظ… ط¨ط·ظ„ط¨ ظ…ظ†طھط¬طں",
        answerEn:
          "You can order through our website by adding products to cart and checking out, or directly via WhatsApp for quick delivery.",
        answerAr:
          "ظٹظ…ظƒظ†ظƒ ط§ظ„ط·ظ„ط¨ ظ…ظ† ط®ظ„ط§ظ„ ظ…ظˆظ‚ط¹ظ†ط§ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط¨ط¥ط¶ط§ظپط© ط§ظ„ظ…ظ†طھط¬ط§طھ ط¥ظ„ظ‰ ط³ظ„ط© ط§ظ„طھط³ظˆظ‚ ظˆط¥طھظ…ط§ظ… ط§ظ„ط´ط±ط§ط،طŒ ط£ظˆ ظ…ط¨ط§ط´ط±ط© ط¹ط¨ط± ط§ظ„ظˆط§طھط³ط§ط¨ ظ„ظ„طھظˆطµظٹظ„ ط§ظ„ط³ط±ظٹط¹.",
        category: "ordering",
        sortOrder: 4,
      },
      {
        questionEn: "What payment methods do you accept?",
        questionAr: "ظ…ط§ ظ‡ظٹ ط·ط±ظ‚ ط§ظ„ط¯ظپط¹ ط§ظ„ظ…طھط§ط­ط©طں",
        answerEn:
          "We accept Cash on Delivery, Vodafone Cash, InstaPay, and Bank Transfer.",
        answerAr:
          "ظ†ظ‚ط¨ظ„ ط§ظ„ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ…طŒ ظپظˆط¯ط§ظپظˆظ† ظƒط§ط´طŒ ط¥ظ†ط³طھط§ ط¨ط§ظٹطŒ ظˆط§ظ„طھط­ظˆظٹظ„ ط§ظ„ط¨ظ†ظƒظٹ.",
        category: "ordering",
        sortOrder: 5,
      },
      {
        questionEn: "How much is shipping?",
        questionAr: "ظƒظ… طھظƒظ„ظپط© ط§ظ„ط´ط­ظ†طں",
        answerEn:
          "Shipping fees vary by governorate, typically between EGP 45-65. Free shipping available on orders over EGP 500.",
        answerAr:
          "طھط®طھظ„ظپ ط±ط³ظˆظ… ط§ظ„ط´ط­ظ† ط­ط³ط¨ ط§ظ„ظ…ط­ط§ظپط¸ط©طŒ ط¹ط§ط¯ط© ط¨ظٹظ† 45-65 ط¬ظ†ظٹظ‡. ط§ظ„ط´ط­ظ† ط§ظ„ظ…ط¬ط§ظ†ظٹ ظ…طھط§ط­ ظ„ظ„ط·ظ„ط¨ط§طھ ط§ظ„طھظٹ طھط²ظٹط¯ ط¹ظ† 500 ط¬ظ†ظٹظ‡.",
        category: "shipping",
        sortOrder: 6,
      },
      {
        questionEn: "How long does delivery take?",
        questionAr: "ظƒظ… طھط³طھط؛ط±ظ‚ ط¹ظ…ظ„ظٹط© ط§ظ„طھظˆطµظٹظ„طں",
        answerEn:
          "Delivery typically takes 2-5 business days depending on your location in Egypt.",
        answerAr:
          "ظٹط³طھط؛ط±ظ‚ ط§ظ„طھظˆطµظٹظ„ ط¹ط§ط¯ط©ظ‹ ظ…ظ† 2 ط¥ظ„ظ‰ 5 ط£ظٹط§ظ… ط¹ظ…ظ„ ط­ط³ط¨ ظ…ظˆظ‚ط¹ظƒ ظپظٹ ظ…طµط±.",
        category: "shipping",
        sortOrder: 7,
      },
      {
        questionEn: "Can I return or exchange a product?",
        questionAr: "ظ‡ظ„ ظٹظ…ظƒظ†ظ†ظٹ ط¥ط±ط¬ط§ط¹ ط£ظˆ ط§ط³طھط¨ط¯ط§ظ„ ط§ظ„ظ…ظ†طھط¬طں",
        answerEn:
          "Yes, we accept returns within 14 days of delivery if the product is unused and in original packaging.",
        answerAr:
          "ظ†ط¹ظ…طŒ ظ†ظ‚ط¨ظ„ ط§ظ„ط¥ط±ط¬ط§ط¹ ط®ظ„ط§ظ„ 14 ظٹظˆظ…ظ‹ط§ ظ…ظ† ط§ظ„طھظˆطµظٹظ„ ط¥ط°ط§ ظƒط§ظ† ط§ظ„ظ…ظ†طھط¬ ط؛ظٹط± ظ…ط³طھط®ط¯ظ… ظˆظپظٹ ط¹ط¨ظˆطھظ‡ ط§ظ„ط£طµظ„ظٹط©.",
        category: "returns",
        sortOrder: 8,
      },
    ])
    .onDuplicateKeyUpdate({
      set: {},
    });

  console.log("FAQs seeded");

  // Seed store settings
  await db
    .insert(storeSettings)
    .values([
      { key: "store_name_en", value: "Hi Line Pro Care" },
      { key: "store_name_ar", value: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط¨ط±ظˆ ظƒظٹط±" },
      { key: "tagline_en", value: "Freshness that fits every mood" },
      { key: "tagline_ar", value: "ط§ظ†طھط¹ط§ط´ ظٹظ†ط§ط³ط¨ ظƒظ„ ظ…ط²ط§ط¬" },
      { key: "whatsapp_number", value: "+201223863092" },
      { key: "phone_number", value: "+201223863092" },
      { key: "facebook_url", value: "https://www.facebook.com/profile.php?id=61587944979845" },
      { key: "instagram_url", value: "" },
      { key: "logo_url", value: "/brand/logo.jpg" },
      { key: "currency", value: "EGP" },
      { key: "default_language", value: "en" },
      { key: "meta_title_en", value: "Hi Line Pro Care - Deodorant Roll On | Freshness That Fits Every Mood" },
      { key: "meta_description_en", value: "Discover Hi Line Deodorant Roll On. 48h protection, 0% Aluminum, Lebanese Formula. 5 amazing scents. Shop now and experience the freshness!" },
      { key: "meta_title_ar", value: "ظ‡ط§ظٹ ظ„ط§ظٹظ† ط¨ط±ظˆ ظƒظٹط± - ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط¹ط±ظ‚ | ط§ظ†طھط¹ط§ط´ ظٹظ†ط§ط³ط¨ ظƒظ„ ظ…ط²ط§ط¬" },
      { key: "meta_description_ar", value: "ط§ظƒطھط´ظپ ظ‡ط§ظٹ ظ„ط§ظٹظ† ط±ظˆظ„ ط£ظˆظ† ظ…ط²ظٹظ„ ط§ظ„ط¹ط±ظ‚. ط­ظ…ط§ظٹط© 48 ط³ط§ط¹ط©طŒ 0% ط£ظ„ظ…ظ†ظٹظˆظ…طŒ طھط±ظƒظٹط¨ط© ظ„ط¨ظ†ط§ظ†ظٹط©. 5 ط±ظˆط§ط¦ط­ ط±ط§ط¦ط¹ط©. طھط³ظˆظ‚ ط§ظ„ط¢ظ† ظˆط§ط®طھط¨ط± ط§ظ„ط§ظ†طھط¹ط§ط´!" },
      { key: "free_shipping_threshold", value: "" },
      { key: "announcement_text_en", value: "50% OFF Hi Line Roll On Collection" },
      { key: "announcement_text_ar", value: "خصم 50% على مجموعة Hi Line Roll On" },
      { key: "primary_color", value: "#4B1C71" },
      { key: "secondary_color", value: "#B57EDC" },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Store settings seeded");

  // Seed payment settings
  await db
    .insert(paymentSettings)
    .values([
      {
        method: "cash_on_delivery",
        isEnabled: true,
        displayName: "Cash on Delivery",
        displayNameAr: "ط§ظ„ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ…",
        sortOrder: 1,
      },
      {
        method: "vodafone_cash",
        isEnabled: true,
        displayName: "Vodafone Cash",
        displayNameAr: "ظپظˆط¯ط§ظپظˆظ† ظƒط§ط´",
        accountNumber: "+201223863092",
        accountName: "Hi Line Pro Care",
        instructions: "Please send payment to +20 122 386 3092 and upload the receipt",
        instructionsAr: "ظٹط±ط¬ظ‰ ط¥ط±ط³ط§ظ„ ط§ظ„ظ…ط¨ظ„ط؛ ط¥ظ„ظ‰ +20 122 386 3092 ظˆط±ظپط¹ ط§ظ„ط¥ظٹطµط§ظ„",
        sortOrder: 2,
      },
      {
        method: "instapay",
        isEnabled: true,
        displayName: "InstaPay",
        displayNameAr: "ط¥ظ†ط³طھط§ ط¨ط§ظٹ",
        accountNumber: "hiline@instapay",
        accountName: "Hi Line Pro Care",
        instructions: "Send payment to hiline@instapay and upload the receipt",
        instructionsAr: "ط£ط±ط³ظ„ ط§ظ„ظ…ط¨ظ„ط؛ ط¥ظ„ظ‰ hiline@instapay ظˆط±ظپط¹ ط§ظ„ط¥ظٹطµط§ظ„",
        sortOrder: 3,
      },
      {
        method: "bank_transfer",
        isEnabled: false,
        displayName: "Bank Transfer",
        displayNameAr: "ط§ظ„طھط­ظˆظٹظ„ ط§ظ„ط¨ظ†ظƒظٹ",
        sortOrder: 4,
      },
    ])
    .onDuplicateKeyUpdate({
      set: {},
    });

  console.log("Payment settings seeded");

  // Seed shipping settings for Egyptian governorates
  await db
    .insert(shippingSettings)
    .values([
      { governorate: "Cairo", governorateAr: "ط§ظ„ظ‚ط§ظ‡ط±ط©", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Giza", governorateAr: "ط§ظ„ط¬ظٹط²ط©", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Alexandria", governorateAr: "ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©", baseFee: "55.00", estimatedDays: "3-4 days" },
      { governorate: "Sharqia", governorateAr: "ط§ظ„ط´ط±ظ‚ظٹط©", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Dakahlia", governorateAr: "ط§ظ„ط¯ظ‚ظ‡ظ„ظٹط©", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Beheira", governorateAr: "ط§ظ„ط¨ط­ظٹط±ط©", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Gharbia", governorateAr: "ط§ظ„ط؛ط±ط¨ظٹط©", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Kafr El Sheikh", governorateAr: "ظƒظپط± ط§ظ„ط´ظٹط®", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Monufia", governorateAr: "ط§ظ„ظ…ظ†ظˆظپظٹط©", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Qalyubia", governorateAr: "ط§ظ„ظ‚ظ„ظٹظˆط¨ظٹط©", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Damietta", governorateAr: "ط¯ظ…ظٹط§ط·", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Port Said", governorateAr: "ط¨ظˆط±ط³ط¹ظٹط¯", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Ismailia", governorateAr: "ط§ظ„ط¥ط³ظ…ط§ط¹ظٹظ„ظٹط©", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Suez", governorateAr: "ط§ظ„ط³ظˆظٹط³", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Fayoum", governorateAr: "ط§ظ„ظپظٹظˆظ…", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Beni Suef", governorateAr: "ط¨ظ†ظٹ ط³ظˆظٹظپ", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Minya", governorateAr: "ط§ظ„ظ…ظ†ظٹط§", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Assiut", governorateAr: "ط£ط³ظٹظˆط·", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Sohag", governorateAr: "ط³ظˆظ‡ط§ط¬", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Qena", governorateAr: "ظ‚ظ†ط§", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Luxor", governorateAr: "ط§ظ„ط£ظ‚طµط±", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Aswan", governorateAr: "ط£ط³ظˆط§ظ†", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Red Sea", governorateAr: "ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "North Sinai", governorateAr: "ط´ظ…ط§ظ„ ط³ظٹظ†ط§ط،", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "South Sinai", governorateAr: "ط¬ظ†ظˆط¨ ط³ظٹظ†ط§ط،", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Matrouh", governorateAr: "ظ…ط·ط±ظˆط­", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "New Valley", governorateAr: "ط§ظ„ظˆط§ط¯ظٹ ط§ظ„ط¬ط¯ظٹط¯", baseFee: "65.00", estimatedDays: "4-5 days" },
    ])
    .onDuplicateKeyUpdate({
      set: {},
    });

  console.log("Shipping settings seeded");
  console.log("Database seeding complete!");
}

seed().catch(console.error);


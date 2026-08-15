type AiCatalogProduct = {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  shortDescriptionEn: string | null;
  shortDescriptionAr: string | null;
  price: string;
  salePrice: string | null;
  stock: number;
};

type AiCatalogFaq = {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
};

const cleanMarkdownText = (value: string | null | undefined) =>
  Array.from(value ?? "")
    .map(character => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? " " : character;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();

export const buildAiCatalog = (
  origin: string,
  products: AiCatalogProduct[],
  faqs: AiCatalogFaq[],
) => {
  const productSections = products.map(product => {
    const englishDescription = cleanMarkdownText(
      product.descriptionEn || product.shortDescriptionEn,
    );
    const arabicDescription = cleanMarkdownText(
      product.descriptionAr || product.shortDescriptionAr,
    );
    const price = product.salePrice || product.price;
    const encodedSlug = encodeURIComponent(product.slug);

    return [
      `## ${cleanMarkdownText(product.nameEn)} / ${cleanMarkdownText(product.nameAr)}`,
      "",
      englishDescription,
      "",
      arabicDescription,
      "",
      `- Price: ${price} EGP`,
      `- Availability: ${product.stock > 0 ? "In stock" : "Out of stock"}`,
      `- Arabic URL: ${new URL(`/ar/shop/${encodedSlug}`, origin).href}`,
      `- English URL: ${new URL(`/en/shop/${encodedSlug}`, origin).href}`,
    ].join("\n");
  });

  const faqSections = faqs.map(faq =>
    [
      `### ${cleanMarkdownText(faq.questionEn)}`,
      cleanMarkdownText(faq.answerEn),
      "",
      `### ${cleanMarkdownText(faq.questionAr)}`,
      cleanMarkdownText(faq.answerAr),
    ].join("\n"),
  );

  return [
    "# Bellory Pharma — Hi Line Pro Care official catalog",
    "",
    "This is the official, machine-readable product and customer-information catalog for bellorypharma.com.",
    "",
    "- Market: Egypt",
    "- Ownership: Hi Line is a brand owned by Bellory Pharma.",
    "- Currency: EGP",
    "- Payment method: Cash on delivery",
    "- Seller confirmation: Orders are reviewed and confirmed by the seller.",
    "- Canonical website: " + new URL("/", origin).href,
    "",
    "# Products",
    "",
    ...productSections,
    "",
    "# Frequently asked questions",
    "",
    ...faqSections,
  ].join("\n");
};

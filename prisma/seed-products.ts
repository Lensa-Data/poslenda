import prisma from '../src/lib/db';

async function main() {
  console.log('Seeding products...');

  // 1. Get Categories mapping
  const categories = await prisma.category.findMany();
  const getCatId = (name: string) => categories.find(c => c.name === name)?.id;

  const drinksId = getCatId("Drinks");
  const appetizersId = getCatId("Appetizers");
  const mainCourseId = getCatId("Main Course");
  const dessertsId = getCatId("Desserts");
  const pastriesId = getCatId("Pastries") || dessertsId; // fallback

  if (!drinksId || !appetizersId || !mainCourseId || !dessertsId) {
    throw new Error('Please seed categories first.');
  }

  const productsToSeed = [
    {
      name: "Lavender Honey Latte",
      description: "Double espresso, wild-harvested honey, dried culinary lavender, oat milk.",
      price: 6.5,
      categoryId: drinksId,
      stock: 50,
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBO3LLUywR1yeHox5NHUf6Xb_aMCmlFgHJ9WgNCcKuzdVIPd45L5VJ1dB1BYvWmvlLpF6S3l1LtqovegsDszXcew-jHqjLvhy_ueT_3PhWFSeqY3zMHuXeiog3m5mz5KYNaUalssgZXgWQ_0SajgXFl-asdzRsHF-C30foX9L7L9gcXy56YTzc6QaqMwDxpVCrTjVkEr1butoV66gup50nCG5LlFZRszJEse85ogvLDIQ36sib5iBHq3PnxvdF0j9EgvK5yyBQv2OKO",
    },
    {
      name: "Avocado Garden Toast",
      description: "House-baked sourdough, smashed hass avocado, watermelon radish, sea salt.",
      price: 12.0,
      categoryId: appetizersId,
      stock: 30,
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDumSvOBn4gNyKhHsyzFAOxSYJU1wrK52vi-8HtrCmPLnOkiPuoNLp-eOk0Kj-wG7j-HdIObO2uHD5IggTKzB1XOmyK_Wtf9vov3DjZHs4WYcZPkVdMAyjdT8uIN_TXtuwOX8B4f0YhgdMNp4YFZ9xysi_ziQgBqaBOFp_uERDRwCTpaehXs6jrBhmN_t-1FyCqLaz5GhNpgFN1C2OY1SrHd8zHbETrBCSSZsDLcPekZ3cvUzydeXPd6eWWwEEN5c03BmfdF9LWqlxr",
    },
    {
      name: "Warm Quinoa Bowl",
      description: "Tri-color quinoa, maple-roasted carrots, massaged kale, tahini lemon dressing.",
      price: 18.5,
      categoryId: mainCourseId,
      stock: 25,
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx-n-GcHAQJ2otAQQTPT1CTnHj4Hc5mZKrEAZCb7A5YsDsFpVNpOd3Fd50Ej4IbO_Xk8bdMiDRbn6oJoj8BOLtuJp5zbbQHhgFtCCx2aHSoHEMzxisGOn2d0SFoz1xQjKEx63ygWwrZSjGEd1_cChH14vCpxLiZEY_otkd3_vmwoABqAvUF_UEt0rj8cDu9JHSWKU5Vi0iG_3EzMfTR_9Akf_0NW09W2WL1LUyte_3ii5RzTrR0Nj-az830OdhlD4Lsb_vO1XDAxGF",
    },
    {
      name: "Burrata & Heirloom",
      description: "Fresh burrata, estate heirloom tomatoes, basil oil, smoked balsamic glaze.",
      price: 14.0,
      categoryId: appetizersId,
      stock: 5, // low stock
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLX36NSGzVRaPFmmMV4182namAuVR54cjXDyi0YyZfEYLHhiRWIY5Xap0WY950Rk4OIuRFlOW9xJOjWKNR9JIaB0s9Qh8fopNF_XAUP2A1CQhESMwe9LV7KN0wkspZ4FzQPnj3skYbPS9IFBgBhY6K9rx94ELLMvn4KQCUSDY9zWljNUici3wMhVweLG3l1Z_e0C1Ez64a2a3OHico0wBqQGdgA7p1YCEmRTBvF7YC4sf4IkUlgTPbIc4Y81ShzzxSWPGk2ntDL86u",
    },
    {
      name: "Stone-Drip Cold Brew",
      description: "24-hour slow drip extraction using Ethiopian Yirgacheffe single origin beans.",
      price: 5.5,
      categoryId: drinksId,
      stock: null, // unlimited
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwQ0DMlpXnDj9Z9XVkEy1CIRnewFRSA9bzHehwj7B-3OqgbPMAMao3-hWHQyD1KPijmH4TNaKYpbBe3exhS1xtT3qVVnnGU4kTBj5VevjoubqqW61R_SvdpmJVA_-mX4kPVLtmwgO7skU_6k8UvAwgBLiDlz8F-WPZmDv5DjH2khXMYJKmh2Cmbw6SCtmLnKThhrwJyhoSt-3OlPGwRwXRpLYTWibdToI0HyHcAghLhGBSC8KB7hlPhpHP_n26_0FcsFnvemp5Avfh",
    },
    {
      name: "Nordic Salmon Tartine",
      description: "Cold-smoked Atlantic salmon, herbed cream cheese, pickled onions, dark rye.",
      price: 16.5,
      categoryId: mainCourseId,
      stock: 0, // out of stock
      isAvailable: false,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcnRtTzUF9oqOaKp8QbPW6pTV37j-SuwySZouavPvniDZoZ-RO9YbJfTRIogYSGuFTcuorrnYSsfZIfxevhFOmxXPIBrLPzVFBkMZFN_6ssGtXqAtuUA5RHDynANTlB9BStarVS-B7l50pyAo1XOFw-IaLMlv6FZrH4mUpluhsk8h9LjpjXG5mXLaGT2myBrJoeV9YkuQ3YekUmn5N--fQH-FgVHBIzdNWuA34O38P7ejOzV2S0nvZDvvLsyHRjAtcxgltUaydiYsN",
    },
    {
      name: "Matcha Ceremonial Latte",
      description: "First-harvest ceremonial grade matcha, oat milk foam, light honey drizzle.",
      price: 7.0,
      categoryId: drinksId,
      stock: 40,
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBO3LLUywR1yeHox5NHUf6Xb_aMCmlFgHJ9WgNCcKuzdVIPd45L5VJ1dB1BYvWmvlLpF6S3l1LtqovegsDszXcew-jHqjLvhy_ueT_3PhWFSeqY3zMHuXeiog3m5mz5KYNaUalssgZXgWQ_0SajgXFl-asdzRsHF-C30foX9L7L9gcXy56YTzc6QaqMwDxpVCrTjVkEr1butoV66gup50nCG5LlFZRszJEse85ogvLDIQ36sib5iBHq3PnxvdF0j9EgvK5yyBQv2OKO",
    },
    {
      name: "Almond Croissant",
      description: "House-laminated pastry, filled with frangipane, topped with sliced almonds.",
      price: 5.0,
      categoryId: pastriesId || dessertsId,
      stock: 8, // low stock
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDumSvOBn4gNyKhHsyzFAOxSYJU1wrK52vi-8HtrCmPLnOkiPuoNLp-eOk0Kj-wG7j-HdIObO2uHD5IggTKzB1XOmyK_Wtf9vov3DjZHs4WYcZPkVdMAyjdT8uIN_TXtuwOX8B4f0YhgdMNp4YFZ9xysi_ziQgBqaBOFp_uERDRwCTpaehXs6jrBhmN_t-1FyCqLaz5GhNpgFN1C2OY1SrHd8zHbETrBCSSZsDLcPekZ3cvUzydeXPd6eWWwEEN5c03BmfdF9LWqlxr",
    },
    {
      name: "Seasonal Tarte Tatin",
      description: "Upside-down caramelised apple tart with crème fraîche and sea salt caramel.",
      price: 9.5,
      categoryId: dessertsId,
      stock: 12,
      isAvailable: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx-n-GcHAQJ2otAQQTPT1CTnHj4Hc5mZKrEAZCb7A5YsDsFpVNpOd3Fd50Ej4IbO_Xk8bdMiDRbn6oJoj8BOLtuJp5zbbQHhgFtCCx2aHSoHEMzxisGOn2d0SFoz1xQjKEx63ygWwrZSjGEd1_cChH14vCpxLiZEY_otkd3_vmwoABqAvUF_UEt0rj8cDu9JHSWKU5Vi0iG_3EzMfTR_9Akf_0NW09W2WL1LUyte_3ii5RzTrR0Nj-az830OdhlD4Lsb_vO1XDAxGF",
    }
  ];

  for (const item of productsToSeed) {
    const existing = await prisma.product.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.product.create({
        data: item
      });
      console.log(`Created product: ${item.name}`);
    } else {
      console.log(`Product ${item.name} already exists. Skipping.`);
    }
  }

  console.log('Product seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

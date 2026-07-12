const fs = require('fs');
let c = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

const bundleCode = `
      {/* Dynamic Product Bundling */}
      {product.relatedProductsList && product.relatedProductsList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-[#fcf8ff] to-[#fff] rounded-3xl p-8 border border-[#B57EDC]/20 shadow-sm">
            <h2 className="text-2xl font-bold text-[#4B1C71] mb-6 flex items-center gap-2">
              <Tag className="w-6 h-6 text-[#B57EDC]" />
              {lang === 'ar' ? 'اشترِ معاً ووفر 10%' : 'Buy Together & Save 10%'}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 flex items-center justify-center gap-4 w-full">
                {/* Current Product */}
                <div className="flex-1 beauty-card p-4 rounded-xl text-center bg-white">
                  <img src={images[0]} alt={product.nameEn} className="w-24 h-24 mx-auto object-contain mb-2" loading="lazy" />
                  <p className="text-sm font-semibold text-[#4B1C71] truncate">{lang === 'ar' && product.nameAr ? product.nameAr : product.nameEn}</p>
                  <p className="text-xs text-[#B57EDC]">{parseFloat(product.price).toFixed(0)} {t.currency}</p>
                </div>
                <Plus className="w-8 h-8 text-[#B57EDC] flex-shrink-0" />
                {/* Recommended Product */}
                <div className="flex-1 beauty-card p-4 rounded-xl text-center bg-white">
                  <img src={listValue(product.relatedProductsList[0].images)[0]} alt={product.relatedProductsList[0].nameEn} className="w-24 h-24 mx-auto object-contain mb-2" loading="lazy" />
                  <p className="text-sm font-semibold text-[#4B1C71] truncate">{lang === 'ar' && product.relatedProductsList[0].nameAr ? product.relatedProductsList[0].nameAr : product.relatedProductsList[0].nameEn}</p>
                  <p className="text-xs text-[#B57EDC]">{parseFloat(product.relatedProductsList[0].price).toFixed(0)} {t.currency}</p>
                </div>
              </div>
              <div className="flex-shrink-0 bg-white p-6 rounded-2xl shadow-sm text-center min-w-[200px]">
                <p className="text-sm text-[#6F6178] line-through mb-1">
                  {(parseFloat(product.price) + parseFloat(product.relatedProductsList[0].price)).toFixed(0)} {t.currency}
                </p>
                <p className="text-3xl font-bold text-[#4B1C71] mb-4">
                  {((parseFloat(product.price) + parseFloat(product.relatedProductsList[0].price)) * 0.9).toFixed(0)} {t.currency}
                </p>
                <button 
                  onClick={() => {
                    addItem({ productId: product.id, name: product.nameEn, nameAr: product.nameAr, scent: product.scent, scentColor: product.scentColor, price: (parseFloat(product.price)*0.9).toFixed(2), salePrice: null, image: images[0], stock: productStock });
                    const rel = product.relatedProductsList[0];
                    addItem({ productId: rel.id, name: rel.nameEn, nameAr: rel.nameAr, scent: rel.scent, scentColor: rel.scentColor, price: (parseFloat(rel.price)*0.9).toFixed(2), salePrice: null, image: listValue(rel.images)[0], stock: 10 });
                    toast.success(lang === 'ar' ? 'تم إضافة العرض للسلة!' : 'Bundle added to cart!');
                  }}
                  className="w-full beauty-button py-3 rounded-xl font-bold text-white shadow-lg shadow-[#B57EDC]/30"
                >
                  {lang === 'ar' ? 'أضف العرض للسلة' : 'Add Bundle to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace('{/* Related Products */}', bundleCode + '\n      {/* Related Products */}');
fs.writeFileSync('src/pages/ProductDetail.tsx', c);

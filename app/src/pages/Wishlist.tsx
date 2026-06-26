import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { Link, Navigate } from "react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Wishlist() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: user } = trpc.auth.me.useQuery();
  const { data: wishlist, refetch, isLoading } = trpc.store.getWishlist.useQuery(undefined, {
    enabled: !!user,
  });
  const toggleWishlist = trpc.store.toggleWishlist.useMutation();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleRemove = async (productId: number) => {
    try {
      await toggleWishlist.mutateAsync({ productId });
      refetch();
      toast.success(lang === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleAddToCart = (product: any) => {
    setAddingId(product.id);
    addItem({
      productId: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      scent: product.scent,
      scentColor: product.scentColor,
      price: product.salePrice ?? product.price,
      salePrice: product.salePrice,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    });
    toast.success(lang === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
    setTimeout(() => setAddingId(null), 1000);
  };

  return (
    <div className={`pt-32 pb-20 min-h-screen bg-[#FCF8FF] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-[#B57EDC] fill-[#B57EDC]" />
          <h1 className="text-3xl font-bold text-[#4B1C71]">
            {lang === "ar" ? "قائمة المفضلة" : "My Wishlist"}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 h-[300px]" />
            ))}
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7D8F1]">
            <Heart className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#4B1C71] mb-2">
              {lang === "ar" ? "قائمتك فارغة" : "Your wishlist is empty"}
            </h2>
            <p className="text-[#6F6178] mb-6">
              {lang === "ar" ? "تصفح المتجر وأضف منتجاتك المفضلة هنا" : "Browse our shop and add your favorite products here"}
            </p>
            <Link to="/shop" className="px-8 py-3 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors">
              {t.startShopping}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              return (
                <div key={item.wishlistId} className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden group">
                  <div className="relative aspect-square bg-[#FCF8FF] p-6 flex items-center justify-center">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50 transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link to={`/shop/${product.slug}`} className="block w-full h-full">
                      <img
                        src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ""}
                        alt={product.nameEn}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#4B1C71] mb-1 line-clamp-1">
                      {lang === "ar" && product.nameAr ? product.nameAr : product.nameEn}
                    </h3>
                    <p className="text-sm text-[#8D7A97] mb-3">{product.scent}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="font-bold text-[#D71920]">
                        LE {parseFloat(product.salePrice ?? product.price).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                        className="w-9 h-9 rounded-full bg-[#F7ECFF] text-[#4B1C71] flex items-center justify-center hover:bg-[#B57EDC] hover:text-white transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const emptyProduct = {
  id: 0,
  nameEn: "",
  nameAr: "",
  slug: "",
  descriptionEn: "",
  descriptionAr: "",
  shortDescriptionEn: "",
  shortDescriptionAr: "",
  price: "",
  salePrice: "",
  stock: 0,
  sku: "",
  scent: "",
  scentColor: "",
  categoryId: undefined as number | undefined,
  images: [] as string[],
  benefits: [] as string[],
  benefitsAr: [] as string[],
  ingredients: "",
  ingredientsAr: "",
  usageInstructions: "",
  usageInstructionsAr: "",
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  seoTitle: "",
  seoDescription: "",
};
type ProductForm = typeof emptyProduct;

type AdminProduct = Omit<typeof emptyProduct, "descriptionEn" | "descriptionAr" | "shortDescriptionEn" | "shortDescriptionAr" | "salePrice" | "sku" | "scentColor" | "categoryId" | "images" | "benefits" | "benefitsAr" | "ingredients" | "ingredientsAr" | "usageInstructions" | "usageInstructionsAr" | "seoTitle" | "seoDescription" | "isActive" | "isFeatured" | "isBestSeller"> & {
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  shortDescriptionEn?: string | null;
  shortDescriptionAr?: string | null;
  salePrice?: string | null;
  sku?: string | null;
  scentColor?: string | null;
  categoryId?: number | null;
  images?: string[] | string | null;
  benefits?: string[] | string | null;
  benefitsAr?: string[] | string | null;
  ingredients?: string | null;
  ingredientsAr?: string | null;
  usageInstructions?: string | null;
  usageInstructionsAr?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
  isBestSeller?: boolean | null;
};

function listValue(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default function AdminProducts() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<typeof emptyProduct>(emptyProduct);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: products, isLoading, isError: productsError } = trpc.admin.listProducts.useQuery(
    search ? { search } : undefined,
    { retry: false, throwOnError: false }
  );
  const { data: categories } = trpc.admin.listCategories.useQuery();

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      utils.admin.listProducts.invalidate();
      setShowModal(false);
      setEditing(emptyProduct);
      toast.success(lang === "ar" ? "تمت الإضافة" : "Created successfully");
    },
  });

  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      utils.admin.listProducts.invalidate();
      setShowModal(false);
      setEditing(emptyProduct);
      toast.success(lang === "ar" ? "تم التحديث" : "Updated successfully");
    },
  });

  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      utils.admin.listProducts.invalidate();
      setDeleteId(null);
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted successfully");
    },
  });

  const handleSave = () => {
    if (!editing.nameEn || !editing.nameAr || !editing.slug || !editing.price || !editing.scent) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    if (editing.id) {
      updateProduct.mutate(editing);
    } else {
      createProduct.mutate(editing);
    }
  };

  const openEdit = (product: AdminProduct) => {
    setEditing({
      ...emptyProduct,
      ...product,
      descriptionEn: product.descriptionEn ?? "",
      descriptionAr: product.descriptionAr ?? "",
      shortDescriptionEn: product.shortDescriptionEn ?? "",
      shortDescriptionAr: product.shortDescriptionAr ?? "",
      salePrice: product.salePrice ?? "",
      sku: product.sku ?? "",
      scentColor: product.scentColor ?? "",
      categoryId: product.categoryId ?? undefined,
      images: listValue(product.images),
      benefits: listValue(product.benefits),
      benefitsAr: listValue(product.benefitsAr),
      ingredients: product.ingredients ?? "",
      ingredientsAr: product.ingredientsAr ?? "",
      usageInstructions: product.usageInstructions ?? "",
      usageInstructionsAr: product.usageInstructionsAr ?? "",
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isBestSeller: product.isBestSeller ?? false,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(emptyProduct);
    setShowModal(true);
  };

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#4B1C71]">{t.manageProducts}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.addProduct}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7A97]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#B57EDC]" />
          </div>
        ) : productsError ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-[#E7D8F1] mx-auto mb-3" />
            <p className="text-[#6F6178] text-sm mb-1">{lang === "ar" ? "تعذّر الاتصال بقاعدة البيانات" : "Could not connect to database"}</p>
            <p className="text-[#8D7A97] text-xs">{lang === "ar" ? "تأكد من تشغيل الخادم وإعدادات DB" : "Check your server and DB settings"}</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="p-12 text-center text-[#6F6178]">{t.noProductsFound}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7D8F1]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.name}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.scent}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.price}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.stock}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.status}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6178] uppercase">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8F1]">
                {products?.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FCF8FF]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${product.scentColor || "#F7ECFF"}15`,
                          }}
                        >
                          <Package className="w-5 h-5 text-[#8D7A97]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#4B1C71]">
                            {product.nameEn}
                          </p>
                          <p className="text-xs text-[#8D7A97]">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{
                          backgroundColor: product.scentColor || "#8D7A97",
                        }}
                      >
                        {product.scent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4B1C71]">
                      {parseFloat(product.price).toFixed(0)} {t.currency}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4B1C71]">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          product.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#B57EDC]/10 text-[#4B1C71]"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E7D8F1]">
              <h2 className="text-lg font-semibold text-[#4B1C71]">
                {editing.id ? t.edit : t.addProduct}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(emptyProduct);
                }}
              >
                <X className="w-5 h-5 text-[#8D7A97]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.nameEn} *
                  </label>
                  <input
                    type="text"
                    value={editing.nameEn}
                    onChange={(e) =>
                      setEditing({ ...editing, nameEn: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.nameAr} *
                  </label>
                  <input
                    type="text"
                    value={editing.nameAr}
                    onChange={(e) =>
                      setEditing({ ...editing, nameAr: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.slug} *
                  </label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.sku}
                  </label>
                  <input
                    type="text"
                    value={editing.sku || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, sku: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.scent} *
                  </label>
                  <input
                    type="text"
                    value={editing.scent}
                    onChange={(e) =>
                      setEditing({ ...editing, scent: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {lang === "ar" ? "القسم" : "Category"}
                  </label>
                  <select
                    value={editing.categoryId ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        categoryId: e.target.value
                          ? Number.parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  >
                    <option value="">
                      {lang === "ar" ? "بدون قسم" : "No category"}
                    </option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {lang === "ar" ? category.nameAr : category.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.scent} Color
                  </label>
                  <input
                    type="text"
                    value={editing.scentColor || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, scentColor: e.target.value })
                    }
                    placeholder="#159C73"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.price} *
                  </label>
                  <input
                    type="text"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.salePrice}
                  </label>
                  <input
                    type="text"
                    value={editing.salePrice || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, salePrice: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                    {t.stock}
                  </label>
                  <input
                    type="number"
                    value={editing.stock}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                  {t.description}
                </label>
                <textarea
                  value={editing.descriptionEn || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, descriptionEn: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1">
                  {t.descriptionAr}
                </label>
                <textarea
                  value={editing.descriptionAr || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, descriptionAr: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 resize-none"
                />
              </div>
              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                {(["isActive", "isFeatured", "isBestSeller"] as const).map((field) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing[field]}
                      onChange={(e) =>
                        setEditing({ ...editing, [field]: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#B57EDC]"
                    />
                    <span className="text-sm text-[#4B1C71]">
                      {t[field as keyof ProductForm & keyof typeof t] || field}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E7D8F1]">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(emptyProduct);
                }}
                className="px-4 py-2.5 text-sm text-[#6F6178] hover:text-[#4B1C71]"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={createProduct.isPending || updateProduct.isPending}
                className="px-6 py-2.5 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors disabled:opacity-50"
              >
                {(createProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                )}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <p className="text-[#4B1C71] mb-6">{t.confirmDelete}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-[#6F6178]"
              >
                {t.no}
              </button>
              <button
                onClick={() => deleteProduct.mutate({ id: deleteId })}
                disabled={deleteProduct.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {deleteProduct.isPending && (
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                )}
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

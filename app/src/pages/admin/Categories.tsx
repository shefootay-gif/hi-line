import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import { FolderTree, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const emptyCategory = {
  id: 0,
  nameEn: "",
  nameAr: "",
  slug: "",
  descriptionEn: "",
  descriptionAr: "",
  sortOrder: 0,
  isActive: true,
};

type CategoryForm = typeof emptyCategory;

type AdminCategory = {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
  const { lang, isRTL } = useLanguage();
  const utils = trpc.useUtils();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryForm>(emptyCategory);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categories, isLoading, isError: categoriesError } = trpc.admin.listCategories.useQuery(
    undefined,
    { retry: false, throwOnError: false }
  );

  const createCategory = trpc.admin.createCategory.useMutation({
    onSuccess: () => {
      utils.admin.listCategories.invalidate();
      utils.store.getCategories.invalidate();
      setShowModal(false);
      setEditing(emptyCategory);
      toast.success(lang === "ar" ? "تمت إضافة القسم" : "Category created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCategory = trpc.admin.updateCategory.useMutation({
    onSuccess: () => {
      utils.admin.listCategories.invalidate();
      utils.store.getCategories.invalidate();
      setShowModal(false);
      setEditing(emptyCategory);
      toast.success(lang === "ar" ? "تم حفظ القسم" : "Category saved");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCategory = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => {
      utils.admin.listCategories.invalidate();
      utils.store.getCategories.invalidate();
      setDeleteId(null);
      toast.success(lang === "ar" ? "تم حذف القسم" : "Category deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditing(emptyCategory);
    setShowModal(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing({
      ...emptyCategory,
      ...category,
      descriptionEn: category.descriptionEn ?? "",
      descriptionAr: category.descriptionAr ?? "",
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
    });
    setShowModal(true);
  };

  const saveCategory = () => {
    if (!editing.nameEn.trim() || !editing.nameAr.trim() || !editing.slug.trim()) {
      toast.error(lang === "ar" ? "اكتب اسم القسم والرابط" : "Name and slug are required");
      return;
    }

    const payload = {
      nameEn: editing.nameEn.trim(),
      nameAr: editing.nameAr.trim(),
      slug: editing.slug.trim(),
      descriptionEn: editing.descriptionEn.trim(),
      descriptionAr: editing.descriptionAr.trim(),
      sortOrder: editing.sortOrder || 0,
      isActive: editing.isActive,
    };

    if (editing.id) {
      updateCategory.mutate({ id: editing.id, ...payload });
    } else {
      createCategory.mutate(payload);
    }
  };

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#4B1C71]">
            {lang === "ar" ? "إدارة الأقسام" : "Manage Categories"}
          </h1>
          <p className="mt-1 text-sm text-[#6F6178]">
            {lang === "ar"
              ? "أضف أقسام Hi Line القادمة مثل Body Lotion و Body Mist بدون برمجة."
              : "Add future Hi Line sections like Body Lotion and Body Mist without coding."}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#B57EDC] px-4 py-2.5 font-semibold text-[#4B1C71] transition-colors hover:bg-[#A66DCC]"
        >
          <Plus className="h-4 w-4" />
          {lang === "ar" ? "إضافة قسم" : "Add Category"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E7D8F1] bg-white">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#B57EDC]" />
          </div>
        ) : categoriesError ? (
          <div className="p-12 text-center">
            <FolderTree className="mx-auto mb-3 h-10 w-10 text-[#E7D8F1]" />
            <p className="text-[#6F6178] text-sm mb-1">{lang === "ar" ? "تعذّر الاتصال بقاعدة البيانات" : "Could not connect to database"}</p>
            <p className="text-[#8D7A97] text-xs">{lang === "ar" ? "تأكد من تشغيل الخادم وإعدادات DB" : "Check your server and DB settings"}</p>
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="p-12 text-center text-[#6F6178]">
            <FolderTree className="mx-auto mb-3 h-10 w-10 text-[#B57EDC]" />
            {lang === "ar" ? "لا توجد أقسام بعد" : "No categories yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7D8F1]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#6F6178]">
                    {lang === "ar" ? "القسم" : "Category"}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#6F6178]">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#6F6178]">
                    {lang === "ar" ? "الترتيب" : "Order"}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#6F6178]">
                    {lang === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#6F6178]">
                    {lang === "ar" ? "إجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8F1]">
                {categories?.map((category) => (
                  <tr key={category.id} className="hover:bg-[#FCF8FF]">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#4B1C71]">{category.nameEn}</p>
                      <p className="text-sm text-[#8D7A97]">{category.nameAr}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6F6178]">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-[#4B1C71]">
                      {category.sortOrder ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          category.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.isActive
                          ? lang === "ar"
                            ? "نشط"
                            : "Active"
                          : lang === "ar"
                            ? "غير نشط"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4B1C71] hover:bg-[#B57EDC]/10"
                          aria-label="Edit category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(category.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-[#E7D8F1] p-6">
              <h2 className="text-lg font-semibold text-[#4B1C71]">
                {editing.id
                  ? lang === "ar"
                    ? "تعديل قسم"
                    : "Edit Category"
                  : lang === "ar"
                    ? "إضافة قسم"
                    : "Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-[#8D7A97]" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                    Name EN *
                  </label>
                  <input
                    value={editing.nameEn}
                    onChange={(event) => {
                      const nameEn = event.target.value;
                      setEditing({
                        ...editing,
                        nameEn,
                        slug: editing.slug || slugify(nameEn),
                      });
                    }}
                    className="w-full rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                    الاسم العربي *
                  </label>
                  <input
                    value={editing.nameAr}
                    onChange={(event) =>
                      setEditing({ ...editing, nameAr: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                    Slug *
                  </label>
                  <input
                    value={editing.slug}
                    onChange={(event) =>
                      setEditing({ ...editing, slug: slugify(event.target.value) })
                    }
                    className="w-full rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                    {lang === "ar" ? "الترتيب" : "Sort Order"}
                  </label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        sortOrder: Number.parseInt(event.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                  Description EN
                </label>
                <textarea
                  rows={3}
                  value={editing.descriptionEn}
                  onChange={(event) =>
                    setEditing({ ...editing, descriptionEn: event.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B1C71]">
                  الوصف العربي
                </label>
                <textarea
                  rows={3}
                  value={editing.descriptionAr}
                  onChange={(event) =>
                    setEditing({ ...editing, descriptionAr: event.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-[#E7D8F1] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(event) =>
                    setEditing({ ...editing, isActive: event.target.checked })
                  }
                  className="h-4 w-4 accent-[#B57EDC]"
                />
                <span className="text-sm text-[#4B1C71]">
                  {lang === "ar" ? "قسم نشط" : "Active category"}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E7D8F1] p-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm text-[#6F6178] hover:text-[#4B1C71]"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={saveCategory}
                disabled={createCategory.isPending || updateCategory.isPending}
                className="rounded-xl bg-[#B57EDC] px-6 py-2.5 font-semibold text-[#4B1C71] transition-colors hover:bg-[#A66DCC] disabled:opacity-50"
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                )}
                {lang === "ar" ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <p className="mb-6 text-[#4B1C71]">
              {lang === "ar" ? "هل تريد حذف هذا القسم؟" : "Delete this category?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-[#6F6178]"
              >
                {lang === "ar" ? "لا" : "No"}
              </button>
              <button
                onClick={() => deleteCategory.mutate({ id: deleteId })}
                disabled={deleteCategory.isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteCategory.isPending && (
                  <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                )}
                {lang === "ar" ? "نعم" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

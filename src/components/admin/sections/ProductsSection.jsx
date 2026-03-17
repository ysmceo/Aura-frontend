import { Button } from "@/components/ui/button";
import {
  DetailRow,
  EmptyState,
  SectionHeading,
  Surface,
  TextField
} from "@/components/site/shared";
import { formatCurrency } from "@/lib/site";
import { resolveMediaSrc } from "@/lib/storefront";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function ProductsSection() {
  const {
    dashboard,
    handleAddProduct,
    productForm,
    setProductForm,
    productImagePreview,
    setProductImagePreview
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/30 bg-panel/88 shadow-xl">
        <SectionHeading
          eyebrow="Catalog"
          title="Products"
          description="Add products, upload imagery, and keep inventory visible in one clean catalog view."
        />

        <div className="grid gap-6 2xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <form className="space-y-4" onSubmit={handleAddProduct}>
              <TextField
                label="Name"
                id="product-name"
                required
                placeholder="e.g. Premium Hair Serum"
                value={productForm.name}
                onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <TextField
                label="Category"
                id="product-category"
                required
                placeholder="e.g. Hair care"
                value={productForm.category}
                onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <TextField
                  label="Price"
                  id="product-price"
                  type="number"
                  required
                  placeholder="0.00"
                  value={productForm.price}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                />
                <TextField
                  label="Stock"
                  id="product-stock"
                  type="number"
                  required
                  placeholder="0"
                  value={productForm.stock}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="product-image" className="mb-2 block text-sm font-semibold text-ink">
                  Product image
                </label>
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProductForm((prev) => ({ ...prev, image: file }));
                    setProductImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="block w-full rounded-[1.4rem] border border-line bg-panel/92 px-3 py-2 text-sm text-ink"
                />
                {productImagePreview ? (
                  <img src={productImagePreview} alt="Preview" className="mt-3 max-h-40 rounded-lg border border-line object-contain" />
                ) : null}
              </div>
              <Button className="w-full sm:w-auto" type="submit">
                Add product
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            {dashboard.products.length === 0 ? <EmptyState title="No products yet" description="Add a product to publish it in your storefront." /> : null}
            {dashboard.products.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[1.4rem] border border-line/70 bg-panel/92 p-4 sm:flex-row">
                {item.image ? (
                  <img
                    src={resolveMediaSrc(item.image) || undefined}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg border border-line object-cover"
                    style={{ background: "#f8f8f8" }}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <DetailRow label={item.name} value={formatCurrency(item.price)} />
                  <p className="mt-2 text-sm text-ink-soft">
                    {item.category} | Stock: {item.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Surface>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type Category = {
  id: string;
  name: string;
};

type ProductTag = {
  tag: { name: string };
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: Category;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  description: string;
  basePrice: number;
  stock: number;
  isActive: boolean;
  thumbnail?: string | null;
  images?: string[] | null;
  productTags?: ProductTag[];
};

type AdminProductManagerProps = {
  products: AdminProduct[];
  categories: Category[];
};

const initialFormState = (categories: Category[]) => ({
  name: '',
  slug: '',
  sku: '',
  categoryId: categories[0]?.id ?? '',
  status: 'DRAFT',
  description: '',
  basePrice: 0,
  stock: 0,
  isActive: true,
  thumbnail: '',
  imagesCsv: '',
  tagNamesCsv: '',
});

export default function AdminProductManager({ products: initialProducts, categories }: AdminProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [formState, setFormState] = useState(() => initialFormState(categories));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categoriesOptions = useMemo(() => categories, [categories]);

  const resetForm = () => {
    setSelectedProduct(null);
    setFormState(initialFormState(categories));
    setMessage(null);
  };

  const openNewProductForm = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEditProductForm = (product: AdminProduct) => {
    setSelectedProduct(product);
    setFormState({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: product.category.id,
      status: product.status,
      description: product.description,
      basePrice: product.basePrice,
      stock: product.stock,
      isActive: product.isActive,
      thumbnail: product.thumbnail ?? '',
      imagesCsv: (product.images ?? []).join(', '),
      tagNamesCsv: (product.productTags ?? []).map((tag) => tag.tag.name).join(', '),
    });
    setMessage(null);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    resetForm();
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const parseList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const saveProduct = async () => {
    if (!formState.name || !formState.sku || !formState.categoryId) {
      setMessage({ type: 'error', text: 'Name, SKU, and category are required.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      name: formState.name,
      slug: formState.slug || undefined,
      sku: formState.sku,
      categoryId: formState.categoryId,
      status: formState.status,
      description: formState.description,
      basePrice: Number(formState.basePrice),
      stock: Number(formState.stock),
      isActive: formState.isActive,
      thumbnail: formState.thumbnail || null,
      images: parseList(formState.imagesCsv),
      tagNames: parseList(formState.tagNamesCsv),
    };

    try {
      const response = await fetch(
        selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products',
        {
          method: selectedProduct ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message ?? result.error ?? 'Unable to save product.');
      }

      const updatedProduct: AdminProduct = {
        ...result.data,
        basePrice: Number(result.data.basePrice),
        stock: Number(result.data.stock),
        category: result.data.category,
        images: Array.isArray(result.data.images) ? result.data.images : [],
        productTags: Array.isArray(result.data.productTags) ? result.data.productTags : [],
      };

      setProducts((current) => {
        if (selectedProduct) {
          return current.map((item) => (item.id === updatedProduct.id ? updatedProduct : item));
        }
        return [updatedProduct, ...current];
      });

      setMessage({ type: 'success', text: selectedProduct ? 'Product updated.' : 'Product created.' });
      setIsSaving(false);
      setTimeout(closeForm, 800);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Product save failed.' });
      setIsSaving(false);
    }
  };

  const archiveProduct = async (product: AdminProduct) => {
    const confirmed = window.confirm(`Archive product "${product.name}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message ?? result.error ?? 'Archive failed.');
      }
      setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, status: 'ARCHIVED', isActive: false } : item)));
      setMessage({ type: 'success', text: 'Product archived successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to archive product.' });
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Product & Inventory Management</h1>
          <p className="text-timber-500">Manage catalog status, SKU coverage, variants, and stock health.</p>
        </div>
        <button onClick={openNewProductForm} className="bg-wood-950 hover:bg-wood-800 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-wood-950 text-sm font-bold">+</span>
          Add Product
        </button>
      </div>

      {message ? (
        <div className={`mb-6 rounded-2xl border px-5 py-4 ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
          {message.text}
        </div>
      ) : null}

      <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-wood-50 dark:bg-timber-950/50">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100 dark:divide-timber-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-timber-500">No products found in inventory.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const imageSrc = product.thumbnail || product.images?.[0] || '/textures/teak.webp';
                  return (
                    <tr key={product.id} className="hover:bg-wood-50 dark:hover:bg-timber-800/50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg bg-timber-100 overflow-hidden shrink-0">
                            <Image src={imageSrc} alt={product.name} fill sizes="48px" className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-wood-950 dark:text-white">{product.name}</p>
                            <p className="text-xs text-timber-500 font-mono">{product.sku} • {product.slug}</p>
                            {product.productTags?.length ? (
                              <p className="text-xs text-timber-500">Tags: {product.productTags.map((tag) => tag.tag.name).join(', ')}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wood-100 dark:bg-timber-800 text-wood-800 dark:text-timber-300">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                          <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-wood-950 dark:text-white'}`}>
                            {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : product.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-timber-100 text-timber-700 dark:bg-timber-800 dark:text-timber-300'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-wood-950 dark:text-white">₹{product.basePrice.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-timber-500"> / unit</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditProductForm(product)}
                          className="text-accent hover:text-yellow-600 font-medium text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => archiveProduct(product)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-timber-950 shadow-2xl border border-wood-200 dark:border-timber-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-wood-100 dark:border-timber-800">
              <div>
                <h2 className="text-xl font-bold text-wood-950 dark:text-white">{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
                <p className="text-sm text-timber-500">{selectedProduct ? 'Update product details and save changes.' : 'Create a new catalog item.'}</p>
              </div>
              <button onClick={closeForm} className="text-timber-500 hover:text-wood-950 dark:hover:text-white">Close</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Product name
                  <input
                    value={formState.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="Enter product name"
                  />
                </label>
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  SKU
                  <input
                    value={formState.sku}
                    onChange={(event) => updateField('sku', event.target.value)}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="SKU code"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Category
                  <select
                    value={formState.categoryId}
                    onChange={(event) => updateField('categoryId', event.target.value)}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                  >
                    {categoriesOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Status
                  <select
                    value={formState.status}
                    onChange={(event) => updateField('status', event.target.value)}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Active
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formState.isActive}
                      onChange={(event) => updateField('isActive', event.target.checked)}
                      className="h-5 w-5 rounded border-wood-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-timber-500">Available for storefront</span>
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Price
                  <input
                    type="number"
                    value={formState.basePrice}
                    onChange={(event) => updateField('basePrice', Number(event.target.value))}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="Base price"
                  />
                </label>
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Stock
                  <input
                    type="number"
                    value={formState.stock}
                    onChange={(event) => updateField('stock', Number(event.target.value))}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="Stock quantity"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                Description
                <textarea
                  value={formState.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="w-full min-h-[120px] rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent resize-none"
                  placeholder="Product description"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Thumbnail URL
                  <input
                    value={formState.thumbnail}
                    onChange={(event) => updateField('thumbnail', event.target.value)}
                    className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                    placeholder="https://..."
                  />
                </label>
                <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                  Image URLs
                  <textarea
                    value={formState.imagesCsv}
                    onChange={(event) => updateField('imagesCsv', event.target.value)}
                    className="w-full min-h-[120px] rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent resize-none"
                    placeholder="One URL per comma-separated value"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-timber-700 dark:text-timber-300">
                Tags
                <input
                  value={formState.tagNamesCsv}
                  onChange={(event) => updateField('tagNamesCsv', event.target.value)}
                  className="w-full rounded-2xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-900 text-wood-950 dark:text-white px-4 py-3 focus:outline-none focus:border-accent"
                  placeholder="Comma-separated tags"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-wood-300 bg-wood-100 text-wood-950 px-5 py-3 hover:bg-wood-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProduct}
                  disabled={isSaving}
                  className="rounded-2xl bg-wood-950 text-white px-5 py-3 font-semibold hover:bg-wood-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Search, Star, Trash2, Upload, X } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { PRODUCT_CATEGORIES } from '../../data/categories.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { productService, uploadService } from '../../services/store.service.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const emptyForm = {
  name: '',
  category: PRODUCT_CATEGORIES[0],
  price: '',
  compareAtPrice: '',
  stock: '',
  image: '',
  description: '',
  benefits: '',
  tag: '',
  isFeatured: false,
  isActive: true,
};

function toForm(product) {
  return {
    name: product.name,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice || '',
    stock: product.stock,
    image: product.image,
    description: product.description,
    benefits: (product.benefits || []).join(', '),
    tag: product.tag || '',
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };
}

export default function AdminProducts() {
  useDocumentTitle('Manage Products');

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');

    productService
      .list({ includeInactive: 'true', limit: 48, sort: 'newest' })
      .then((data) => {
        if (isActive) {
          setProducts(data.items);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'We could not load products.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    );
  }, [products, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm(toForm(product));
    setFormError('');
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleImageFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setFormError('');

    try {
      const data = await uploadService.image(file);
      setForm((current) => ({ ...current, image: data.url }));
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'We could not upload that image.'));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      image: form.image,
      description: form.description,
      benefits: form.benefits
        .split(',')
        .map((benefit) => benefit.trim())
        .filter(Boolean),
      tag: form.tag || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    if (form.compareAtPrice) {
      payload.compareAtPrice = Number(form.compareAtPrice);
    }

    try {
      if (editing) {
        await productService.update(editing._id, payload);
        setNotice(`${form.name} updated.`);
      } else {
        await productService.create(payload);
        setNotice(`${form.name} added to the storefront.`);
      }
      setIsFormOpen(false);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'We could not save this product.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Remove ${product.name} from the storefront?`)) {
      return;
    }

    try {
      await productService.remove(product._id);
      setNotice(`${product.name} removed from the storefront.`);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not remove this product.'));
    }
  }

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
            Catalogue
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium text-forest">
            Product management
          </h1>
          <p className="mt-2 text-sm text-ink/50">
            {products.length} product{products.length === 1 ? '' : 's'} in your collection.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:-translate-y-0.5 hover:bg-forest-light"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </button>
      </Reveal>

      {notice && <Alert type="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest/40"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full border border-forest/15 bg-card py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-64 rounded-[1.75rem]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-forest/20 bg-card px-6 py-16 text-center">
          <p className="font-display text-2xl text-forest">No products found.</p>
          <p className="mt-2 text-sm text-ink/45">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product, index) => (
            <article
              key={product._id}
              className="group overflow-hidden rounded-[1.75rem] border border-forest/10 bg-card shadow-[0_20px_60px_-50px_rgba(14,42,35,0.6)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_-40px_rgba(14,42,35,0.5)]"
              style={{ animation: `fade-up 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 50}ms both` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {product.isFeatured && (
                    <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-forest-dark">
                      <Star className="size-2.5 fill-current" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                  {!product.isActive && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-clay">
                      {product.category}
                    </p>
                    <h2 className="mt-1 truncate font-display text-xl font-semibold text-forest">
                      {product.name}
                    </h2>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-forest">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-ink/45">
                  <span
                    className={`font-bold ${
                      product.stock <= 5 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                  <span>{product.reviewCount} reviews</span>
                </div>

                <div className="mt-4 flex gap-2 border-t border-forest/10 pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/15 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest transition hover:border-forest hover:bg-forest hover:text-ivory"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="grid size-10 place-items-center rounded-full border border-forest/15 text-ink/40 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest-dark/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
                  {editing ? 'Edit product' : 'New product'}
                </p>
                <h2 className="mt-2 font-display text-3xl font-medium text-forest">
                  {editing ? editing.name : 'Add to the collection'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-forest/15 text-forest/50 transition hover:text-forest"
                aria-label="Close form"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {formError && <Alert>{formError}</Alert>}

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="product-name"
                  name="name"
                  label="Product name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                    Category
                  </span>
                  <select
                    id="product-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <InputField
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  label="Price (RWF)"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
                <InputField
                  id="product-compare"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  label="Compare-at price"
                  value={form.compareAtPrice}
                  onChange={handleChange}
                  hint="Optional"
                />
                <InputField
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  label="Stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
                <InputField
                  id="product-tag"
                  name="tag"
                  label="Tag"
                  value={form.tag}
                  onChange={handleChange}
                  hint="e.g. Bestseller"
                />
              </div>

              <div className="rounded-2xl border border-forest/15 bg-card p-4">
                <span className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                  Product image
                </span>
                <div className="flex items-center gap-4">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="size-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid size-24 shrink-0 place-items-center rounded-xl bg-sand text-forest/25">
                      <ImagePlus className="size-7" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-forest/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest transition hover:border-forest hover:bg-forest hover:text-ivory ${
                        isUploading ? 'pointer-events-none opacity-60' : ''
                      }`}
                    >
                      <Upload className="size-3.5" aria-hidden="true" />
                      {isUploading ? 'Uploading...' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageFile}
                        disabled={isUploading}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs text-ink/45">
                      JPG, PNG, WEBP or GIF up to 5MB. Cloudinary is used when configured.
                    </p>
                  </div>
                </div>
              </div>

              <InputField
                id="product-image"
                name="image"
                type="url"
                label="Image URL"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                hint="Paste a URL or upload above"
                required
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                  Description
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-forest/70">
                  Benefits
                </span>
                <textarea
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Deeply hydrating, Evens skin tone, Fast-absorbing"
                  className="w-full rounded-2xl border border-forest/15 bg-card px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                />
                <span className="mt-1.5 block text-xs text-ink/45">
                  Separate each benefit with a comma.
                </span>
              </label>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm text-forest">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="size-4 rounded border-forest/30 text-forest focus:ring-gold"
                  />
                  Feature on homepage
                </label>
                <label className="flex items-center gap-2 text-sm text-forest">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="size-4 rounded border-forest/30 text-forest focus:ring-gold"
                  />
                  Visible on storefront
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-forest px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-forest/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-forest transition hover:border-forest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

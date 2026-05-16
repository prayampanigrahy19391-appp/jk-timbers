import { getCatalogProducts, getCatalogProductById } from '@/repositories/catalogRepository';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Package, Truck, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getCatalogProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link href="/catalog" className="inline-flex items-center gap-2 text-timber-500 hover:text-wood-950 dark:hover:text-white font-medium mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>

        <div className="bg-white dark:bg-timber-900 rounded-3xl shadow-2xl border border-wood-100 dark:border-timber-800 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Product Image */}
          <div className="w-full lg:w-1/2 relative h-[400px] lg:h-auto bg-timber-100 dark:bg-timber-800">
            {product.badge && (
              <div className="absolute top-6 left-6 z-10 bg-accent text-wood-950 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                {product.badge}
              </div>
            )}
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <span className="text-sm font-bold tracking-widest uppercase text-timber-500 mb-2 block">{product.category}</span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-2 mb-8 border-b border-wood-100 dark:border-timber-800 pb-8">
              <span className="text-4xl font-black text-accent">{product.price}</span>
              <span className="text-lg text-timber-500 font-medium">/ {product.unit}</span>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-4">Product Description</h3>
              <p className="text-timber-600 dark:text-timber-300 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div>
                <span className="flex items-center gap-2 text-sm text-timber-500 font-bold uppercase mb-1">
                  <Package size={16} /> Stock Status
                </span>
                <span className="text-wood-900 dark:text-white font-medium">{product.stock}</span>
              </div>
              <div>
                <span className="flex items-center gap-2 text-sm text-timber-500 font-bold uppercase mb-1">
                  <Truck size={16} /> Origin
                </span>
                <span className="text-wood-900 dark:text-white font-medium">{product.origin}</span>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-wood-950 dark:text-white mb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-timber-700 dark:text-timber-300 font-medium bg-wood-50 dark:bg-timber-800 p-3 rounded-xl border border-wood-100 dark:border-timber-700">
                    <CheckCircle className="text-accent shrink-0" size={20} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <AddToCartButton product={{
              id: product.id,
              name: product.name,
              price: product.price,
              unit: product.unit,
              image: product.image
            }} />

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-timber-500 font-medium">
              <ShieldCheck size={16} className="text-accent" /> 100% Quality Assured by JK Timber
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

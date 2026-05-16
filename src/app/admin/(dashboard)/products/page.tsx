import { prisma } from '@/lib/prisma';
import { Package, Plus } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Inventory Management</h1>
          <p className="text-timber-500">View and manage your product catalog.</p>
        </div>
        <button className="bg-wood-950 hover:bg-wood-800 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-wood-50 dark:bg-timber-950/50">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-medium text-timber-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100 dark:divide-timber-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-timber-500">
                    <Package size={48} className="mx-auto text-timber-300 mb-4" />
                    <p>No products found in inventory.</p>
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const images = JSON.parse(product.images);
                  const mainImage = images.length > 0 ? images[0] : '/placeholder.png';
                  
                  return (
                    <tr key={product.id} className="hover:bg-wood-50 dark:hover:bg-timber-800/50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg bg-timber-100 overflow-hidden shrink-0">
                            <Image src={mainImage} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-wood-950 dark:text-white">{product.name}</p>
                            <p className="text-xs text-timber-500 font-mono">{product.slug}</p>
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
                        <span className="font-bold text-wood-950 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-timber-500"> / {product.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-accent hover:text-yellow-600 font-medium text-sm transition-colors opacity-0 group-hover:opacity-100">
                          Edit
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
    </>
  );
}

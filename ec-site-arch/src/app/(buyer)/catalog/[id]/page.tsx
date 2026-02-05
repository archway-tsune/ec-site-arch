'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductDetail } from '@/domains/catalog/ui/ProductDetail';
import type { Product } from '@/contracts/catalog';

interface ProductResponse {
  success: boolean;
  data?: Product;
  error?: { message: string };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchProduct = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    setError(undefined);

    try {
      const res = await fetch(`/api/catalog/products/${params.id}`);
      const data: ProductResponse = await res.json();

      if (data.success && data.data) {
        setProduct(data.data);
      } else {
        setError(data.error?.message || '商品の取得に失敗しました');
      }
    } catch {
      setError('商品の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch {
      // エラーハンドリング
    }
  };

  const handleBack = () => {
    router.push('/catalog');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetail
        product={product}
        isLoading={isLoading}
        error={error}
        onAddToCart={handleAddToCart}
        onBack={handleBack}
      />
    </div>
  );
}

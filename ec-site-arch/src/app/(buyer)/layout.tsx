'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Layout } from '@/templates/ui/components/layout/Layout';

interface SessionData {
  userId: string;
  role: 'buyer' | 'admin';
  name: string;
}

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  const fetchSession = useCallback(async (): Promise<SessionData | null> => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSession(data.data);
          return data.data;
        }
      }
    } catch {
      // セッションなし
    }
    return null;
  }, []);

  const autoLogin = useCallback(async () => {
    // デモ用：自動でbuyer としてログイン
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'buyer@example.com', password: 'demo' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSession(data.data);
          return data.data;
        }
      }
    } catch {
      // ログイン失敗
    }
    return null;
  }, []);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCartCount(data.data.itemCount || 0);
        }
      }
    } catch {
      // カートなし
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (initRef.current) return;
      initRef.current = true;

      let currentSession = await fetchSession();
      if (!currentSession) {
        // 未認証の場合、デモ用に自動ログイン
        currentSession = await autoLogin();
      }
      if (currentSession) {
        await fetchCartCount();
      }
      setIsReady(true);
    };
    init();

    // カスタムイベントでカート更新を監視
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [fetchSession, autoLogin, fetchCartCount]);

  const navLinks = [
    { href: '/catalog', label: '商品一覧' },
    { href: '/cart', label: 'カート' },
    { href: '/orders', label: '注文履歴' },
  ];

  const footerLinks = [
    { href: '/privacy', label: 'プライバシーポリシー' },
    { href: '/terms', label: '利用規約' },
  ];

  // 認証が完了するまでローディング表示
  if (!isReady) {
    return (
      <Layout
        headerProps={{
          siteName: 'EC Site',
          navLinks,
          cartCount: 0,
          isLoggedIn: false,
          loginHref: '/login',
        }}
        footerProps={{
          copyright: '© 2026 EC Site',
          links: footerLinks,
        }}
      >
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-base-900 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      headerProps={{
        siteName: 'EC Site',
        navLinks,
        cartCount,
        isLoggedIn: !!session,
        userName: session?.name,
        loginHref: '/login',
        logoutHref: '/api/auth/logout',
      }}
      footerProps={{
        copyright: '© 2026 EC Site',
        links: footerLinks,
      }}
    >
      {children}
    </Layout>
  );
}

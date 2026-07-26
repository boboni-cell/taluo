'use client';

import { useState, useEffect } from 'react';
import { checkPermission } from '@/lib/permissions-client';

/**
 * 权限检查 React Hook
 *
 * 用法：
 *   const { hasPermission, isLoading } = usePermission('tarot');
 *
 * @param moduleId - 权限模块标识符（如 'tarot', 'personality'）
 * @returns { hasPermission: boolean, isLoading: boolean }
 */
export function usePermission(moduleId: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setIsLoading(true);
      try {
        const permitted = await checkPermission(moduleId);
        if (!cancelled) {
          setHasPermission(permitted);
        }
      } catch (error) {
        console.error(`[usePermission] Failed to check "${moduleId}":`, error);
        if (!cancelled) {
          setHasPermission(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  return { hasPermission, isLoading };
}

import { describe, expect, it } from 'vitest';
import {
  findActiveNavItem,
  getMoreItems,
  getVisibleNavItems,
} from '../../../src/core/navigation/dashboardNavigation';

describe('navigation du dashboard', () => {
  it('résout le module actif, y compris sur une page de détail', () => {
    expect(findActiveNavItem('/dashboard')?.id).toBe('home');
    expect(findActiveNavItem('/dashboard/categories')?.id).toBe('categories');
    expect(findActiveNavItem('/dashboard/quotations/123')).toBeUndefined();
    expect(findActiveNavItem('/dashboard/products')?.mobileTab).toBe('products');
    expect(findActiveNavItem('/catalogue')).toBeUndefined();
  });

  it('place dans « Plus » les modules sans onglet mobile dédié', () => {
    expect(getMoreItems('superAdmin').map((item) => item.id)).toEqual([
      'messages',
      'pages',
      'media',
      'admins',
    ]);
  });

  it('masque la gestion des administrateurs aux admins non superAdmin', () => {
    expect(getVisibleNavItems('admin').map((item) => item.id)).not.toContain('admins');
    expect(getMoreItems('admin').map((item) => item.id)).not.toContain('admins');
    expect(getVisibleNavItems('superAdmin').map((item) => item.id)).toContain('admins');
  });
});

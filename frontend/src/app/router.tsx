import { createBrowserRouter, Outlet, type RouteObject } from 'react-router';
import { LOGIN_PATH, RequireAuth } from '../core/auth/RequireAuth';
import { RequireRole } from '../core/auth/RequireRole';
import { LoadingState } from '../core/components/LoadingState';
import { DASHBOARD_ROOT, dashboardNavItems } from '../core/navigation/dashboardNavigation';
import { recoverEncodedFragment } from '../core/navigation/recoverEncodedFragment';
import { AuthLayout } from '../layouts/AuthLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { RouteErrorPage } from '../pages/RouteErrorPage';

const publicRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => ({ Component: (await import('../pages/public/HomePage')).HomePage }),
  },
  {
    path: 'catalogue',
    lazy: async () => ({ Component: (await import('../pages/public/CatalogPage')).CatalogPage }),
  },
  {
    path: 'catalogue/:slug',
    lazy: async () => ({ Component: (await import('../pages/public/ProductPage')).ProductPage }),
  },
  {
    path: 'panier',
    lazy: async () => ({
      Component: (await import('../pages/public/QuotationRequestPage')).QuotationRequestPage,
    }),
  },
];

/** Modules disposant de leurs propres écrans ; les autres affichent un écran structurel. */
const implementedModuleIds = new Set([
  'home',
  'admins',
  'products',
  'categories',
  'media',
  'pages',
  'messages',
  'notifications',
]);

const productEditor = async () => ({
  Component: (await import('../pages/dashboard/catalog/ProductEditorPage')).ProductEditorPage,
});

/** Catalogue, médiathèque et CMS : accessibles à tout administrateur. */

const communicationRoutes: RouteObject[] = [
  {
    path: 'messages',
    lazy: async () => ({
      Component: (await import('../pages/dashboard/messages/MessagesPage')).MessagesPage,
    }),
  },
  {
    path: 'messages/:id',
    lazy: async () => ({
      Component: (await import('../pages/dashboard/messages/MessageDetailPage')).MessageDetailPage,
    }),
  },
  {
    path: 'notifications',
    lazy: async () => ({
      Component: (await import('../pages/dashboard/NotificationsPage')).NotificationsPage,
    }),
  },
];

const contentRoutes: RouteObject[] = [
  {
    path: 'products',
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../pages/dashboard/catalog/ProductsListPage')).ProductsListPage,
        }),
      },
      { path: 'nouveau', lazy: productEditor },
      { path: ':id', lazy: productEditor },
    ],
  },
  {
    path: 'categories',
    lazy: async () => ({
      Component: (await import('../pages/dashboard/catalog/CategoriesPage')).CategoriesPage,
    }),
  },
  {
    path: 'media',
    lazy: async () => ({
      Component: (await import('../pages/dashboard/media/MediaLibraryPage')).MediaLibraryPage,
    }),
  },
  {
    path: 'pages',
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../pages/dashboard/content/PagesListPage')).PagesListPage,
        }),
      },
      {
        path: ':id',
        lazy: async () => ({
          Component: (await import('../pages/dashboard/content/PageEditorPage')).PageEditorPage,
        }),
      },
      {
        path: ':id/preview',
        lazy: async () => ({
          Component: (await import('../pages/dashboard/content/PagePreviewPage')).PagePreviewPage,
        }),
      },
    ],
  },
];

const adminRoutes: RouteObject = {
  path: 'admins',
  element: (
    <RequireRole role="superAdmin">
      <Outlet />
    </RequireRole>
  ),
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('../pages/dashboard/admins/AdminsListPage')).AdminsListPage,
      }),
    },
    {
      path: 'nouveau',
      lazy: async () => ({
        Component: (await import('../pages/dashboard/admins/AdminCreatePage')).AdminCreatePage,
      }),
    },
    {
      path: ':id',
      lazy: async () => ({
        Component: (await import('../pages/dashboard/admins/AdminDetailPage')).AdminDetailPage,
      }),
    },
  ],
};

const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    {
      path: LOGIN_PATH,
      lazy: async () => ({ Component: (await import('../pages/auth/LoginPage')).LoginPage }),
    },
    {
      path: '/mot-de-passe-oublie',
      lazy: async () => ({
        Component: (await import('../pages/auth/ForgotPasswordPage')).ForgotPasswordPage,
      }),
    },
    {
      path: '/definir-mot-de-passe',
      lazy: async () => ({
        Component: (await import('../pages/auth/SetPasswordPage')).SetPasswordPage,
      }),
    },
  ],
};

// Routes des modules dérivées de la configuration unique de navigation.
const dashboardModuleRoutes: RouteObject[] = dashboardNavItems
  .filter((item) => !implementedModuleIds.has(item.id))
  .map((item) => ({
    path: item.path.slice(DASHBOARD_ROOT.length + 1),
    lazy: async () => {
      const { DashboardModulePage } = await import('../pages/dashboard/DashboardModulePage');
      return { element: <DashboardModulePage item={item} /> };
    },
  }));

export const routes: RouteObject[] = [
  {
    hydrateFallbackElement: <LoadingState fullPage />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <PublicLayout />, children: publicRoutes },
      authRoutes,
      {
        path: DASHBOARD_ROOT,
        // Toutes les routes /dashboard/* exigent une session valide.
        lazy: async () => {
          const { DashboardLayout } = await import('../layouts/DashboardLayout');
          return {
            element: (
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            ),
          };
        },
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('../pages/dashboard/DashboardHomePage')).DashboardHomePage,
            }),
          },
          adminRoutes,
          ...contentRoutes,
          ...communicationRoutes,
          ...dashboardModuleRoutes,
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('../pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
];

// Rétablit un fragment encodé (%23) avant que le routeur ne lise l'URL initiale.
const recoveredUrl = recoverEncodedFragment(window.location);
if (recoveredUrl) window.history.replaceState(window.history.state, '', recoveredUrl);

export const router = createBrowserRouter(routes);

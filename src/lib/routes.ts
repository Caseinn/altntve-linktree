export const ROUTES = {
  dashboard: "/dashboard",
  dashboardLinks: "/dashboard/links",
  home: "/",
  login: "/login",
} as const

export const publicLinkHref = (slug: string) => `/l/${slug}` as const

export const APP_PREFIX =
  process.env.NODE_ENV === "production" ? "/sheet2web" : "";

export function appPath(path: string) {
  if (
    !APP_PREFIX ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path === APP_PREFIX ||
    path.startsWith(`${APP_PREFIX}/`)
  ) {
    return path;
  }

  return `${APP_PREFIX}${path}`;
}

export function internalPath(pathname: string) {
  if (APP_PREFIX && pathname.startsWith(`${APP_PREFIX}/`)) {
    return pathname.slice(APP_PREFIX.length);
  }

  return pathname === APP_PREFIX ? "/" : pathname;
}

export function pushAppPath(router: { push: (path: string) => void }, path: string) {
  const url = appPath(path);
  if (APP_PREFIX) {
    window.location.assign(url);
  } else {
    router.push(url);
  }
}

export function replaceAppPath(
  router: { replace: (path: string) => void },
  path: string,
) {
  const url = appPath(path);
  if (APP_PREFIX) {
    window.location.replace(url);
  } else {
    router.replace(url);
  }
}

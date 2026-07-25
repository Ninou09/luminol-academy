import { clerkMiddleware } from '@luminol/auth/middleware';
import { isPublicAuthPath } from '@luminol/auth/routes';

export default clerkMiddleware(async (authentication, request) => {
  if (!isPublicAuthPath(request.nextUrl.pathname))
    await authentication.protect();
});

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico)).*)',
    '/(api|trpc)(.*)',
  ],
};

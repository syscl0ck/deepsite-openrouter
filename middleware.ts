import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-current-host", request.nextUrl.host);

  // Check if the request is coming from an iframe
  const referer = request.headers.get("referer");
  const currentHost = request.nextUrl.host;
  const currentOrigin = `${request.nextUrl.protocol}//${currentHost}`;
  
  // Helper function to check if a URL is from allowed domains
  const isAllowedDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return hostname.endsWith('.huggingface.co') || 
             hostname.endsWith('.hf.co') || 
             hostname === 'huggingface.co' || 
             hostname === 'hf.co';
    } catch {
      return false;
    }
  };
  
  // If there's a referer and it's not from the same origin, check if it's allowed
  if (referer && !referer.startsWith(currentOrigin)) {
    // Additional check: look for iframe-specific headers or indicators
    const secFetchDest = request.headers.get("sec-fetch-dest");
    const secFetchMode = request.headers.get("sec-fetch-mode");
    
    // If the request is for a document within an iframe context
    if (secFetchDest === "iframe" || 
        (secFetchDest === "document" && secFetchMode === "navigate" && referer)) {
      
      // Check if the referer is from an allowed domain
      if (!isAllowedDomain(referer)) {
        return NextResponse.redirect("https://deepsite.hf.co");
      }
    }
  }

  // Set headers to prevent framing
  const response = NextResponse.next({ headers });
  
  // Allow embedding only from Hugging Face domains
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Content-Security-Policy", 
    "frame-ancestors 'self' *.huggingface.co *.hf.co huggingface.co hf.co;"
  );
  
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

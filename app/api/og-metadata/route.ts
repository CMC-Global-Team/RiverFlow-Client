import { NextRequest, NextResponse } from 'next/server'

interface OGMetadata {
    title: string
    description: string
    image: string
    siteName: string
    favicon: string
    url: string
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    try {
        // Validate URL
        const parsedUrl = new URL(url)

        // Fetch the page content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RiverFlow/1.0; +https://riverflow.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            // 5 second timeout
            signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`)
        }

        const html = await response.text()

        // Parse OG metadata
        const metadata: OGMetadata = {
            title: extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html) || parsedUrl.hostname,
            description: extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractMeta(html, 'description') || '',
            image: normalizeUrl(extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '', parsedUrl.origin),
            siteName: extractMeta(html, 'og:site_name') || parsedUrl.hostname,
            favicon: normalizeUrl(extractFavicon(html) || '/favicon.ico', parsedUrl.origin),
            url: url,
        }

        return NextResponse.json(metadata)
    } catch (error: any) {
        console.error('Error fetching OG metadata:', error)
        return NextResponse.json({
            title: new URL(url).hostname,
            description: 'Unable to load preview',
            image: '',
            siteName: new URL(url).hostname,
            favicon: '',
            url: url,
            error: error.message,
        })
    }
}

// Helper function to extract meta content
function extractMeta(html: string, property: string): string {
    // Try property attribute
    const propertyMatch = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    if (propertyMatch) return propertyMatch[1]

    // Try content first then property
    const propertyMatch2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
    if (propertyMatch2) return propertyMatch2[1]

    // Try name attribute
    const nameMatch = html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    if (nameMatch) return nameMatch[1]

    // Try content first then name
    const nameMatch2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'))
    if (nameMatch2) return nameMatch2[1]

    return ''
}

// Helper function to extract title from <title> tag
function extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match ? match[1].trim() : ''
}

// Helper function to extract favicon
function extractFavicon(html: string): string {
    // Try link rel="icon"
    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
    if (iconMatch) return iconMatch[1]

    // Try href first then rel
    const iconMatch2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)
    if (iconMatch2) return iconMatch2[1]

    return ''
}

// Helper function to normalize relative URLs to absolute
function normalizeUrl(url: string, origin: string): string {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }
    if (url.startsWith('//')) {
        return 'https:' + url
    }
    if (url.startsWith('/')) {
        return origin + url
    }
    return origin + '/' + url
}

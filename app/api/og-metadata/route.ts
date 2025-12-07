import { NextRequest, NextResponse } from 'next/server'

interface OGMetadata {
    title: string
    description: string
    image: string
    siteName: string
    favicon: string
    url: string
    type: 'website' | 'image' | 'video' | 'youtube' | 'vimeo'
    videoEmbedUrl?: string
    videoId?: string
}

// Image file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']

// Detect if URL is a direct image
function isImageUrl(url: string): boolean {
    const urlLower = url.toLowerCase()
    return IMAGE_EXTENSIONS.some(ext => urlLower.includes(ext))
}

// Detect if URL is a direct video
function isVideoUrl(url: string): boolean {
    const urlLower = url.toLowerCase()
    return VIDEO_EXTENSIONS.some(ext => urlLower.includes(ext))
}

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

// Extract Vimeo video ID
function getVimeoVideoId(url: string): string | null {
    const patterns = [
        /vimeo\.com\/(\d+)/i,
        /player\.vimeo\.com\/video\/(\d+)/i,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    try {
        const parsedUrl = new URL(url)

        // Check for direct image URL
        if (isImageUrl(url)) {
            return NextResponse.json({
                title: parsedUrl.pathname.split('/').pop() || 'Image',
                description: '',
                image: url,
                siteName: parsedUrl.hostname,
                favicon: '',
                url: url,
                type: 'image',
            })
        }

        // Check for direct video URL
        if (isVideoUrl(url)) {
            return NextResponse.json({
                title: parsedUrl.pathname.split('/').pop() || 'Video',
                description: '',
                image: '',
                siteName: parsedUrl.hostname,
                favicon: '',
                url: url,
                type: 'video',
            })
        }

        // Check for YouTube
        const youtubeId = getYouTubeVideoId(url)
        if (youtubeId) {
            return NextResponse.json({
                title: 'YouTube Video',
                description: '',
                image: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
                siteName: 'YouTube',
                favicon: 'https://www.youtube.com/favicon.ico',
                url: url,
                type: 'youtube',
                videoEmbedUrl: `https://www.youtube.com/embed/${youtubeId}`,
                videoId: youtubeId,
            })
        }

        // Check for Vimeo
        const vimeoId = getVimeoVideoId(url)
        if (vimeoId) {
            return NextResponse.json({
                title: 'Vimeo Video',
                description: '',
                image: '',
                siteName: 'Vimeo',
                favicon: 'https://vimeo.com/favicon.ico',
                url: url,
                type: 'vimeo',
                videoEmbedUrl: `https://player.vimeo.com/video/${vimeoId}`,
                videoId: vimeoId,
            })
        }

        // Fetch the page content for regular websites
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RiverFlow/1.0; +https://riverflow.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`)
        }

        const html = await response.text()

        // Check for og:video
        const ogVideo = extractMeta(html, 'og:video') || extractMeta(html, 'og:video:url')
        const ogType = extractMeta(html, 'og:type')

        const metadata: OGMetadata = {
            title: extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html) || parsedUrl.hostname,
            description: extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractMeta(html, 'description') || '',
            image: normalizeUrl(extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '', parsedUrl.origin),
            siteName: extractMeta(html, 'og:site_name') || parsedUrl.hostname,
            favicon: normalizeUrl(extractFavicon(html) || '/favicon.ico', parsedUrl.origin),
            url: url,
            type: ogType?.includes('video') ? 'video' : 'website',
        }

        // If there's a video URL in OG tags
        if (ogVideo) {
            metadata.type = 'video'
            metadata.videoEmbedUrl = normalizeUrl(ogVideo, parsedUrl.origin)
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
            type: 'website',
            error: error.message,
        })
    }
}

// Helper function to extract meta content
function extractMeta(html: string, property: string): string {
    const propertyMatch = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    if (propertyMatch) return propertyMatch[1]

    const propertyMatch2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'))
    if (propertyMatch2) return propertyMatch2[1]

    const nameMatch = html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    if (nameMatch) return nameMatch[1]

    const nameMatch2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'))
    if (nameMatch2) return nameMatch2[1]

    return ''
}

function extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match ? match[1].trim() : ''
}

function extractFavicon(html: string): string {
    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
    if (iconMatch) return iconMatch[1]

    const iconMatch2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)
    if (iconMatch2) return iconMatch2[1]

    return ''
}

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

import { generateText } from 'ai'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check if article already exists for this user
    const { data: existingReading } = await supabase
      .from('readings')
      .select('id')
      .eq('user_id', user.id)
      .eq('url', url)
      .single()

    if (existingReading) {
      return NextResponse.json(
        { error: 'Article already exists in your reading list' },
        { status: 409 }
      )
    }

    // Fetch FIRECRAWL_API_KEY from environment
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY

    if (!firecrawlApiKey) {
      return NextResponse.json(
        {
          error:
            'Firecrawl API key not configured. Please add FIRECRAWL_API_KEY to your environment variables.',
        },
        { status: 500 }
      )
    }

    // Scrape the URL using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
      }),
    })

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text()
      console.error('Firecrawl error:', errorText)
      return NextResponse.json(
        { error: 'Failed to scrape article' },
        { status: 500 }
      )
    }

    const scrapeData = await scrapeResponse.json()
    const markdown = scrapeData.data?.markdown || ''
    const metadata = scrapeData.data?.metadata || {}

    const title = metadata.title || 'Untitled Article'
    const ogImage = metadata.ogImage || metadata.image || null
    const favicon = metadata.favicon || null

    // Generate summary using AI (max 280 characters)
    const { text: summary } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Summarize this article in maximum 280 characters. Be concise and capture the main point:\n\n${markdown.slice(
        0,
        3000
      )}`,
      maxOutputTokens: 280,
    })



    // Insert into database
    const { data, error: insertError } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        url,
        title,
        og_image: ogImage,
        favicon,
        summary: summary.slice(0, 280),
        content: markdown,
        embedding: undefined,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      )
    }

    // Revalidate the dashboard page to show the new article
    revalidatePath('/dashboard')

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        url: data.url,
        title: data.title,
        ogImage: data.og_image,
        favicon: data.favicon,
        summary: data.summary,
      },
    })
  } catch (error) {
    console.error('Add article error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		// 1️⃣ Buscar primero en BD
		const { data: existingReading } = await supabase
			.from("readings")
			.select("*")
			.eq("user_id", user.id)
			.eq("url", url)
			.single();

		if (existingReading) {
			return NextResponse.json({
				success: true,
				source: "database",
				data: existingReading,
			});
		}

		// 2️⃣ NO existe → scrape en caliente
		const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
		if (!firecrawlApiKey) {
			return NextResponse.json(
				{ error: "Firecrawl API key not configured" },
				{ status: 500 },
			);
		}

		const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${firecrawlApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url,
				formats: ["markdown", "html"],
			}),
		});

		if (!scrapeResponse.ok) {
			return NextResponse.json(
				{ error: "Failed to scrape URL" },
				{ status: 500 },
			);
		}

		const scrapeData = await scrapeResponse.json();
		const markdown = scrapeData.data?.markdown || "";
		const metadata = scrapeData.data?.metadata || {};

		const title = metadata.title || "Untitled";
		const ogImage = metadata.ogImage || null;
		const favicon = metadata.favicon || null;

		return NextResponse.json({
			success: true,
			source: "scrape",
			data: {
				url,
				title,
				ogImage,
				favicon,
				content: markdown,
			},
		});
	} catch (error) {
		console.error("GET scrape error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

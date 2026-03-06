import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const slug = body.slug?.trim() || generateSlug(body.title);

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: body.title,
      slug,
      summary: body.excerpt ?? null,
      content: body.content,
      category: body.category ?? null,
      image_url: body.image_url ?? null,
      seo_title: body.title,
      seo_description: body.meta_description ?? null,
      seo_keywords: body.seo_keywords ?? null,
      aeo_question: null,
      aeo_answer: body.ai_summary ?? null,
      aeo_schema_type: "Article",
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Duplicate slug", slug },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, id: data.id, slug: data.slug },
    { status: 201 }
  );
}

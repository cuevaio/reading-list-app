"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReadingData = {
    title: string;
    content: string;
    ogImage?: string | null;
    favicon?: string | null;
};

export default function ReadPage() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");

    const [data, setData] = useState<ReadingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url) {
            setError("URL no proporcionada");
            setLoading(false);
            return;
        }

        fetch(`/api/add?url=${encodeURIComponent(url)}`)
            .then(async (res) => {
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Error al cargar");
                return json;
            })
            .then((result) => setData(result.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [url]);

    /* ---------- STATES ---------- */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Cargando contenido…
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!data) return null;

    /* ---------- UI ---------- */

    return (
        <main className="min-h-screen bg-neutral-100">
            {/* HEADER */}
            <header className="border-b bg-white">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                        {data.title}
                    </h1>

                    {url && (
                        <p className="mt-3 text-sm text-gray-400 truncate">
                            {url}
                        </p>
                    )}
                </div>
            </header>

            {/* HERO IMAGE */}
            {data.ogImage && (
                <div className="max-w-3xl mx-auto px-6 mt-8">
                    <img
                        src={data.ogImage}
                        alt="Cover"
                        className="w-full rounded-2xl shadow-md"
                    />
                </div>
            )}

            {/* CONTENT */}
            <section className="max-w-3xl mx-auto px-6 py-14">
                <article
                    className="
            prose prose-neutral prose-lg max-w-none
            prose-headings:font-semibold
            prose-headings:tracking-tight
            prose-p:leading-relaxed
            prose-img:rounded-xl
            prose-img:mx-auto
            prose-a:text-blue-600
            prose-a:no-underline hover:prose-a:underline
          "
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {data.content}
                    </ReactMarkdown>
                </article>

                <footer className="mt-16 text-center text-xs text-gray-400">
                    Contenido obtenido automáticamente desde la URL proporcionada
                </footer>
            </section>
        </main>
    );
}

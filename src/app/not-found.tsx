import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="font-display text-3xl text-ink">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-slate">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or its careers page hasn&rsquo;t been published yet.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
        &larr; Back to home
      </Link>
    </main>
  );
}

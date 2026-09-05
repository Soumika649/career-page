import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCompanyForm } from "./NewCompanyForm";
import { Button } from "@/components/ui";
import { signOutAction } from "./actions";

export const metadata: Metadata = { title: "Your companies" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: companies } = await supabase
    .from("companies")
    .select("id, slug, name, is_published, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main id="main" className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-line px-6 py-5 md:px-12">
        <span className="font-display text-lg font-medium text-ink">Careers Page Builder</span>
        <form action={signOutAction}>
          <Button variant="ghost" type="submit">
            Log out
          </Button>
        </form>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12 md:px-0">
        <h1 className="font-display text-3xl text-ink">Your companies</h1>
        <p className="mt-2 text-sm text-slate">{user.email}</p>

        <div className="mt-10 border border-line bg-paper-raised p-6">
          <h2 className="mb-4 text-sm font-medium text-ink">Start a new careers page</h2>
          <NewCompanyForm />
        </div>

        {companies && companies.length > 0 ? (
          <ul className="mt-10 divide-y divide-line border border-line bg-paper-raised">
            {companies.map((company) => (
              <li key={company.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{company.name}</p>
                  <p className="text-sm text-slate">
                    /{company.slug}/careers &middot;{" "}
                    {company.is_published ? (
                      <span className="text-success">Published</span>
                    ) : (
                      <span className="text-slate">Draft</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${company.slug}/preview`}>
                    <Button variant="ghost">Preview</Button>
                  </Link>
                  <Link href={`/${company.slug}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-sm text-slate">
            No companies yet &mdash; create one above to start building your careers page.
          </p>
        )}
      </div>
    </main>
  );
}

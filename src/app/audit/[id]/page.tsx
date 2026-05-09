import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { getPublicAudit } from "@/lib/server/store";
import { siteUrl } from "@/lib/server/env";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  if (!audit) return { title: "AI Spend Audit" };

  const title = `$${audit.totalMonthlySavings.toLocaleString()}/mo AI savings found`;
  const description = `SpendScope audit for a ${audit.input.teamSize}-person ${audit.input.useCase} team.`;
  const image = `${siteUrl}/api/og/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
      url: `${siteUrl}/audit/${id}`
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function PublicAuditPage({ params }: Props) {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  if (!audit) notFound();

  return (
    <main>
      <nav className="topbar">
        <Link className="brand" href="/">SpendScope</Link>
        <Link className="secondary-link" href="/">Run another audit</Link>
      </nav>
      <ResultsView audit={audit} publicMode />
    </main>
  );
}

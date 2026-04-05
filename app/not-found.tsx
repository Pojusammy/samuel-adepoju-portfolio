import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1180px] items-center px-5 py-24 sm:px-7 lg:px-10">
      <div className="max-w-[32rem]">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">404</p>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-foreground">
          That page slipped out of the archive.
        </h1>
        <p className="mt-5 text-lg leading-8 text-foreground-soft">
          The project link may have moved, or the page might still be in progress.
        </p>
        <Link href="/" className="site-link mt-6 inline-flex">
          Return home
        </Link>
      </div>
    </main>
  );
}

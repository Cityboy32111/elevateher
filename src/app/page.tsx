import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-4">
      <main className="flex max-w-lg flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#2D2D2D]">
          elevate<span className="text-[#7C9A82]">her</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#2D2D2D]/70">
          A year-long support program for working mothers. Practical coaching,
          emotional support, and workplace navigation tools — from pregnancy
          through your first year back.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-lg bg-[#7C9A82] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6B8A71]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-lg border border-[#2D2D2D]/15 bg-white px-6 text-sm font-medium text-[#2D2D2D] transition-colors hover:bg-[#2D2D2D]/5"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}

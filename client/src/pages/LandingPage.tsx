import { Link } from "react-router-dom";

const features = [
	{
		title: "Skill-Verified Matching",
		description:
			"Rank candidates using weighted signals from skills, projects, education, and profile activity.",
	},
	{
		title: "Fast Recruiter Workflow",
		description:
			"Filter by score, compare ranked profiles, and make shortlist decisions in minutes.",
	},
	{
		title: "Transparent Candidate Profiles",
		description:
			"See complete breakdowns and project-level evidence for every recommendation.",
	},
];

const steps = [
	"Post jobs with required skills and role criteria.",
	"System auto-ranks candidates based on relevance and completeness.",
	"Recruiters review detailed profiles and contact top matches.",
];

export default function LandingPage() {
	return (
		<div
			className="min-h-screen bg-white text-slate-900"
			style={{ fontFamily: "'DM Sans', sans-serif" }}
		>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
				*, *::before, *::after { box-sizing: border-box; }
				@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
				.rise { animation: rise 0.45s ease forwards; }
			`}</style>

			<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link to="/" className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
							<svg
								className="h-4 w-4 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<span className="text-sm font-bold tracking-tight text-slate-900">
							Job Portal
						</span>
					</Link>

					<nav className="hidden items-center gap-6 md:flex">
						<a
							href="#features"
							className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Features
						</a>
						<a
							href="#how-it-works"
							className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							How It Works
						</a>
						<Link
							to="/contact"
							className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Contact
						</Link>
					</nav>

					<div className="flex items-center gap-2">
						<Link
							to="/contact"
							className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex"
						>
							Talk to Sales
						</Link>
						<Link
							to="/recruiter/jobs"
							className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
						>
							Recruiter Dashboard
						</Link>
					</div>
				</div>
			</header>

			<main>
				<section className="relative overflow-hidden border-b border-slate-200 bg-linear-to-b from-indigo-50/70 via-white to-white">
					<div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100 blur-3xl" />
					<div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
						<div className="rise">
							<span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
								AI-Assisted Skill Verification
							</span>
							<h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
								Hire Faster With Ranked,
								<br className="hidden sm:block" />
								Evidence-Backed Candidates
							</h1>
							<p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
								A modern hiring platform for teams that want quality over guesswork.
								Post roles, evaluate verified profiles, and shortlist the best candidates with confidence.
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								<Link
									to="/recruiter/jobs"
									className="rounded-xl border border-indigo-200 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
								>
									Open Recruiter Dashboard
								</Link>
								<Link
									to="/contact"
									className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
								>
									Request Demo
								</Link>
							</div>

							<div className="mt-6 flex flex-wrap gap-5 text-xs text-slate-600">
								<span>Top-ranked candidates by relevance</span>
								<span>Transparent score breakdown</span>
								<span>Recruiter-first workflow</span>
							</div>
						</div>

						<div className="rise rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40">
							<p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
								Platform Snapshot
							</p>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-xs text-slate-500">Avg. shortlist time</p>
									<p className="mt-1 text-2xl font-black text-slate-900">-52%</p>
								</div>
								<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-xs text-slate-500">Profile completeness</p>
									<p className="mt-1 text-2xl font-black text-slate-900">90%+</p>
								</div>
								<div className="col-span-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
									<p className="text-xs text-indigo-700">Recruiter efficiency</p>
									<p className="mt-1 text-sm font-semibold text-indigo-900">
										See skill matches, missing criteria, and project evidence in one view.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="features" className="mx-auto max-w-7xl px-6 py-14">
					<div className="mb-8 flex items-end justify-between gap-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
								Features
							</p>
							<h2 className="mt-2 text-2xl font-black text-slate-900">
								Built for practical hiring decisions
							</h2>
						</div>
						<Link
							to="/recruiter/jobs"
							className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
						>
							Go to dashboard →
						</Link>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{features.map((feature) => (
							<article
								key={feature.title}
								className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/40"
							>
								<h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-slate-600">
									{feature.description}
								</p>
							</article>
						))}
					</div>
				</section>

				<section id="how-it-works" className="border-y border-slate-200 bg-slate-50/70">
					<div className="mx-auto max-w-7xl px-6 py-14">
						<p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
							How It Works
						</p>
						<h2 className="mt-2 text-2xl font-black text-slate-900">
							Three simple steps to better hiring
						</h2>

						<div className="mt-7 grid gap-3 md:grid-cols-3">
							{steps.map((step, index) => (
								<div
									key={step}
									className="rounded-xl border border-slate-200 bg-white p-4"
								>
									<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
										{index + 1}
									</span>
									<p className="mt-2 text-sm text-slate-700">{step}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-7xl px-6 py-16">
					<div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
						<h2 className="text-2xl font-black text-slate-900">
							Ready to modernize your hiring?
						</h2>
						<p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
							Start with the recruiter dashboard to experience ranked candidate discovery with clear, explainable scoring.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Link
								to="/recruiter/jobs"
								className="rounded-xl border border-indigo-200 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
							>
								Enter Recruiter Dashboard
							</Link>
							<Link
								to="/contact"
								className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
							>
								Contact Team
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

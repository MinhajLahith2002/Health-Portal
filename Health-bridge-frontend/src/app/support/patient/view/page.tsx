"use client";

import { useEffect, useState } from "react";
import {
	getAllTickets,
	getTicketByIdForAdmin,
} from "@/services/supportService";
import { TicketSummary } from "@/types/support";

function Stars({ rating }: { rating: number }) {
	return (
		<span
			className="tracking-wide text-amber-500"
			aria-label={`${rating} out of 5 stars`}
		>
			{[1, 2, 3, 4, 5].map((value) => (
				<span key={value} className={value <= rating ? "" : "text-slate-300"}>
					★
				</span>
			))}
		</span>
	);
}

const CARDS_PER_PAGE = 4;

export default function PatientFeedbackViewPage() {
	const [tickets, setTickets] = useState<TicketSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [pageIndex, setPageIndex] = useState(0);

	useEffect(() => {
		let active = true;

		const loadFeedback = async () => {
			try {
				const summaries = await getAllTickets();
				const detailedTickets = await Promise.all(
					summaries.map(async (summary) => {
						try {
							const detail = await getTicketByIdForAdmin(summary.id);
							return {
								...summary,
								userName: detail.userName || summary.userName,
								feedback: detail.feedback ?? summary.feedback ?? null,
							};
						} catch {
							return summary;
						}
					})
				);

				if (active) {
					setTickets(
						detailedTickets
							.filter((ticket) => ticket.feedback)
							.sort(
								(a, b) =>
									new Date(b.updatedAt).getTime() -
									new Date(a.updatedAt).getTime()
							)
					);
				}
			} catch (loadError) {
				if (active) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Failed to load patient feedback."
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		};

		void loadFeedback();
		return () => {
			active = false;
		};
	}, []);

	const pageCount = Math.max(1, Math.ceil(tickets.length / CARDS_PER_PAGE));

	// Auto-advance one page (4 cards) at a time every 7s
	useEffect(() => {
		if (pageCount <= 1) return;
		const interval = setInterval(() => {
			setPageIndex((prev) => (prev + 1) % pageCount);
		}, 7000);
		return () => clearInterval(interval);
	}, [pageCount]);

	// Clamp pageIndex if ticket count shrinks
	useEffect(() => {
		if (pageIndex > pageCount - 1) setPageIndex(0);
	}, [pageCount, pageIndex]);

	const goPrev = () => {
		setPageIndex((prev) => (prev - 1 + pageCount) % pageCount);
	};

	const goNext = () => {
		setPageIndex((prev) => (prev + 1) % pageCount);
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-8 text-slate-900">
			<div className="mx-auto max-w-6xl">
				<header className="mb-10 text-center">
					<p className="text-sm font-semibold uppercase tracking-wider text-[#0F6CBD]">
						Support
					</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
						What our patients say
					</h1>
					<p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
						Ratings and comments submitted after support tickets were solved.
					</p>
				</header>

				{loading && (
					<div className="flex flex-col items-center justify-center gap-3 py-20">
						<div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#0F6CBD]" />
						<p className="text-sm font-medium text-slate-500">
							Loading feedback...
						</p>
					</div>
				)}

				{!loading && error && (
					<p className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-700">
						{error}
					</p>
				)}

				{!loading && !error && tickets.length === 0 && (
					<p className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
						No patient feedback has been submitted yet.
					</p>
				)}

				{!loading && !error && tickets.length > 0 && (
					<div className="relative">
						{/* Slide viewport - clips the sliding track of pages */}
						<div className="overflow-hidden">
							<div
								className="flex transition-transform duration-500 ease-in-out"
								style={{
									width: `${pageCount * 100}%`,
									transform: `translateX(-${pageIndex * (100 / pageCount)}%)`,
								}}
							>
								{Array.from({ length: pageCount }).map((_, page) => {
									const pageTickets = tickets.slice(
										page * CARDS_PER_PAGE,
										page * CARDS_PER_PAGE + CARDS_PER_PAGE
									);

									return (
										<div
											key={page}
											className="grid shrink-0 grid-cols-1 gap-5 px-1 sm:grid-cols-2 xl:grid-cols-4"
											style={{ width: `${100 / pageCount}%` }}
										>
											{pageTickets.map((ticket) => (
												<div
													key={ticket.id}
													className="relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/50 ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
												>
													{/* Decorative quote mark */}
													<div className="pointer-events-none absolute -left-1 -top-3 select-none text-[70px] font-serif leading-none text-[#0F6CBD]/[0.07]">
														“
													</div>

													<Stars rating={ticket.feedback?.rating ?? 0} />

													<p className="mt-4 flex-1 text-sm leading-6 text-slate-700 line-clamp-6">
														{ticket.feedback?.comment || "No written comment."}
													</p>

													<div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
														<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F6CBD] to-[#2E9BF0] text-xs font-bold text-white">
															{(ticket.userName || "?").charAt(0).toUpperCase()}
														</div>
														<div className="min-w-0">
															<p className="truncate text-sm font-semibold text-slate-900">
																{ticket.userName || "Unknown patient"}
															</p>
															<p className="truncate text-xs text-slate-500">
																{ticket.subject || "Untitled ticket"}
															</p>
														</div>
													</div>
												</div>
											))}

											{/* Fill empty slots on the last page so grid stays aligned */}
											{Array.from({
												length: CARDS_PER_PAGE - pageTickets.length,
											}).map((_, i) => (
												<div key={`empty-${i}`} className="hidden xl:block" />
											))}
										</div>
									);
								})}
							</div>
						</div>

						{/* Prev / Next page navigation */}
						{pageCount > 1 && (
							<>
								<button
									type="button"
									onClick={goPrev}
									aria-label="Previous testimonials"
									className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:-translate-x-5 hover:border-[#0F6CBD]/30 hover:text-[#0F6CBD] sm:-translate-x-6"
								>
									<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
										<path
											d="M15 5l-7 7 7 7"
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>

								<button
									type="button"
									onClick={goNext}
									aria-label="Next testimonials"
									className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:translate-x-5 hover:border-[#0F6CBD]/30 hover:text-[#0F6CBD] sm:translate-x-6"
								>
									<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
										<path
											d="M9 5l7 7-7 7"
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</>
						)}

						{/* Page dot indicators */}
						{pageCount > 1 && (
							<div className="mt-8 flex items-center justify-center gap-2">
								{Array.from({ length: pageCount }).map((_, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setPageIndex(index)}
										aria-label={`Go to page ${index + 1}`}
										className={
											index === pageIndex
												? "h-2.5 w-6 rounded-full bg-[#0F6CBD] transition-all"
												: "h-2.5 w-2.5 rounded-full bg-slate-300 transition-all hover:bg-slate-400"
										}
									/>
								))}
							</div>
						)}

						{/* Page counter */}
						{pageCount > 1 && (
							<p className="mt-3 text-center text-xs font-medium text-slate-400">
								Page {pageIndex + 1} of {pageCount}
							</p>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
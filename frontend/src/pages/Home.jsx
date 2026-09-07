import React from "react";

import {
  Link,
} from "react-router-dom";

const features = [
  {
    number: "01",
    title: "College Predictor",
    description:
      "Enter your exam, rank and category to discover colleges and courses that match your admission chances.",
    link: "/predictor",
    action: "Try Predictor",
  },
  {
    number: "02",
    title: "Explore Colleges",
    description:
      "Browse colleges, courses, branches, seats and previous cutoff information in one place.",
    link: "/colleges",
    action: "Explore Colleges",
  },
  {
    number: "03",
    title: "Expert Counselling",
    description:
      "Connect with verified admission counsellors and book a personalised counselling session.",
    link: "/counsellors",
    action: "Find Counsellor",
  },
];

const steps = [
  {
    step: "01",
    title: "Choose your exam",
    description:
      "Select the entrance examination you are preparing for.",
  },
  {
    step: "02",
    title: "Enter your rank",
    description:
      "Provide your rank and relevant admission details.",
  },
  {
    step: "03",
    title: "Compare colleges",
    description:
      "Explore suitable colleges, courses and branches.",
  },
  {
    step: "04",
    title: "Make your choice",
    description:
      "Use the information to make a more confident decision.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">

        {/* Background decoration */}

        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Hero Content */}

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Smarter college admission guidance
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
                Find the college
                <span className="block text-blue-600">
                  where you belong.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Get personalised college predictions,
                explore admission information and connect
                with expert counsellors — all from one
                simple platform.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <Link
                  to="/predictor"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                >
                  Check My Chances

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </Link>

                <Link
                  to="/colleges"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Explore Colleges
                </Link>

              </div>

              {/* Trust indicators */}

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-500">

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    ✓
                  </span>
                  Data-driven predictions
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    ✓
                  </span>
                  Verified counsellors
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    ✓
                  </span>
                  Easy comparison
                </div>

              </div>

            </div>

            {/* Hero Visual */}

            <div className="relative">

              <div className="relative mx-auto max-w-lg">

                {/* Main card */}

                <div className="rounded-3xl bg-slate-900 p-5 sm:p-7 shadow-2xl shadow-slate-900/20">

                  <div className="flex items-center justify-between mb-7">

                    <div>
                      <p className="text-xs text-slate-400">
                        Your admission journey
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        Admission Dashboard
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 3v18h18" />
                        <path d="m7 16 4-5 3 3 5-7" />
                      </svg>
                    </div>

                  </div>

                  {/* Prediction card */}

                  <div className="rounded-2xl bg-white p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Prediction result
                        </p>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          Good Chances
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-full border-4 border-green-100 bg-green-50 text-green-600 flex items-center justify-center font-bold">
                        82%
                      </div>

                    </div>

                    <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[82%] rounded-full bg-green-500" />
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                      <span>Rank: 1,245</span>
                      <span>KCET</span>
                    </div>

                  </div>

                  {/* College result */}

                  <div className="mt-4 rounded-2xl bg-slate-800 border border-slate-700 p-4">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 21h18" />
                          <path d="M5 21V7l7-4 7 4v14" />
                          <path d="M9 21v-5h6v5" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">
                          University Visvesvaraya College of Engineering
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Bengaluru, Karnataka
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Floating card */}

                <div className="absolute -right-5 top-16 hidden sm:block rounded-2xl bg-white border border-slate-100 shadow-xl p-4 w-44">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Verified
                      </p>

                      <p className="text-sm font-bold text-slate-800">
                        Counsellor
                      </p>
                    </div>

                  </div>

                </div>

                {/* Floating bottom card */}

                <div className="absolute -left-6 bottom-10 hidden sm:block rounded-2xl bg-white border border-slate-100 shadow-xl p-4">

                  <p className="text-xs text-slate-400">
                    Colleges compared
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    100+
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURE SECTION
      ===================================================== */}

      <section className="py-20 bg-slate-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              One platform for your
              admission journey.
            </h2>

            <p className="mt-4 text-slate-600 leading-7">
              From predicting your admission chances to
              speaking with an expert, Get Your Seat helps
              you make informed decisions at every step.
            </p>

          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">

            {features.map(
              (feature) => (
                <Link
                  key={feature.number}
                  to={feature.link}
                  className="group rounded-2xl bg-white border border-slate-200 p-7 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 transition"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold text-blue-600">
                      {feature.number}
                    </span>

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>

                  </div>

                  <h3 className="mt-8 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 text-sm font-semibold text-blue-600">
                    {feature.action} →
                  </div>

                </Link>
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              From rank to college in
              four simple steps.
            </h2>

            <p className="mt-4 text-slate-600 leading-7">
              No complicated process. Just the information
              you need to make a better admission decision.
            </p>

          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {steps.map(
              (item, index) => (
                <div
                  key={item.step}
                  className="relative"
                >

                  {index <
                    steps.length -
                      1 && (
                    <div className="hidden lg:block absolute top-6 left-14 right-0 h-px bg-slate-200" />
                  )}

                  <div className="relative">

                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                      {item.step}
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          COUNSELLOR CTA
      ===================================================== */}

      <section className="py-20 bg-slate-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-12 sm:px-12 lg:px-16">

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />

            <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-white/5" />

            <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">

              <div className="max-w-2xl">

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                  Need expert guidance?
                </p>

                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                  Talk to someone who
                  understands admissions.
                </h2>

                <p className="mt-4 text-blue-100 leading-7">
                  Connect with verified counsellors for
                  personalised guidance on colleges, courses,
                  ranks and admission choices.
                </p>

              </div>

              <Link
                to="/counsellors"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition whitespace-nowrap"
              >
                Find a Counsellor

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="py-20 bg-white">

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>

          </div>

          <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900">
            Your next step starts here.
          </h2>

          <p className="mt-4 text-slate-600 leading-7">
            Enter your rank, explore your options and
            discover where your admission journey could
            take you.
          </p>

          <div className="mt-8">

            <Link
              to="/predictor"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
            >
              Start College Prediction

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                G
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Get Your Seat
                </p>

                <p className="text-xs text-slate-400">
                  Admission Guidance Platform
                </p>
              </div>

            </div>

            <div className="flex items-center gap-5 text-sm text-slate-500">

              <Link
                to="/colleges"
                className="hover:text-blue-600 transition"
              >
                Colleges
              </Link>

              <Link
                to="/predictor"
                className="hover:text-blue-600 transition"
              >
                Predictor
              </Link>

              <Link
                to="/counsellors"
                className="hover:text-blue-600 transition"
              >
                Counsellors
              </Link>

            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Get Your Seat. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}
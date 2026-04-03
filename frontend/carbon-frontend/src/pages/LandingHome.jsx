import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function LandingHome() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f3faf4_0%,#d8f0df_45%,#fef8ec_100%)] text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-green-700 shadow-sm">
              Carbon intelligence for everyday choices
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Understand your carbon footprint with prediction, analysis, and clear visuals.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-700">
              Explore correlations, regression models, likelihood graphs, and a personalized
              emission prediction flow that turns raw input into practical advice.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/predict"
                className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-800"
              >
                Start Prediction
              </Link>
              <Link
                to="/visualization"
                className="rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 transition hover:bg-white/70"
              >
                View Visualizations
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
              <h2 className="text-xl font-bold text-green-800">What this project gives you</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-800">Prediction</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Estimate carbon emission using your own lifestyle inputs.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">Analysis</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Understand whether the result is low, moderate, or high.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">Graphs</p>
                  <p className="mt-2 text-sm text-slate-700">
                    See distribution, heatmap, regression, and likelihood charts.
                  </p>
                </div>
                <div className="rounded-2xl bg-lime-50 p-4">
                  <p className="text-sm font-semibold text-lime-800">Tips</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Receive simple personalized ways to reduce your impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg">
                <p className="text-3xl font-black">5+</p>
                <p className="mt-2 text-sm text-slate-200">Lifestyle factors used in prediction</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-3xl font-black text-green-800">MLR</p>
                <p className="mt-2 text-sm text-slate-600">Multi-factor regression insights</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-3xl font-black text-amber-700">MLE</p>
                <p className="mt-2 text-sm text-slate-600">Distribution-based interpretation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingHome;

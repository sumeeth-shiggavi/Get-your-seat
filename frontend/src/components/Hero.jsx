function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">

        <p className="text-blue-600 font-semibold text-lg mb-4">
          NEET • KCET • JEE
        </p>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          YOUR SEAT.
          <br />
          <span className="text-blue-600">
            YOUR FUTURE.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
          Find the right college, understand your chances,
          and connect with expert counsellors to make the
          right decision for your future.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Find My College
          </button>

          <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
            Talk to a Counsellor
          </button>

        </div>

      </div>
    </section>
  );
}

export default Hero;
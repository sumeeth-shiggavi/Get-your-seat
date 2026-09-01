function About() {
  return (
    <div className="min-h-screen bg-gray-100">

      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">

          <p className="text-blue-200 font-semibold tracking-widest">
            GET YOUR SEAT
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            About Us
          </h1>

          <p className="text-blue-100 text-lg mt-5 max-w-2xl">
            Helping students find the right college based on
            their entrance exam rank and preferences.
          </p>

        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-12">

        <div className="bg-white rounded-2xl shadow-md p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            What is Get Your Seat?
          </h2>

          <p className="text-gray-600 leading-7 mt-4">
            Get Your Seat is a college discovery and prediction
            platform designed to help students explore colleges
            and identify institutions they may be eligible for
            based on their entrance examination rank.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            Our Goal
          </h2>

          <p className="text-gray-600 leading-7 mt-4">
            Our goal is to make the college selection process
            easier by bringing college information, courses,
            branches and cutoff information together in one place.
          </p>

        </div>

      </main>

    </div>
  );
}

export default About;
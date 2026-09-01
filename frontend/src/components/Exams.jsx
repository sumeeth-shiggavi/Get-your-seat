import ExamCard from "./ExamCard";

function Exams() {
  return (
    <section className="bg-gray-50 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">

          <p className="text-blue-600 font-semibold">
            CHOOSE YOUR PATH
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mt-2">
            Exams We Support
          </h2>

          <p className="text-gray-600 mt-4">
            Get counselling and college guidance for
            India's major entrance examinations.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <ExamCard
            name="NEET"
            description="Medical entrance counselling and college selection."
          />

          <ExamCard
            name="KCET"
            description="Karnataka engineering and professional course counselling."
          />

          <ExamCard
            name="JEE"
            description="Engineering college selection and counselling."
          />

        </div>

      </div>

    </section>
  );
}

export default Exams;
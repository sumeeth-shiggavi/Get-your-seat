function ExamCard({ name, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">

      <h3 className="text-3xl font-bold text-blue-600 mb-4">
        {name}
      </h3>

      <p className="text-gray-600 mb-6">
        {description}
      </p>

      <button className="text-blue-600 font-semibold hover:underline">
        Explore →
      </button>

    </div>
  );
}

export default ExamCard;
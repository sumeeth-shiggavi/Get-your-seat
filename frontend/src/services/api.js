const API_URL = "http://localhost:5000/api";

export async function getExams() {
  const response = await fetch(`${API_URL}/exams`);

  if (!response.ok) {
    throw new Error(`Failed to fetch exams: ${response.status}`);
  }

  return await response.json();
}

export async function predictColleges({
  exam,
  rank,
  category,
  state,
}) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exam,
      rank: Number(rank),
      category,
      state,
    }),
  });

  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.status}`);
  }

  return await response.json();
}
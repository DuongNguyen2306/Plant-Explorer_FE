import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://66937520c6be000fa07b9d27.mockapi.io/quizzes")
      .then(res => setQuizzes(res.data));
  }, []);

  return (
    <div>
      <h1>Quiz Management</h1>
      <button onClick={() => {/* Add new Quiz */}}>Add Quiz</button>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id}>
            {quiz.title}
            <button onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}>View Questions</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizManagement;

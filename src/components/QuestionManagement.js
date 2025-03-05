import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const QuestionManagement = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`https://66937520c6be000fa07b9d27.mockapi.io/quizzes/${quizId}`)
      .then(res => setQuestions(res.data.questions));
  }, [quizId]);

  return (
    <div>
      <h1>Question Management for Quiz {quizId}</h1>
      <button onClick={() => {/* Add new Question */}}>Add Question</button>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>
            {question.question}
            <button onClick={() => navigate(`/quizzes/${quizId}/questions/${index}/options`)}>View Options</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionManagement;

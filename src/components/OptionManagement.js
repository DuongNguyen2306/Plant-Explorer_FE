import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const OptionManagement = () => {
  const { quizId, questionId } = useParams();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    axios.get(`https://66937520c6be000fa07b9d27.mockapi.io/quizzes/${quizId}`)
      .then(res => setOptions(res.data.questions[questionId].options));
  }, [quizId, questionId]);

  return (
    <div>
      <h1>Option Management for Question {questionId}</h1>
      <button onClick={() => {/* Add new Option */}}>Add Option</button>
      <ul>
        {options.map((option, index) => (
          <li key={index}>{option.text} - {option.isCorrect ? "✅" : "❌"}</li>
        ))}
      </ul>
    </div>
  );
};

export default OptionManagement;

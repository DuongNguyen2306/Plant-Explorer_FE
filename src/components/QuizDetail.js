import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button } from "@mui/material";

const API_URL = "https://66937520c6be000fa07b9d27.mockapi.io/quizzes";

const QuizDetail = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/${id}`)
      .then((response) => setQuiz(response.data))
      .catch((error) => console.error("Error fetching quiz:", error));
  }, [id]);

  if (!quiz) return <Typography variant="h5">Loading...</Typography>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option.text);
    setIsCorrect(option.isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, margin: "auto", textAlign: "center", padding: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        {quiz.title}
      </Typography>

      {/* Hiển thị ảnh lớn */}
      <Box sx={{ width: "100%", height: "300px", overflow: "hidden", borderRadius: "10px", marginBottom: 2 }}>
        <img
          src={currentQuestion.image}
          alt="quiz question"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        {currentQuestion.question}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === option.text ? (isCorrect ? "contained" : "outlined") : "contained"}
            color={selectedAnswer === option.text ? (isCorrect ? "success" : "error") : "primary"}
            onClick={() => handleAnswerClick(option)}
          >
            {option.text}
          </Button>
        ))}
      </Box>

      {selectedAnswer && (
        <Typography variant="h6" sx={{ color: isCorrect ? "green" : "red", marginTop: 2 }}>
          {isCorrect ? "🎉 Đúng rồi!" : "❌ Sai rồi, thử lại nhé!"}
        </Typography>
      )}

      {/* Nút "Next Question" */}
      {selectedAnswer && currentQuestionIndex < quiz.questions.length - 1 && (
        <Button variant="contained" color="secondary" sx={{ marginTop: 3 }} onClick={handleNextQuestion}>
          Next Question
        </Button>
      )}
    </Box>
  );
};

export default QuizDetail;

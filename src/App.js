import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizList from "./components/QuizList";
import QuizDetail from "./components/QuizDetail";
import UserManagement from "./components/UserManagement";
import Login from "./components/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quizzes/:id" element={<QuizDetail />} />
        <Route path="/user-management" element={<UserManagement />} />
      </Routes>
    </Router>
  );
};

export default App;

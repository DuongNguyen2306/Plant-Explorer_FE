import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import QuizManagement from "./components/QuizManagement";
import QuestionManagement from "./components/QuestionManagement";
import OptionManagement from "./components/OptionManagement";
import UserManagement from "./components/UserManagement";
import AvatarManagement from "./components/AvatarManagement";
import BadgeManagement from "./components/BadgeManagement";
import PlantManagement from "./components/PlantManagement";
import PlantCharacteristicManagement from "./components/PlantCharacteristicManagement";
import CharacteristicCategoryManagement from "./components/CharacteristicCategoryManagement";
import PlantApplicationManagement from "./components/PlantApplicationManagement";
import ApplicationCategoryManagement from "./components/ApplicationCategoryManagement";
import FavoritePlant from "./components/FavoritePlant";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/quizzes" element={<QuizManagement />} />
        <Route path="/quizzes/:quizId/questions" element={<QuestionManagement />} />
        <Route path="/quizzes/:quizId/questions/:questionId/options" element={<OptionManagement />} />

        <Route path="/users" element={<UserManagement />} />
        <Route path="/avatars" element={<AvatarManagement />} />
        <Route path="/badges" element={<BadgeManagement />} />

        <Route path="/plants" element={<PlantManagement />} />
        <Route path="/plant-characteristics" element={<PlantCharacteristicManagement />} />
        <Route path="/characteristic-categories" element={<CharacteristicCategoryManagement />} />
        <Route path="/plant-applications" element={<PlantApplicationManagement />} />
        <Route path="/application-categories" element={<ApplicationCategoryManagement />} />

        <Route path="/users/:userId/favorite-plants" element={<FavoritePlant />} />
      </Routes>
    </Router>
  );
};

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
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
import BugReports from "./components/BugReports";
import FavoritePlant from "./components/FavoritePlant";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <div style={{ display: "flex" }}>
              <Navbar />
              <div style={{ flex: 1, padding: "20px" }}>
                <Routes>
                  {/* Quản lý Quiz */}
                  <Route path="/quizzes" element={<QuizManagement />} />
                  <Route path="/quizzes/:quizId/questions" element={<QuestionManagement />} />
                  <Route path="/quizzes/:quizId/questions/:questionId/options" element={<OptionManagement />} />

                  {/* Quản lý User */}
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/users/:userId/favorite-plants" element={<FavoritePlant />} />

                  {/* Quản lý Avatars & Badges */}
                  <Route path="/avatars" element={<AvatarManagement />} />
                  <Route path="/badges" element={<BadgeManagement />} />

                  {/* Quản lý Cây Trồng */}
                  <Route path="/plants" element={<PlantManagement />} />
                  <Route path="/plant-characteristics" element={<PlantCharacteristicManagement />} />
                  <Route path="/characteristic-categories" element={<CharacteristicCategoryManagement />} />
                  <Route path="/plant-applications" element={<PlantApplicationManagement />} />
                  <Route path="/application-categories" element={<ApplicationCategoryManagement />} />

                  {/* Báo cáo lỗi */}
                  <Route path="/bug-reports" element={<BugReports />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

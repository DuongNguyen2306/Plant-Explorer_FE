// 📁 App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import QuizManagement from "./components/QuizManagement";
import QuestionManagement from "./components/QuestionManagement";
import OptionManagement from "./components/OptionManagement";
import UserManagement from "./components/UserManagement";
import AvatarManagement from "./components/AvatarManagement";
import BadgeManagement from "./components/BadgeManagement";
import PlantManagement from "./components/PlantManagement";
import PlantDetail from "./components/PlantDetail"; // Thêm import cho PlantDetail
import PlantCharacteristicManagement from "./components/PlantCharacteristicManagement";
import CharacteristicCategoryManagement from "./components/CharacteristicCategoryManagement";
import PlantApplicationManagement from "./components/PlantApplicationManagement";
import ApplicationCategoryManagement from "./components/ApplicationCategoryManagement";
import BugReports from "./components/BugReports";
import FavoritePlant from "./components/FavoritePlant";
import { getUserRoleFromAPI } from "./utils/roleUtils";

const AppContent = ({ role, setRole }) => {
  const location = useLocation();

  useEffect(() => {
    console.log("AppContent useEffect triggered. Current location:", location.pathname);
    console.log("Current role state:", role);
    if (location.pathname === "/") {
      console.log("On login page, skipping role fetch");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, setting role to unauthenticated");
      setRole("unauthenticated");
      return;
    }
    console.log("Fetching user role...");
    getUserRoleFromAPI()
      .then((fetchedRole) => {
        console.log("Role fetched in AppContent:", fetchedRole);
        setRole(fetchedRole);
        if (fetchedRole === "admin" && location.pathname === "/plants") {
          console.log("Admin user on /plants, redirecting to /users");
          window.location.replace("/users");
        }
      })
      .catch((error) => {
        console.error("Error fetching role in AppContent:", error);
        setRole("unauthenticated");
      });
  }, [setRole, location.pathname]);

  const ProtectedRoutes = () => {
    console.log("Rendering ProtectedRoutes with role:", role);
    const isStaffOrChildren = ["staff", "children"].includes(role);
    const isStaffOnly = role === "staff";
    const isAdminOnly = role === "admin";
    const isChildren = role === "children";

    const redirectIfUnauthorized = (allowedCondition, redirectTo = "/") => {
      if (!allowedCondition) {
        console.log(`Unauthorized access, redirecting to ${redirectTo}`);
        return <Navigate to={redirectTo} />;
      }
      return null;
    };

    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "20px 0", width: "100%" }}>
          <Routes>
            <Route
              path="/quizzes"
              element={redirectIfUnauthorized(isStaffOrChildren) || <QuizManagement />}
            />
            <Route
              path="/quizzes/:quizId/questions"
              element={redirectIfUnauthorized(isStaffOrChildren) || <QuestionManagement />}
            />
            <Route
              path="/quizzes/:quizId/questions/:questionId/options"
              element={redirectIfUnauthorized(isStaffOrChildren) || <OptionManagement />}
            />
            <Route
              path="/avatars"
              element={redirectIfUnauthorized(isStaffOrChildren) || <AvatarManagement />}
            />
            <Route
              path="/plants"
              element={redirectIfUnauthorized(isStaffOrChildren, "/users") || <PlantManagement />}
            />
            <Route
              path="/plant/:plantId/detail" // Thêm route cho PlantDetail
              element={redirectIfUnauthorized(isStaffOrChildren, "/plants") || <PlantDetail />}
            />
            <Route
              path="/plant-characteristics"
              element={redirectIfUnauthorized(isStaffOrChildren) || <PlantCharacteristicManagement />}
            />
            <Route
              path="/plant-applications"
              element={redirectIfUnauthorized(isStaffOrChildren) || <PlantApplicationManagement />}
            />
            <Route
              path="/bug-reports"
              element={redirectIfUnauthorized(isStaffOrChildren) || <BugReports />}
            />
            <Route
              path="/users/:userId/favorite-plants"
              element={redirectIfUnauthorized(isChildren, "/plants") || <FavoritePlant />}
            />
            <Route
              path="/badges"
              element={redirectIfUnauthorized(isStaffOnly, "/plants") || <BadgeManagement />}
            />
            <Route
              path="/characteristic-categories"
              element={redirectIfUnauthorized(isStaffOnly, "/plants") || <CharacteristicCategoryManagement />}
            />
            <Route
              path="/application-categories"
              element={redirectIfUnauthorized(isStaffOnly, "/plants") || <ApplicationCategoryManagement />}
            />
            <Route
              path="/users"
              element={redirectIfUnauthorized(isAdminOnly, "/") || <UserManagement />}
            />
            <Route path="*" element={<Navigate to={role === "admin" ? "/users" : "/plants"} />} />
          </Routes>
        </div>
      </div>
    );
  };

  console.log("Rendering AppContent with role:", role, "and location:", location.pathname);
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {role === null && location.pathname !== "/" && (
        <Route path="*" element={<p>Loading...</p>} />
      )}
      {role === "unauthenticated" && location.pathname !== "/" && (
        <Route path="*" element={<Navigate to="/" />} />
      )}
      {role && role !== "unauthenticated" && (
        <Route path="/*" element={<ProtectedRoutes />} />
      )}
    </Routes>
  );
};

const App = () => {
  const [role, setRole] = useState(null);

  return (
    <Router>
      <AppContent role={role} setRole={setRole} />
    </Router>
  );
};

export default App;
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
import PlantDetail from "./components/PlantDetail";
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

    // Bỏ qua nếu đang ở trang login
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

    // Chỉ gọi API nếu role chưa được thiết lập
    if (role === null) {
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
          alert("Failed to fetch user role. Please log in again.");
        });
    }
  }, [setRole, location.pathname, role]);

  const ProtectedRoutes = () => {
    console.log("Rendering ProtectedRoutes with role:", role);

    // Định nghĩa các điều kiện phân quyền
    const isStaffOrChildren = ["staff", "children"].includes(role);
    const isStaffOnly = role === "staff";
    const isAdminOnly = role === "admin";
    const isChildren = role === "children";
    const isAdminStaffOrChildren = ["admin", "staff", "children"].includes(role);

    // Ánh xạ route với điều kiện phân quyền và redirectTo
    const routePermissions = {
      "/quizzes": { condition: isStaffOrChildren, redirectTo: "/" },
      "/quizzes/:quizId/questions": { condition: isStaffOrChildren, redirectTo: "/" },
      "/quizzes/:quizId/questions/:questionId/options": { condition: isStaffOrChildren, redirectTo: "/" },
      "/avatars": { condition: isStaffOrChildren, redirectTo: "/" },
      "/plants": { condition: isStaffOrChildren, redirectTo: "/users" },
      "/plant/:plantId/detail": { condition: isStaffOrChildren, redirectTo: "/plants" },
      "/plant-characteristics": { condition: isStaffOrChildren, redirectTo: "/" },
      "/plant-applications": { condition: isStaffOrChildren, redirectTo: "/" },
      "/bug-reports": { condition: isAdminStaffOrChildren, redirectTo: "/" },
      "/users/:userId/favorite-plants": { condition: isChildren, redirectTo: "/plants" },
      "/badges": { condition: isStaffOnly, redirectTo: "/plants" },
      "/characteristic-categories": { condition: isStaffOnly, redirectTo: "/plants" },
      "/application-categories": { condition: isStaffOnly, redirectTo: "/plants" },
      "/users": { condition: isAdminOnly, redirectTo: "/" },
    };

    const checkPermission = (path) => {
      const routeConfig = Object.keys(routePermissions).find((key) => {
        const regex = new RegExp(`^${key.replace(/:\w+/g, "[^/]+")}$`);
        return regex.test(path);
      });
      if (!routeConfig) return { condition: true }; // Nếu không có config, cho phép truy cập
      const { condition, redirectTo } = routePermissions[routeConfig];
      return { condition, redirectTo };
    };

    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "20px 0", width: "100%" }}>
          <Routes>
            <Route
              path="/quizzes"
              element={
                checkPermission("/quizzes").condition ? (
                  <QuizManagement />
                ) : (
                  <Navigate to={checkPermission("/quizzes").redirectTo} />
                )
              }
            />
            <Route
              path="/quizzes/:quizId/questions"
              element={
                checkPermission("/quizzes/:quizId/questions").condition ? (
                  <QuestionManagement />
                ) : (
                  <Navigate to={checkPermission("/quizzes/:quizId/questions").redirectTo} />
                )
              }
            />
            <Route
              path="/quizzes/:quizId/questions/:questionId/options"
              element={
                checkPermission("/quizzes/:quizId/questions/:questionId/options").condition ? (
                  <OptionManagement />
                ) : (
                  <Navigate to={checkPermission("/quizzes/:quizId/questions/:questionId/options").redirectTo} />
                )
              }
            />
            <Route
              path="/avatars"
              element={
                checkPermission("/avatars").condition ? (
                  <AvatarManagement />
                ) : (
                  <Navigate to={checkPermission("/avatars").redirectTo} />
                )
              }
            />
            <Route
              path="/plants"
              element={
                checkPermission("/plants").condition ? (
                  <PlantManagement />
                ) : (
                  <Navigate to={checkPermission("/plants").redirectTo} />
                )
              }
            />
            <Route
              path="/plant/:plantId/detail"
              element={
                checkPermission("/plant/:plantId/detail").condition ? (
                  <PlantDetail />
                ) : (
                  <Navigate to={checkPermission("/plant/:plantId/detail").redirectTo} />
                )
              }
            />
            <Route
              path="/plant-characteristics"
              element={
                checkPermission("/plant-characteristics").condition ? (
                  <PlantCharacteristicManagement />
                ) : (
                  <Navigate to={checkPermission("/plant-characteristics").redirectTo} />
                )
              }
            />
            <Route
              path="/plant-applications"
              element={
                checkPermission("/plant-applications").condition ? (
                  <PlantApplicationManagement />
                ) : (
                  <Navigate to={checkPermission("/plant-applications").redirectTo} />
                )
              }
            />
            <Route
              path="/bug-reports"
              element={
                checkPermission("/bug-reports").condition ? (
                  <BugReports />
                ) : (
                  <Navigate to={checkPermission("/bug-reports").redirectTo} />
                )
              }
            />
            <Route
              path="/users/:userId/favorite-plants"
              element={
                checkPermission("/users/:userId/favorite-plants").condition ? (
                  <FavoritePlant />
                ) : (
                  <Navigate to={checkPermission("/users/:userId/favorite-plants").redirectTo} />
                )
              }
            />
            <Route
              path="/badges"
              element={
                checkPermission("/badges").condition ? (
                  <BadgeManagement />
                ) : (
                  <Navigate to={checkPermission("/badges").redirectTo} />
                )
              }
            />
            <Route
              path="/characteristic-categories"
              element={
                checkPermission("/characteristic-categories").condition ? (
                  <CharacteristicCategoryManagement />
                ) : (
                  <Navigate to={checkPermission("/characteristic-categories").redirectTo} />
                )
              }
            />
            <Route
              path="/application-categories"
              element={
                checkPermission("/application-categories").condition ? (
                  <ApplicationCategoryManagement />
                ) : (
                  <Navigate to={checkPermission("/application-categories").redirectTo} />
                )
              }
            />
            <Route
              path="/users"
              element={
                checkPermission("/users").condition ? (
                  <UserManagement />
                ) : (
                  <Navigate to={checkPermission("/users").redirectTo} />
                )
              }
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
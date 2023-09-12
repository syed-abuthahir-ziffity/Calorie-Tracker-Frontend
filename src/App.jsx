import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import CalorieTracker from "./components/CalorieTracker";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} exact={true}></Route>
          <Route path="register" Component={Register} exact={true}></Route>
          <Route path="login" Component={Login} exact={true}></Route>
          <Route
            path="calorie-tracker"
            Component={CalorieTracker}
            exact={true}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

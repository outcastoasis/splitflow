// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import Add from "./pages/Add";
import Navbar from "./components/Navbar";
import PersonDetails from "./pages/PersonDetails";
import EditSubscription from "./pages/EditSubscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";

import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/add" element={<Add />} />
          <Route path="/dashboard/:name" element={<PersonDetails />} />
          <Route path="/edit-subscription/:id" element={<EditSubscription />} />
          <Route path="/subscription/:id" element={<SubscriptionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

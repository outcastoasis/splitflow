// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import Navbar from "./components/Navbar";
import PersonDetails from "./pages/PersonDetails";
import EditSubscription from "./pages/EditSubscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import AddExpense from "./pages/AddExpense";
import AddDebt from "./pages/AddDebt";
import AddSubscription from "./pages/AddSubscription";
import QuickAddMenu from "./components/QuickAddMenu";
import EditDebt from "./pages/EditDebt";

import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/dashboard/:name" element={<PersonDetails />} />
          <Route path="/edit-subscription/:id" element={<EditSubscription />} />
          <Route path="/subscription/:id" element={<SubscriptionDetails />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/add-debt" element={<AddDebt />} />
          <Route path="/add-subscription" element={<AddSubscription />} />
          <Route path="/edit-debt/:id" element={<EditDebt />} />
        </Routes>
        <QuickAddMenu />
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/LandingHome";
import Visualization from "./pages/Visualization";
import Correlation from "./pages/Correlation";
import MLR from "./pages/MLR";
import Predict from "./pages/Predict";
import MLE from "./pages/MLE";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="/correlation" element={<Correlation />} />
        <Route path="/mlr" element={<MLR />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/mle" element={<MLE />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

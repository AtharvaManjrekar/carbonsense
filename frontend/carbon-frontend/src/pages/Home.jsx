import Navbar from "../components/Navbar";

function Home() {
  return (
    <div>
      <Navbar />
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold mb-4">
          Carbon Footprint Analysis System 🌱
        </h1>
        <p className="text-gray-600">
          Analyze and predict carbon emissions using QA & ML techniques.
        </p>
      </div>
    </div>
  );
}

export default Home;
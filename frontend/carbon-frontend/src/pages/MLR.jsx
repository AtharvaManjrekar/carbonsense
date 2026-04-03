import Navbar from "../components/Navbar";
import Card from "../components/Card";

function MLR() {
  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="Multiple Linear Regression">
          <div className="space-y-3">
            <p className="text-gray-700">
              The MLR model estimates emission by combining travel, electricity use,
              food habits, screen time, and waste into one prediction.
            </p>
            <p className="font-semibold text-green-700">
              Emission = b0 + b1(Travel) + b2(Electricity) + b3(Food) + b4(Screen Time) + b5(Waste)
            </p>
            <p className="text-sm text-gray-600">
              This helps us understand how multiple lifestyle factors together affect carbon output.
            </p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="MLR Fit On Full Dataset">
            <img src="/mlr_full.png" alt="MLR full dataset graph" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This graph shows how well the regression model follows the full set of observed emissions.
              A closer match means the model is learning the trend in the data well.
            </p>
          </Card>

          <Card title="MLR Sample Prediction">
            <img src="/mlr_sample.png" alt="MLR sample prediction graph" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This sample plot highlights predicted values for example inputs and helps compare the model output
              against expected emission behavior.
            </p>
          </Card>
        </div>

        <Card title="How To Read These Graphs">
          <p className="text-gray-700">
            If predicted points stay close to actual trends, the model is performing reasonably well.
            Large gaps can suggest missing features, noisy data, or a need for better model tuning.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default MLR;

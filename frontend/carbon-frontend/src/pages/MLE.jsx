import Navbar from "../components/Navbar";
import Card from "../components/Card";

function MLE() {
  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <Card title="Normal Distribution">
          <img src="/mle_normal.png" alt="Normal distribution" className="w-full rounded-lg mb-3" />
          <p className="text-sm text-gray-700">
            This graph shows how emission values spread around the mean when they roughly follow a bell-shaped pattern.
            It is useful when the data is symmetric and clustered around an average value.
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Exponential Distribution">
            <img src="/mle_exponential.png" alt="Exponential distribution" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This graph is helpful for values that fall quickly as they move away from zero.
              It is often used when smaller values are much more common than larger ones.
            </p>
          </Card>

          <Card title="Poisson Distribution">
            <img src="/mle_poisson.png" alt="Poisson distribution" className="w-full rounded-lg mb-3" />
            <p className="text-sm text-gray-700">
              This graph represents count-based behavior, where we measure how often certain outcomes happen in a fixed range.
              It can help describe discrete environmental events or repeated activities.
            </p>
          </Card>
        </div>

        <Card title="MLE Graph Explanation">
          <div className="space-y-3 text-gray-700">
            <p>
              Maximum Likelihood Estimation compares different probability distributions and finds parameter values
              that best fit the observed data. These plots help you visually see which distribution most closely
              matches the behavior of your emission dataset.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MLE;

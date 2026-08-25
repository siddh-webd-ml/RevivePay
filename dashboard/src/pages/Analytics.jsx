import { useState } from "react";
import {
  BarChart3,
  RefreshCw,
  IndianRupee,
  Target,
  ShieldAlert,
  CheckCircle2,
  Activity,
} from "lucide-react";

import PageHeader from "../components/PageHeader";

function Analytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analytics"
      );

      if (!response.ok) {
        throw new Error("Unable to load analytics");
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const percent = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

  return (
    <section className="analytics-page">

      <PageHeader
        eyebrow="RECOVERY ANALYTICS"
        title="Measure Recovered Revenue"
        description="Evaluate how RevivePay converts failed payments into measurable simulated recovery."
      />

      {/* HEADER ACTION */}

      <div className="analytics-toolbar">

        <div>
          <p className="eyebrow">
            BATCH PERFORMANCE
          </p>

          <h3>
            Recovery Intelligence
          </h3>
        </div>

        <button
          className="analytics-run-button"
          onClick={loadAnalytics}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw
                size={14}
                className="spin"
              />
              Loading...
            </>
          ) : (
            <>
              <BarChart3 size={14} />
              Run Batch Analysis
            </>
          )}
        </button>

      </div>


      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}


      {data && (
        <>

          {/* PRIMARY METRICS */}

          <div className="analytics-metrics">

            <div className="analytics-card">
              <div className="analytics-card-icon">
                <Activity size={17} />
              </div>

              <span>
                TRANSACTIONS EVALUATED
              </span>

              <strong>
                {data.total_failed}
              </strong>

              <small>
                Failed payments processed
              </small>
            </div>


            <div className="analytics-card">
              <div className="analytics-card-icon">
                <IndianRupee size={17} />
              </div>

              <span>
                REVENUE AT RISK
              </span>

              <strong>
                {money(data.revenue_at_risk)}
              </strong>

              <small>
                Failed payment value
              </small>
            </div>


            <div className="analytics-card">
              <div className="analytics-card-icon">
                <Target size={17} />
              </div>

              <span>
                EXPECTED RECOVERY
              </span>

              <strong>
                {money(data.expected_recovery)}
              </strong>

              <small>
                ML-estimated recoverable value
              </small>
            </div>


            <div className="analytics-card analytics-highlight">
              <div className="analytics-card-icon">
                <CheckCircle2 size={17} />
              </div>

              <span>
                ACTUAL SIMULATED RECOVERY
              </span>

              <strong>
                {money(data.actual_recovered)}
              </strong>

              <small>
                Revenue recovered by simulator
              </small>
            </div>

          </div>


          {/* PERFORMANCE */}

          <div className="analytics-performance">

            <div className="analytics-panel">

              <div className="analytics-panel-header">

                <div>
                  <p className="eyebrow">
                    RECOVERY PERFORMANCE
                  </p>

                  <h3>
                    Batch Outcomes
                  </h3>
                </div>

              </div>


              <div className="performance-grid">

                <div>
                  <span>
                    RECOVERY ATTEMPTS
                  </span>

                  <strong>
                    {data.recovery_attempts}
                  </strong>
                </div>


                <div>
                  <span>
                    SUCCESSFUL RECOVERIES
                  </span>

                  <strong>
                    {data.successful_recoveries}
                  </strong>
                </div>


                <div>
                  <span>
                    RECOVERY RATE
                  </span>

                  <strong>
                    {percent(data.recovery_rate)}
                  </strong>
                </div>


                <div>
                  <span>
                    ATTEMPT SUCCESS RATE
                  </span>

                  <strong>
                    {percent(data.attempt_success_rate)}
                  </strong>
                </div>

              </div>

            </div>


            {/* POLICY */}

            <div className="analytics-panel">

              <div className="analytics-panel-header">

                <div>
                  <p className="eyebrow">
                    GOVERNANCE
                  </p>

                  <h3>
                    Policy Protection
                  </h3>
                </div>

                <ShieldAlert size={17} />

              </div>


              <div className="policy-stat">

                <strong>
                  {data.policy_blocks}
                </strong>

                <span>
                  POLICY BLOCKS
                </span>

                <p>
                  Unsafe or unsupported recovery
                  actions prevented before execution.
                </p>

              </div>

            </div>

          </div>


          {/* MONEY COMPARISON */}

          <div className="analytics-panel money-panel">

            <div className="analytics-panel-header">

              <div>
                <p className="eyebrow">
                  REVENUE RECOVERY
                </p>

                <h3>
                  Expected vs Actual
                </h3>
              </div>

            </div>


            <div className="money-comparison">

              <div className="money-row">

                <div>
                  <span>
                    REVENUE AT RISK
                  </span>

                  <strong>
                    {money(data.revenue_at_risk)}
                  </strong>
                </div>

                <div
                  className="money-bar"
                  style={{
                    width: "100%",
                  }}
                />

              </div>


              <div className="money-row">

                <div>
                  <span>
                    EXPECTED RECOVERY
                  </span>

                  <strong>
                    {money(data.expected_recovery)}
                  </strong>
                </div>

                <div
                  className="money-bar expected"
                  style={{
                    width: `${
                      Math.min(
                        (data.expected_recovery /
                          data.revenue_at_risk) *
                          100,
                        100
                      )
                    }%`,
                  }}
                />

              </div>


              <div className="money-row">

                <div>
                  <span>
                    ACTUAL RECOVERY
                  </span>

                  <strong>
                    {money(data.actual_recovered)}
                  </strong>
                </div>

                <div
                  className="money-bar actual"
                  style={{
                    width: `${
                      Math.min(
                        (data.actual_recovered /
                          data.revenue_at_risk) *
                          100,
                        100
                      ) || 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* PRINCIPLE */}

          <div className="analytics-principle">

            <Target size={17} />

            <div>

              <strong>
                The goal is measured money recovered.
              </strong>

              <p>
                RevivePay does not stop at predicting
                payment recoverability. It measures the
                revenue recovered after AI diagnosis,
                policy governance and simulated execution.
              </p>

            </div>

          </div>

        </>
      )}

    </section>
  );
}

export default Analytics;
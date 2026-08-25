import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { getMetrics } from "../api/api";

function MLEngine() {
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [predictionError, setPredictionError] = useState(""); 
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to load ML metrics:", error);
    } finally {
      setLoading(false);
    }
  }
  const scenarios = {
  network: {
    transaction_id: "TX001070",
    amount: 19679.74,
    payment_method: "UPI",
    customer_type: "returning",
    subscription_type: "monthly",
    failure_reason: "network_error",
    retry_count: 0,
    previous_success_rate: 0.91,
    days_since_last_payment: 30,
    checkout_completed: 1,
    customer_tenure_days: 583,
    recovered: 0,
  },

  timeout: {
    transaction_id: "TX001071",
    amount: 25000,
    payment_method: "UPI",
    customer_type: "returning",
    subscription_type: "monthly",
    failure_reason: "bank_timeout",
    retry_count: 0,
    previous_success_rate: 0.88,
    days_since_last_payment: 25,
    checkout_completed: 1,
    customer_tenure_days: 500,
    recovered: 0,
  },

  declined: {
    transaction_id: "TX001072",
    amount: 50000,
    payment_method: "card",
    customer_type: "new",
    subscription_type: "monthly",
    failure_reason: "card_declined",
    retry_count: 5,
    previous_success_rate: 0.20,
    days_since_last_payment: 90,
    checkout_completed: 0,
    customer_tenure_days: 30,
    recovered: 0,
  },

  funds: {
    transaction_id: "TX001073",
    amount: 15000,
    payment_method: "UPI",
    customer_type: "returning",
    subscription_type: "monthly",
    failure_reason: "insufficient_funds",
    retry_count: 1,
    previous_success_rate: 0.65,
    days_since_last_payment: 15,
    checkout_completed: 1,
    customer_tenure_days: 300,
    recovered: 0,
  },

  expired: {
    transaction_id: "TX001074",
    amount: 12000,
    payment_method: "card",
    customer_type: "returning",
    subscription_type: "monthly",
    failure_reason: "expired_card",
    retry_count: 2,
    previous_success_rate: 0.35,
    days_since_last_payment: 60,
    checkout_completed: 0,
    customer_tenure_days: 200,
    recovered: 0,
  },
};
  function handleChange(event) {
  const { name, value } = event.target;

  setForm((prev) => ({
    ...prev,
    [name]: [
      "amount",
      "retry_count",
      "days_since_last_payment",
      "checkout_completed",
      "customer_tenure_days",
    ].includes(name)
      ? Number(value)
      : name === "previous_success_rate"
        ? Number(value) / 100
        : value,
  }));
}
  async function runPrediction() {
  setPredicting(true);
  setPredictionError("");
  setPrediction(null);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.detail || "Prediction request failed"
      );
    }

    const data = await response.json();

    setPrediction(data);

  } catch (error) {
    console.error(error);
    setPredictionError(error.message);
  } finally {
    setPredicting(false);
  }
}
const [form, setForm] = useState({
  transaction_id: "TX001070",
  amount: 19679.74,
  payment_method: "UPI",
  customer_type: "returning",
  subscription_type: "monthly",
  failure_reason: "network_error",
  retry_count: 0,
  previous_success_rate: 0.91,
  days_since_last_payment: 30,
  checkout_completed: 1,
  customer_tenure_days: 582,
  recovered: 0,
});
  const formatMoney = (value) => {
    if (value === undefined || value === null) {
      return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  if (loading) {
    return (
      <div className="page-state">
        Loading ML engine...
      </div>
    );
  }

  return (
    <section className="ml-page">

      <PageHeader
        eyebrow="ML RECOVERY ENGINE"
        title="Predict Recoverability"
        description="RevivePay uses machine learning to estimate whether a failed payment is worth attempting to recover."
      />


      {/* MODEL OVERVIEW */}

      <div className="ml-model-card">

        <div className="ml-model-icon">
          <Brain size={24} />
        </div>

        <div className="ml-model-info">

          <p className="eyebrow">
            CURRENT MODEL
          </p>

          <h3>
            Logistic Regression
          </h3>

          <p>
            A probabilistic classification model that estimates
            the likelihood of successfully recovering a failed payment.
          </p>

        </div>

        <div className="ml-model-status">
          <span className="live-dot" />
          MODEL ACTIVE
        </div>

      </div>


      {/* MODEL METRICS */}

      <div className="ml-stats">

        <MLStat
          icon={<Target size={18} />}
          label="Recovery Probability"
          value="82.2%"
          description="Example transaction"
        />

        <MLStat
          icon={<TrendingUp size={18} />}
          label="ROC-AUC"
          value="0.7125"
          description="Model discrimination"
        />

        <MLStat
          icon={<CircleDollarSign size={18} />}
          label="Expected Recovery"
          value={formatMoney(metrics?.expected_recovery)}
          description="Across failed payments"
        />

      </div>


      {/* HOW IT WORKS */}

      <div className="ml-section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              DECISION PROCESS
            </p>

            <h3>
              How the ML engine works
            </h3>
          </div>

        </div>


        <div className="ml-flow">

          <MLFlowCard
            number="01"
            title="Payment Context"
            description="Failure reason, payment method, retry count and customer history."
          />

          <Arrow />

          <MLFlowCard
            number="02"
            title="Feature Processing"
            description="Transaction features are transformed into model-ready inputs."
          />

          <Arrow />

          <MLFlowCard
            number="03"
            title="Probability"
            description="The model outputs a recovery probability between 0 and 1."
          />

          <Arrow />

          <MLFlowCard
            number="04"
            title="Expected Value"
            description="Probability is combined with transaction value to estimate recovery."
          />

        </div>

      </div>


      {/* FAILURE ANALYSIS */}

      <div className="ml-section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              MODEL INSIGHT
            </p>

            <h3>
              Recoverability by failure type
            </h3>
          </div>

          <span>
            Average recovery probability
          </span>

        </div>


        <div className="ml-failure-list">

          {metrics?.failure_reasons?.map((reason) => {

            const probability =
              reason.avg_recovery_probability * 100;

            return (
              <div
                className="ml-failure-row"
                key={reason.failure_reason}
              >

                <div className="ml-failure-name">
                  {reason.failure_reason.replaceAll("_", " ")}
                </div>

                <div className="ml-failure-bar">

                  <div
                    style={{
                      width: `${probability}%`,
                    }}
                  />

                </div>

                <strong>
                  {probability.toFixed(1)}%
                </strong>

              </div>
            );

          })}

        </div>

      </div>


      {/* EXAMPLE PREDICTION */}

      {/* LIVE PREDICTION */}

{/* LIVE PREDICTION */}

<div className="live-ml-panel">

  <div className="live-ml-header">

    <div>
      <p className="eyebrow">
        LIVE ML PREDICTION
      </p>

      <h3>
        Test a payment recovery scenario
      </h3>

      <p>
        Enter transaction details and run the trained
        recovery model without executing a payment.
      </p>
    </div>

    <div className="model-badge">
      <span />
      MODEL READY
    </div>

  </div>
  <div className="scenario-section">

  <div>
    <p className="eyebrow">
      QUICK SCENARIOS
    </p>

    <span className="scenario-hint">
      Load a realistic transaction profile
    </span>
  </div>

  <div className="scenario-buttons">

        <button
        onClick={() => {
            setForm(scenarios.network);
            setPrediction(null);
        }}
        >
        Network Error
        </button>

        <button
        onClick={() => {
            setForm(scenarios.timeout);
            setPrediction(null);
        }}
        >
        Bank Timeout
        </button>

        <button
        onClick={() => {
            setForm(scenarios.declined);
            setPrediction(null);
        }}
        >
        Card Declined
        </button>

        <button
        onClick={() => {
            setForm(scenarios.funds);
            setPrediction(null);
        }}
        >
        Insufficient Funds
        </button>

        <button
        onClick={() => {
            setForm(scenarios.expired);
            setPrediction(null);
        }}
        >
        Expired Card
        </button>

    </div>

    </div>

  <div className="prediction-form">

    {/* TRANSACTION */}

    <div className="form-field">

      <label>
        TRANSACTION ID
      </label>

      <input
        name="transaction_id"
        value={form.transaction_id}
        onChange={handleChange}
      />

    </div>


    <div className="form-field">

      <label>
        AMOUNT
      </label>

      <input
        type="number"
        name="amount"
        value={form.amount}
        onChange={handleChange}
      />

    </div>


    {/* PAYMENT METHOD */}

    <div className="form-field">

      <label>
        PAYMENT METHOD
      </label>

      <select
        name="payment_method"
        value={form.payment_method}
        onChange={handleChange}
      >
        <option value="UPI">UPI</option>
        <option value="card">Card</option>
        <option value="net_banking">Net Banking</option>
        <option value="wallet">Wallet</option>
      </select>

    </div>


    {/* CUSTOMER TYPE */}

    <div className="form-field">

      <label>
        CUSTOMER TYPE
      </label>

      <select
        name="customer_type"
        value={form.customer_type}
        onChange={handleChange}
      >
        <option value="returning">Returning</option>
        <option value="new">New</option>
      </select>

    </div>


    {/* SUBSCRIPTION */}

    <div className="form-field">

      <label>
        SUBSCRIPTION
      </label>

      <select
        name="subscription_type"
        value={form.subscription_type}
        onChange={handleChange}
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
        <option value="none">None</option>
      </select>

    </div>


    {/* FAILURE */}

    <div className="form-field">

      <label>
        FAILURE REASON
      </label>

      <select
        name="failure_reason"
        value={form.failure_reason}
        onChange={handleChange}
      >
        <option value="network_error">
          Network Error
        </option>

        <option value="bank_timeout">
          Bank Timeout
        </option>

        <option value="card_declined">
          Card Declined
        </option>

        <option value="expired_card">
          Expired Card
        </option>

        <option value="insufficient_funds">
          Insufficient Funds
        </option>
      </select>

    </div>


    {/* RETRIES */}

    <div className="form-field">

      <label>
        RETRY COUNT
      </label>

      <input
        type="number"
        min="0"
        name="retry_count"
        value={form.retry_count}
        onChange={handleChange}
      />

    </div>


    {/* SUCCESS RATE */}

    <div className="form-field">

      <label>
        PREVIOUS SUCCESS RATE (%)
      </label>

      <input
        type="number"
        min="0"
        max="100"
        name="previous_success_rate"
        value={form.previous_success_rate * 100}
        onChange={handleChange}
      />

    </div>


    {/* DAYS */}

    <div className="form-field">

      <label>
        DAYS SINCE LAST PAYMENT
      </label>

      <input
        type="number"
        min="0"
        name="days_since_last_payment"
        value={form.days_since_last_payment}
        onChange={handleChange}
      />

    </div>


    {/* TENURE */}

    <div className="form-field">

      <label>
        CUSTOMER TENURE (DAYS)
      </label>

      <input
        type="number"
        min="0"
        name="customer_tenure_days"
        value={form.customer_tenure_days}
        onChange={handleChange}
      />

    </div>

  </div>


  <button
    className="predict-button"
    onClick={runPrediction}
    disabled={predicting}
  >
    {predicting
      ? "Running Model..."
      : "Run ML Prediction"}
  </button>


  {predictionError && (
    <div className="prediction-error">
      {predictionError}
    </div>
  )}


  {/* RESULT */}

  {prediction && (() => {
  const probability =
    prediction.ml.recovery_probability * 100;

  const expectedRecovery =
    Number(prediction.ml.expected_recovery_value);

  let level = "LOW RECOVERY POTENTIAL";

  if (probability >= 70) {
    level = "HIGH RECOVERY POTENTIAL";
  } else if (probability >= 40) {
    level = "MODERATE RECOVERY POTENTIAL";
  }

  return (
    <div className="live-prediction-result">

      <div className="result-main">

        <div className="result-label-row">
          <span>RECOVERY PROBABILITY</span>

          <strong className={`risk-level ${
            probability >= 70
              ? "high"
              : probability >= 40
                ? "moderate"
                : "low"
          }`}>
            {level}
          </strong>
        </div>

        <strong className="probability-value">
          {probability.toFixed(2)}%
        </strong>

        <div className="probability-bar">

          <div
            className={`probability-fill ${
              probability >= 70
                ? "high"
                : probability >= 40
                  ? "moderate"
                  : "low"
            }`}
            style={{
              width: `${probability}%`,
            }}
          />

        </div>

        <small>
          Probability that this failed payment can be recovered
        </small>

      </div>


      <div className="result-divider" />


      <div className="result-secondary">

        <span>EXPECTED RECOVERY</span>

        <strong>
          ₹
          {expectedRecovery.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </strong>

        <small>
          Transaction value × recovery probability
        </small>

      </div>

    </div>
  );
})()}

</div>
    </section>
  );
}


function MLStat({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="ml-stat">

      <div className="ml-stat-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>
  );
}


function MLFlowCard({
  number,
  title,
  description,
}) {
  return (
    <div className="ml-flow-card">

      <span>
        {number}
      </span>

      <h4>
        {title}
      </h4>

      <p>
        {description}
      </p>

    </div>
  );
}


function Arrow() {
  return (
    <ArrowUpRight
      className="ml-flow-arrow"
      size={17}
    />
  );
}

export default MLEngine;
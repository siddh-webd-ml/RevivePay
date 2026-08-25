import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Brain,
} from "lucide-react";

import PageHeader from "../components/PageHeader";

function AIDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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
    customer_tenure_days: 583,
    recovered: 0,
  });

  function handleChange(e) {
    const { name, value } = e.target;

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

  async function runDiagnosis() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/diagnose",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("AI diagnosis failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to run AI diagnosis."
      );
    } finally {
      setLoading(false);
    }
  }

  function parseAnalysis(text) {
    const lines = text.split("\n");

    const getValue = (label) => {
      const line = lines.find((item) =>
        item.trim().startsWith(label)
      );

      return line
        ? line.substring(label.length).trim()
        : "";
    };

    return {
      diagnosis: getValue("Diagnosis:"),
      action: getValue("Recommended Action:"),
      reason: getValue("Reason:"),
      confidence: getValue("Confidence:"),
    };
  }

  const analysis = result
    ? parseAnalysis(result.ai.analysis)
    : null;

  return (
    <section className="ai-page">

      <PageHeader
        eyebrow="AI DIAGNOSIS"
        title="Understand Why Payments Fail"
        description="Gemini analyzes payment context and recommends the most appropriate recovery action."
      />

      {/* TRANSACTION CONTEXT */}

      <div className="ai-panel">

        <div className="ai-panel-header">
          <div>
            <p className="eyebrow">
              TRANSACTION CONTEXT
            </p>

            <h3>
              Failed Payment
            </h3>
          </div>

          <span className="tx-badge">
            {form.transaction_id}
          </span>
        </div>


        {/* EDITABLE INPUTS */}

        <div className="ai-input-grid">

          <label>
            TRANSACTION ID

            <input
              name="transaction_id"
              value={form.transaction_id}
              onChange={handleChange}
            />
          </label>


          <label>
            AMOUNT

            <input
              type="number"
              min="0"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />
          </label>


          <label>
            PAYMENT METHOD

            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
            >
              <option value="UPI">UPI</option>
              <option value="card">Card</option>
              <option value="net_banking">
                Net Banking
              </option>
              <option value="wallet">
                Wallet
              </option>
            </select>
          </label>


          <label>
            CUSTOMER TYPE

            <select
              name="customer_type"
              value={form.customer_type}
              onChange={handleChange}
            >
              <option value="returning">
                Returning
              </option>

              <option value="new">
                New
              </option>
            </select>
          </label>


          <label>
            SUBSCRIPTION

            <select
              name="subscription_type"
              value={form.subscription_type}
              onChange={handleChange}
            >
              <option value="monthly">
                Monthly
              </option>

              <option value="yearly">
                Yearly
              </option>

              <option value="none">
                None
              </option>
            </select>
          </label>


          <label>
            FAILURE REASON

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
          </label>


          <label>
            RETRY COUNT

            <input
              type="number"
              min="0"
              name="retry_count"
              value={form.retry_count}
              onChange={handleChange}
            />
          </label>


          <label>
            PREVIOUS SUCCESS RATE (%)

            <input
              type="number"
              min="0"
              max="100"
              name="previous_success_rate"
              value={
                form.previous_success_rate * 100
              }
              onChange={handleChange}
            />
          </label>


          <label>
            DAYS SINCE LAST PAYMENT

            <input
              type="number"
              min="0"
              name="days_since_last_payment"
              value={form.days_since_last_payment}
              onChange={handleChange}
            />
          </label>


          <label>
            CUSTOMER TENURE (DAYS)

            <input
              type="number"
              min="0"
              name="customer_tenure_days"
              value={form.customer_tenure_days}
              onChange={handleChange}
            />
          </label>

        </div>


        {/* RUN */}

        <button
          className="ai-run-button"
          onClick={runDiagnosis}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw
                size={14}
                className="spin"
              />

              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} />

              Run AI Diagnosis
            </>
          )}
        </button>


        {error && (
          <div className="ai-error">
            {error}
          </div>
        )}

      </div>


      {/* RESULT */}

      {analysis && (
        <div className="ai-result-panel">

          <div className="ai-result-header">

            <div>
              <p className="eyebrow">
                AI ANALYSIS
              </p>

              <h3>
                Recommended Intervention
              </h3>
            </div>

            <div className="confidence">

              <span>
                CONFIDENCE
              </span>

              <strong>
                {analysis.confidence}
              </strong>

            </div>

          </div>


          {/* ML CONTEXT */}

          <div className="ai-context-grid">

            <div>
              <small>
                ML RECOVERY PROBABILITY
              </small>

              <strong>
                {(
                  result.ml.recovery_probability * 100
                ).toFixed(2)}
                %
              </strong>
            </div>


            <div>
              <small>
                EXPECTED RECOVERY
              </small>

              <strong>
                ₹
                {result.ml.expected_recovery_value.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>


            <div>
              <small>
                AI ACTION
              </small>

              <strong>
                {analysis.action}
              </strong>
            </div>


            <div>
              <small>
                CONFIDENCE
              </small>

              <strong>
                {analysis.confidence}
              </strong>
            </div>

          </div>


          {/* RECOMMENDATION */}

          <div className="ai-recommendation">

            <div className="recommendation-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <small>
                RECOMMENDED ACTION
              </small>

              <strong>
                {analysis.action}
              </strong>
            </div>

          </div>


          {/* ANALYSIS */}

          <div className="ai-analysis-grid">

            <div className="analysis-box">

              <span>
                DIAGNOSIS
              </span>

              <p>
                {analysis.diagnosis}
              </p>

            </div>


            <div className="analysis-box">

              <span>
                REASON
              </span>

              <p>
                {analysis.reason}
              </p>

            </div>

          </div>


          {/* SAFETY */}

          <div className="ai-safety-note">

            <Brain size={15} />

            <span>
              AI recommends the intervention.
              Policy validation is required before
              any recovery action can execute.
            </span>

          </div>

        </div>
      )}

    </section>
  );
}

export default AIDiagnosis;
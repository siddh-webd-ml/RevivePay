import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import PageHeader from "../components/PageHeader";

function PolicyEngine() {
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

  async function evaluatePolicy() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/policy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Policy evaluation failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to evaluate policy."
      );
    } finally {
      setLoading(false);
    }
  }

  const policy = result?.policy;
  const allowed = policy?.decision === "ALLOW";

  return (
    <section className="policy-page">

      <PageHeader
        eyebrow="POLICY ENGINE"
        title="AI Recommends. Policy Decides."
        description="Deterministic governance rules validate every AI recommendation before execution."
      />

      {/* TRANSACTION INPUT */}

      <div className="policy-context">

        <div className="policy-context-header">

          <div>
            <p className="eyebrow">
              TRANSACTION CONTEXT
            </p>

            <h3>
              Recovery Authorization
            </h3>
          </div>

          <div className="policy-shield">
            <ShieldCheck size={15} />
            GOVERNED
          </div>

        </div>


        <div className="policy-input-grid">

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


          <label>
            CHECKOUT COMPLETED

            <select
              name="checkout_completed"
              value={form.checkout_completed}
              onChange={handleChange}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>


          <label>
            RECOVERED

            <select
              name="recovered"
              value={form.recovered}
              onChange={handleChange}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </label>

        </div>

      </div>


      {/* EVALUATE */}

      <div className="policy-action-panel">

        <div>
          <p className="eyebrow">
            POLICY EVALUATION
          </p>

          <h3>
            Validate AI Recommendation
          </h3>

          <p>
            The transaction will pass through ML,
            AI diagnosis and deterministic policy
            controls before a final action is approved.
          </p>
        </div>


        <button
          className="policy-run-button"
          onClick={evaluatePolicy}
          disabled={loading}
        >

          {loading ? (
            <>
              <RefreshCw
                size={14}
                className="spin"
              />
              Evaluating...
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Evaluate Policy
            </>
          )}

        </button>

      </div>


      {error && (
        <div className="policy-error">
          {error}
        </div>
      )}


      {/* RESULTS */}

      {result && (
        <>

          {/* AI RECOMMENDATION */}

          <div className="policy-panel">

            <div className="policy-panel-header">

              <div>
                <p className="eyebrow">
                  AI RECOMMENDATION
                </p>

                <h3>
                  Proposed Intervention
                </h3>
              </div>

              <span className="action-badge">
                {result.ai.recommended_action}
              </span>

            </div>


            <div className="recommendation-row">

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
                  {result.ai.recommended_action}
                </strong>
              </div>

            </div>

          </div>


          {/* POLICY RULES */}

          <div className="policy-panel">

            <div className="policy-panel-header">

              <div>
                <p className="eyebrow">
                  GOVERNANCE
                </p>

                <h3>
                  Deterministic Policy Checks
                </h3>
              </div>

              <span className="rules-count">
                6 RULES
              </span>

            </div>


            <div className="policy-rules">

              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    AI action is supported
                  </strong>

                  <small>
                    Only predefined recovery actions
                    are permitted.
                  </small>
                </div>
              </div>


              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    Payment is not already recovered
                  </strong>

                  <small>
                    Recovered payments cannot be
                    processed again.
                  </small>
                </div>
              </div>


              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    Retry limit is respected
                  </strong>

                  <small>
                    Automatic retry is blocked after
                    the maximum allowed attempts.
                  </small>
                </div>
              </div>


              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    Recovery probability is sufficient
                  </strong>

                  <small>
                    Very low probability transactions
                    are stopped.
                  </small>
                </div>
              </div>


              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    Failure type supports action
                  </strong>

                  <small>
                    Each intervention must match the
                    underlying failure reason.
                  </small>
                </div>
              </div>


              <div className="policy-rule">
                <CheckCircle2 size={15} />

                <div>
                  <strong>
                    Recovery action is bounded
                  </strong>

                  <small>
                    Policy prevents unrestricted AI
                    execution.
                  </small>
                </div>
              </div>

            </div>

          </div>


          {/* DECISION */}

          <div
            className={`policy-decision ${
              allowed
                ? "decision-allow"
                : "decision-block"
            }`}
          >

            <div className="decision-icon">

              {allowed ? (
                <CheckCircle2 size={25} />
              ) : (
                <XCircle size={25} />
              )}

            </div>


            <div className="decision-content">

              <span>
                POLICY DECISION
              </span>

              <strong>
                {policy.decision}
              </strong>

              <p>
                {policy.reason}
              </p>

            </div>

          </div>


          {/* FINAL ACTION */}

          <div className="policy-final">

            <div>

              <p className="eyebrow">
                FINAL ACTION
              </p>

              <h3>
                {policy.final_action}
              </h3>

            </div>

            <span>
              {allowed
                ? "Approved for recovery workflow"
                : "Recovery blocked by policy"}
            </span>

          </div>


          {/* PRINCIPLE */}

          <div className="policy-principle">

            <ShieldAlert size={17} />

            <div>

              <strong>
                AI recommends. Policy decides.
              </strong>

              <p>
                AI-generated actions never execute
                directly. Every recovery recommendation
                must pass deterministic policy controls
                before reaching the recovery workflow.
              </p>

            </div>

          </div>

        </>
      )}

    </section>
  );
}

export default PolicyEngine;
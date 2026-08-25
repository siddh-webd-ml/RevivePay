import { useState } from "react";
import {
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";

import PageHeader from "../components/PageHeader";

function Recovery() {
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

  async function executeRecovery() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recovery",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Recovery execution failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to execute recovery."
      );
    } finally {
      setLoading(false);
    }
  }

  const recovery = result?.recovery;
  const policy = result?.policy;

  const recovered =
    recovery?.outcome === "RECOVERED";

  const executed =
    recovery?.status === "EXECUTED";

  return (
    <section className="recovery-page">

      <PageHeader
        eyebrow="RECOVERY SIMULATOR"
        title="Execute a Recovery Decision"
        description="Run the complete RevivePay recovery pipeline from prediction to simulated execution."
      />


      {/* TRANSACTION INPUT */}

      <div className="recovery-context">

        <div className="recovery-context-header">

          <div>
            <p className="eyebrow">
              RECOVERY REQUEST
            </p>

            <h3>
              Transaction Details
            </h3>
          </div>

          <span className="recovery-tx">
            {form.transaction_id}
          </span>

        </div>


        <div className="recovery-input-grid">

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

      </div>


      {/* EXECUTION GATE */}

      <div className="recovery-authorization">

        <div>

          <p className="eyebrow">
            EXECUTION GATE
          </p>

          <h3>
            Policy-Approved Recovery
          </h3>

          <p>
            The transaction passes through ML,
            AI diagnosis and deterministic policy
            controls before simulated execution.
          </p>

        </div>


        <button
          className="recovery-execute-button"
          onClick={executeRecovery}
          disabled={loading}
        >

          {loading ? (
            <>
              <RefreshCw
                size={14}
                className="spin"
              />

              Executing...
            </>
          ) : (
            <>
              <Play size={14} />

              Execute Recovery
            </>
          )}

        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="recovery-error">
          {error}
        </div>
      )}


      {/* RESULT */}

      {result && (
        <>

          {/* DECISION CHAIN */}

          <div className="recovery-panel">

            <div className="recovery-panel-header">

              <div>
                <p className="eyebrow">
                  DECISION CHAIN
                </p>

                <h3>
                  Recovery Authorization
                </h3>
              </div>

            </div>


            <div className="recovery-chain">

              <div className="chain-node">
                <small>ML</small>

                <strong>
                  {(
                    result.ml.recovery_probability * 100
                  ).toFixed(2)}
                  %
                </strong>

                <span>
                  Recoverability
                </span>
              </div>


              <div className="chain-arrow">
                →
              </div>


              <div className="chain-node">
                <small>AI</small>

                <strong>
                  {result.ai.recommended_action}
                </strong>

                <span>
                  Recommendation
                </span>
              </div>


              <div className="chain-arrow">
                →
              </div>


              <div
                className={`chain-node ${
                  policy?.decision === "ALLOW"
                    ? "chain-success"
                    : "chain-block"
                }`}
              >
                <small>POLICY</small>

                <strong>
                  {policy?.decision}
                </strong>

                <span>
                  Governance
                </span>
              </div>


              <div className="chain-arrow">
                →
              </div>


              <div className="chain-node">
                <small>FINAL ACTION</small>

                <strong>
                  {policy?.final_action}
                </strong>

                <span>
                  Execution
                </span>
              </div>

            </div>

          </div>


          {/* SIMULATOR RESULT */}

          <div
            className={`recovery-result ${
              recovered
                ? "result-success"
                : executed
                  ? "result-failed"
                  : "result-stopped"
            }`}
          >

            <div className="recovery-result-icon">

              {recovered ? (
                <CheckCircle2 size={25} />
              ) : executed ? (
                <XCircle size={25} />
              ) : (
                <ShieldCheck size={25} />
              )}

            </div>


            <div className="recovery-result-main">

              <span>
                SIMULATED OUTCOME
              </span>

              <strong>
                {recovery.outcome}
              </strong>

              <p>
                {recovery.message ||
                  (recovered
                    ? "Payment recovery simulated successfully."
                    : executed
                      ? "Recovery action executed but payment was not recovered."
                      : "Recovery action was not executed.")}
              </p>

            </div>

          </div>


          {/* EXECUTION METRICS */}

          <div className="recovery-metrics">

            <div>
              <small>STATUS</small>

              <strong>
                {recovery.status}
              </strong>
            </div>


            <div>
              <small>ACTION</small>

              <strong>
                {recovery.action ||
                  policy?.final_action ||
                  "STOP"}
              </strong>
            </div>


            <div>
              <small>
                EFFECTIVE PROBABILITY
              </small>

              <strong>
                {recovery.effective_probability != null
                  ? `${(
                      recovery.effective_probability * 100
                    ).toFixed(2)}%`
                  : "—"}
              </strong>
            </div>


            <div>
              <small>AMOUNT</small>

              <strong>
                ₹
                {Number(
                  recovery.amount || form.amount
                ).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

          </div>


          {/* MONEY RECOVERED */}

          {recovered && (
            <div className="money-recovered">

              <div>

                <p className="eyebrow">
                  MONEY RECOVERED
                </p>

                <h3>
                  ₹
                  {Number(
                    recovery.amount
                  ).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </h3>

              </div>

              <Activity size={20} />

            </div>
          )}


          {/* AUDIT EVENT */}

          <div className="recovery-audit">

            <span>
              SIMULATOR EVENT
            </span>

            <strong>
              {recovery.timestamp
                ? new Date(
                    recovery.timestamp
                  ).toLocaleString("en-IN")
                : "—"}
            </strong>

          </div>


          {/* SAFETY */}

          <div className="recovery-safety">

            <ShieldCheck size={16} />

            <div>

              <strong>
                Simulation only — no real payment executed.
              </strong>

              <p>
                Recovery actions are executed only after
                deterministic policy approval. The simulator
                produces a bounded and auditable outcome.
              </p>

            </div>

          </div>

        </>
      )}

    </section>
  );
}

export default Recovery;
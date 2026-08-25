import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  Activity,
  AlertTriangle
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { getMetrics } from "../api/api";


function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError("");

      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      setError("Backend unavailable");
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (value) => {
    if (value === undefined || value === null) return "—";

    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  if (loading) {
    return (
      <div className="page-state">
        Loading RevivePay intelligence...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state error-state">
        <Activity size={18} />
        {error}

        <button onClick={loadMetrics}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="overview-page">

      <PageHeader
        eyebrow="OVERVIEW"
        title="Payment Recovery Intelligence"
        description="Monitor how RevivePay predicts, diagnoses, governs and recovers failed payments."
      />


      {/* METRICS */}

      <div className="overview-metrics">

                <MetricCard
                icon={<Activity size={18} />}
                label="Total Failed Payments"
                value={
                    metrics?.total_failed_payments?.toLocaleString("en-IN") ?? "—"
                }
                description="Transactions evaluated"
                />

                <MetricCard
                icon={<CircleDollarSign size={18} />}
                label="Revenue at Risk"
                value={formatMoney(metrics?.revenue_at_risk)}
                description="Failed payment value"
                />

                <MetricCard
                icon={<TrendingUp size={18} />}
                label="Expected Recovery"
                value={formatMoney(metrics?.expected_recovery)}
                description="ML-estimated recoverable value"
                />

                <MetricCard
                icon={<Zap size={18} />}
                label="Recovery Potential"
                value={
                    metrics?.revenue_at_risk
                    ? `${(
                        (metrics.expected_recovery /
                            metrics.revenue_at_risk) *
                        100
                        ).toFixed(1)}%`
                    : "—"
                }
                description="Expected recovery / revenue at risk"
                />
      </div>


      {/* PIPELINE */}

      <div className="overview-section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              CORE SYSTEM
            </p>

            <h3>
              How RevivePay Recovers Revenue
            </h3>
          </div>

          <span>
            4-stage decision pipeline
          </span>

        </div>


        <div className="recovery-pipeline">

            <PipelineCard
            number="01"
            icon={<Brain size={20} />}
            title="ML Prediction"
            description="Estimates whether the failed payment is worth recovering."
            tag="RECOVERABILITY"
            path="/ml"
            />

            <PipelineCard
            number="02"
            icon={<Bot size={20} />}
            title="AI Diagnosis"
            description="Gemini analyzes the failure and recommends an action."
            tag="INTELLIGENCE"
            path="/ai"
            />

            <PipelineCard
            number="03"
            icon={<ShieldCheck size={20} />}
            title="Policy Decision"
            description="Deterministic rules validate the AI recommendation."
            tag="GOVERNANCE"
            path="/policy"
            />

            <PipelineCard
            number="04"
            icon={<Zap size={20} />}
            title="Recovery"
            description="Approved actions are executed through the simulator."
            tag="EXECUTION"
            path="/recovery"
            />

        </div>

      </div>
{/* FAILURE INTELLIGENCE */}

        <div className="failure-intelligence">

        <div className="section-heading">

            <div>
            <p className="eyebrow">
                FAILURE INTELLIGENCE
            </p>

            <h3>
                Which failures are worth recovering?
            </h3>
            </div>

            <span>
            Based on 2,964 failed payments
            </span>

        </div>


        <div className="failure-table">

            <div className="failure-table-head">
            <span>FAILURE REASON</span>
            <span>TRANSACTIONS</span>
            <span>AVG RECOVERY</span>
            <span>REVENUE AT RISK</span>
            </div>


            {metrics?.failure_reasons?.map((reason) => (

            <div
                className="failure-table-row"
                key={reason.failure_reason}
            >

                <div className="failure-name">

                <div className="failure-icon">
                    <AlertTriangle size={14} />
                </div>

                <span>
                    {reason.failure_reason.replaceAll("_", " ")}
                </span>

                </div>


                <strong>
                {reason.transactions.toLocaleString("en-IN")}
                </strong>


                <strong>
                {(reason.avg_recovery_probability * 100).toFixed(1)}%
                </strong>


                <strong className="failure-revenue">
                {formatMoney(reason.revenue_at_risk)}
                </strong>

            </div>

            ))}

        </div>

        </div>

      {/* PRODUCT PRINCIPLE */}

      <div className="principle-card">

        <div className="principle-icon">
          <ShieldCheck size={22} />
        </div>

        <div>

          <p className="eyebrow">
            CORE PRINCIPLE
          </p>

          <h3>
            AI recommends. Policy decides.
          </h3>

          <p>
            RevivePay never allows an AI recommendation to
            directly execute a payment recovery action.
            Every recommendation passes through deterministic
            policy controls first.
          </p>

        </div>

      </div>

    </section>
  );
}


function MetricCard({
  icon,
  label,
  value,
  description,
  danger = false,
}) {
  return (
    <div className="overview-metric-card">

      <div className="metric-icon">
        {icon}
      </div>

      <p>
        {label}
      </p>

      <strong className={danger ? "danger-text" : ""}>
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>
  );
}


function PipelineCard({
  number,
  icon,
  title,
  description,
  tag,
  path,
}) {
  return (
    <Link
      to={path}
      className="pipeline-card"
    >

      <span className="pipeline-number">
        {number}
      </span>

      <div className="pipeline-card-icon">
        {icon}
      </div>

      <h4>
        {title}
      </h4>

      <p>
        {description}
      </p>

      <span className="pipeline-tag">
        {tag}
      </span>

    </Link>
  );
}

export default Overview;
"use client";
import { useState } from "react";
import { PageHeader } from "@/app/components/ui";

// ZOMBIE: no prices yet. Pick your prices, create matching Prices in Stripe (test mode),
// and show them here.
const PLANS = [
  { id: "starter", name: "Starter", price: "Set your price", perks: ["1 user", "100 responses a month", "Unlimited forms"] },
  { id: "pro", name: "Pro", price: "Set your price", perks: ["3 users", "1,000 responses a month", "Everything in Starter", "Priority support"] },
];

export default function PricingPage() {
  const [error, setError] = useState("");

  async function buy(plan: string) {
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError(data.error ?? "Checkout failed.");
  }

  return (
    <>
      <PageHeader title="Pricing" sub="Half the price of the tool you're used to. Once Stripe works." />
      <div className="grid">
        {PLANS.map((p) => (
          <div key={p.id} className="card stack">
            <strong>{p.name}</strong>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{p.price}</div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {p.perks.map((perk) => <li key={perk}>{perk}</li>)}
            </ul>
            <button onClick={() => buy(p.id)}>Buy {p.name}</button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}

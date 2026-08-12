"use client";

import { useState } from "react";
import { PLANS } from "@/lib/stripe/stripe";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    setStatusMsg("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email: "user@example.com" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setStatusMsg(`Initialized checkout for ${PLANS[planId].name}. (Monetization Mode is currently OFF by Admin — all content is 100% free!)`);
      } else {
        setStatusMsg(`❌ ${data.error || "Checkout error"}`);
      }
    } catch (err: any) {
      setStatusMsg(`❌ ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="rounded-full px-4 py-1 bg-primary/10 text-primary border-0 font-semibold">
          Transparent Commercial Plans
        </Badge>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          Flexible Plans for Every Reader
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Readora is committed to global public access. Choose a plan to support open literature preservation and unlock advanced AI reading features.
        </p>

        {statusMsg && (
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold max-w-xl mx-auto">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(PLANS).map((plan) => {
          const isFeatured = plan.id === 'pro';
          const isPopular = plan.id === 'student';

          return (
            <Card
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                isFeatured
                  ? 'border-2 border-primary shadow-2xl bg-card scale-105 z-10'
                  : 'border bg-card hover:shadow-lg'
              }`}
            >
              {isFeatured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold px-3 py-0.5 rounded-full text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1 inline" /> Most Popular
                </Badge>
              )}

              <div>
                <CardHeader className="p-0 pb-4">
                  <h3 className="font-serif font-bold text-xl">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/{plan.interval}</span>
                  </div>
                  <CardDescription className="text-xs mt-2 leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <div className="space-y-2 py-4 border-t border-b border-border/50 my-4 text-xs">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                disabled={loadingPlan === plan.id}
                onClick={() => handleSubscribe(plan.id)}
                variant={isFeatured ? "default" : "outline"}
                className="w-full rounded-full py-5 font-bold text-xs"
              >
                {plan.id === 'free' ? 'Current Free Plan' : `Get ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border">
          <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs">Secure Stripe Checkout</h4>
            <p className="text-[11px] text-muted-foreground">Encrypted transactions & easy cancellation anytime.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border">
          <HeartHandshake className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs">Public Domain Preservation</h4>
            <p className="text-[11px] text-muted-foreground">Proceeds fund free book digitization and open access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border">
          <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs">Instant AI Access</h4>
            <p className="text-[11px] text-muted-foreground">Unlock RAG Ask-the-Book and character graph maps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

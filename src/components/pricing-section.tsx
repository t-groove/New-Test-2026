import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "Essential tools for solo operators and early-stage businesses.",
    popular: false,
    features: [
      "Bookkeeping & P&L",
      "Professional invoicing",
      "Bank sync & import",
      "Receipt capture & OCR",
      "Mileage tracking",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description:
      "The full back-office suite — everything your business needs.",
    popular: true,
    features: [
      "Everything in Starter",
      "Tax filing (quarterly + year-end)",
      "Registered agent in all 50 states",
      "Annual report filing",
      "Website builder",
      "Priority support",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative bg-[#0A0F1E] py-20 sm:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E2A45] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-syne font-bold text-[#E8ECF4] text-3xl sm:text-4xl md:text-[44px] leading-tight tracking-tight mb-4">
            Simple, honest pricing.
          </h2>
          <p className="text-[#6B7A99] text-lg max-w-lg mx-auto">
            No surprises. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative bg-[#111827] rounded-lg p-7 sm:p-8 transition-all duration-200 ${
                plan.popular
                  ? "border-2 border-[#4F7FFF] hover:shadow-[0_0_30px_rgba(79,127,255,0.15)]"
                  : "border border-[#1E2A45] hover:border-[#4F7FFF]/30 hover:shadow-[0_0_20px_rgba(79,127,255,0.08)]"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#4F7FFF] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[#E8ECF4] font-syne font-bold text-xl mb-2">
                  {plan.name}
                </h3>
                <p className="text-[#6B7A99] text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#E8ECF4] font-syne font-bold text-4xl">
                    {plan.price}
                  </span>
                  <span className="text-[#6B7A99] text-base">{plan.period}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check className="w-4 h-4 text-[#4F7FFF] mt-0.5 shrink-0" />
                    <span className="text-[#E8ECF4]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/sign-up"
                className={`block w-full text-center font-semibold text-sm py-3.5 rounded-md transition-all duration-150 active:scale-[0.97] ${
                  plan.popular
                    ? "bg-[#4F7FFF] hover:bg-[#3D6FEF] text-white"
                    : "bg-[#1E2A45] hover:bg-[#4F7FFF]/20 text-[#E8ECF4] border border-[#1E2A45] hover:border-[#4F7FFF]/40"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

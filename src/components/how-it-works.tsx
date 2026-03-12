import { UserPlus, Landmark, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description: "Enter your business name, state, and entity type.",
  },
  {
    number: "02",
    icon: Landmark,
    title: "Connect your bank",
    description: "Secure, read-only access via bank-level encryption.",
  },
  {
    number: "03",
    icon: RefreshCw,
    title: "Everything syncs",
    description:
      "Transactions, mileage, invoices — all in one dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#0A0F1E] py-20 sm:py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E2A45] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-syne font-bold text-[#E8ECF4] text-3xl sm:text-4xl md:text-[44px] leading-tight tracking-tight mb-4">
            Up and running in{" "}
            <span className="text-[#4F7FFF]">under 10 minutes.</span>
          </h2>
          <p className="text-[#6B7A99] text-lg max-w-lg mx-auto">
            Three simple steps to replace every tool in your stack.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-[#1E2A45] via-[#4F7FFF]/30 to-[#1E2A45]" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative text-center">
                  {/* Number circle */}
                  <div className="relative z-10 w-[72px] h-[72px] mx-auto mb-6 rounded-full bg-[#111827] border-2 border-[#1E2A45] flex items-center justify-center">
                    <span className="text-[#4F7FFF] font-syne font-bold text-lg">
                      {step.number}
                    </span>
                  </div>
                  {/* Icon */}
                  <div className="w-11 h-11 mx-auto mb-4 rounded-lg bg-[#4F7FFF]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#4F7FFF]" />
                  </div>
                  <h3 className="text-[#E8ECF4] font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#6B7A99] text-sm max-w-xs mx-auto leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

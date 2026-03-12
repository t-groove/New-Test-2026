import {
  BookOpen,
  FileText,
  Landmark,
  Camera,
  Car,
  FileCheck,
  Building,
  CalendarCheck,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    name: "Bookkeeping",
    description:
      "Automatic P&L, expense categorization, and a real-time ledger.",
  },
  {
    icon: FileText,
    name: "Invoicing",
    description:
      "Send professional invoices and get paid online in minutes.",
  },
  {
    icon: Landmark,
    name: "Bank sync",
    description:
      "Securely connect your bank and auto-import every transaction.",
  },
  {
    icon: Camera,
    name: "Receipt capture",
    description: "Snap a photo; we OCR and categorize it instantly.",
  },
  {
    icon: Car,
    name: "Mileage tracking",
    description:
      "Log trips automatically and calculate IRS deductions.",
  },
  {
    icon: FileCheck,
    name: "Tax filing",
    description:
      "Quarterly estimates and year-end filing, done for you.",
  },
  {
    icon: Building,
    name: "Registered agent",
    description: "We're your registered agent in all 50 states.",
  },
  {
    icon: CalendarCheck,
    name: "Annual reports",
    description:
      "We file your state annual report before the deadline.",
  },
  {
    icon: Globe,
    name: "Website builder",
    description: "Launch a clean business website in under an hour.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative bg-[#0A0F1E] py-20 sm:py-28">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E2A45] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-syne font-bold text-[#E8ECF4] text-3xl sm:text-4xl md:text-[44px] leading-tight tracking-tight mb-4">
            One platform.{" "}
            <span className="text-[#4F7FFF]">Everything handled.</span>
          </h2>
          <p className="text-[#6B7A99] text-lg max-w-2xl mx-auto">
            Nine essential business tools, unified in a single dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="group bg-[#111827] border border-[#1E2A45] rounded-lg p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-[#4F7FFF]/20"
              >
                <div className="w-11 h-11 rounded-lg bg-[#4F7FFF]/10 flex items-center justify-center mb-4 group-hover:bg-[#4F7FFF]/15 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-[#4F7FFF]" />
                </div>
                <h3 className="text-[#E8ECF4] font-semibold text-base mb-2">
                  {feature.name}
                </h3>
                <p className="text-[#6B7A99] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

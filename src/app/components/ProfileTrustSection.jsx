import { ShieldCheck, Clock, Shield, Info } from "lucide-react";

const SafeIconLocal = ({ icon: Icon, ...props }) => {
    if (!Icon) return null;
    return <Icon {...props} />;
};

const POLICIES = [
    {
        title: "Escrow Assurance",
        icon: ShieldCheck,
        desc: "Your payment stays protected until the booked service is delivered. If the expert does not respond or the service is not fulfilled as committed, your case can be reviewed under platform policy.",
        tooltip: "Xmytravel holds your payment against the booked service so there is more trust and accountability on both sides."
    },
    {
        title: "Scheduling Policy",
        icon: Clock,
        desc: "Consultations are confirmed against available slots. You can reschedule within the allowed window shown at booking. Missed sessions without prior notice may be treated as completed.",
        tooltip: "This helps experts prepare properly and keeps time slots fair for all users on the platform."
    },
    {
        title: "Satisfaction Protocol",
        icon: Shield,
        desc: "If your booked service is materially incomplete or unresolved, you can raise it for review within the support window mentioned on the platform. Our team will assess the case and guide the next step.",
        tooltip: "If something clearly falls short of the booked scope, Xmytravel can step in and review the case through its support process."
    }
];

export default function ProfileTrustSection() {
    return (
        <section id="policies" className="bg-gray-50 rounded-[32px] p-8 lg:p-10 shadow-inner scroll-mt-32 text-left">
            <h2 className="text-xl font-bold mb-8 text-[#36013F] capitalize tracking-tight px-2">Operational Assurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {POLICIES.map(policy => (
                    <div key={policy.title} className="p-6 rounded-2xl bg-white shadow-lg flex flex-col gap-4 relative group">
                        <div className="w-12 h-12 rounded-xl bg-[#36013F] text-[#FDC700] flex items-center justify-center shadow-xl">
                            <SafeIconLocal icon={policy.icon} size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-black text-[#36013F] uppercase tracking-tight">{policy.title}</h4>
                                <div className="group/tooltip relative">
                                    <Info size={14} className="text-gray-400 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#36013F] text-white text-[10px] leading-snug rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 text-center shadow-xl">
                                        <div className="font-bold mb-1 text-[#FDC700]">What this means</div>
                                        {policy.tooltip}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#36013F]"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{policy.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

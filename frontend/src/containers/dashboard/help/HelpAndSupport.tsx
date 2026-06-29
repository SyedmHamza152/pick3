import IconComp from "@/components/icon/IconComp";
export default function HelpAndSupport() {
    const faqs = [
        {
            q: 'How do I deposit?',
            a: 'Send money via JazzCash to 03072000904, take a screenshot, and upload it in the Deposit section.',
        },
        {
            q: 'How are winnings calculated?',
            a: 'Straight bets pay 400x your wager, Rumble bets pay 80x. PKR converts to SAR at the current rate.',
        },
        {
            q: 'When are results announced?',
            a: 'Results are announced daily. Check the Recent winners section for the latest results.',
        },
    ];

    return (
        <>
            <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm max-w-6xl">

                {/* ── CARD HEADER ── */}
                <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
                    Help &amp; Support
                </h2>
                <p className="text-[#7b7a95] text-sm mb-6 leading-relaxed">
                    Need assistance? Contact us via WhatsApp for quick support.
                </p>

                {/* ── WHATSAPP BUTTON LINK ACTION ── */}
                <div className="my-6">
                    <a
                        href="https://wa.me/923071909577"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-[14.5px] text-white bg-[#25D366] hover:bg-[#20ba59] shadow-[0_4px_14px_rgba(37,211,102,0.25)] hover:shadow-[0_6px_18px_rgba(37,211,102,0.4)] hover:-translate-y-[1px] transition-all cursor-pointer border-none no-underline"
                    >
                       <IconComp name="whatsapp" size={20} color="white" />
                        WhatsApp: 03071909577
                    </a>
                </div>

                {/* ── FREQUENTLY ASKED QUESTIONS ── */}
                <div className="mt-8 pt-6 border-t border-[#2a2a3a]/40 space-y-4">
                    <h3 className="font-space text-lg font-bold text-[#f1f0ff]">
                        Frequently Asked Questions
                    </h3>

                    <div className="space-y-4 pt-2">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-[#1e1e2a]/40 border border-[#2a2a3a] p-4 rounded-xl leading-relaxed">
                                <p className="text-[#f1f0ff] font-semibold text-sm mb-1.5">
                                    ❓ {faq.q}
                                </p>
                                <p className="text-[#7b7a95] text-xs">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
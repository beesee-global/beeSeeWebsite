/* =========================================================
   F A Q S — Enhanced Visuals + Scroll Animations
========================================================== */

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, MessageCircle, ChevronDown, BookOpen, X } from "lucide-react";

const data = [
  { id:1, title:"How do I connect my Smart Watch?", explanation:"Enable Bluetooth → open companion app → pair device.", device:"Smart Watch", category:"Connectivity" },
  { id:2, title:"How to reset my Laptop?", explanation:"Settings → System → Recovery → Reset PC (backup first).", device:"Laptop", category:"System" },
  { id:3, title:"Why is my Tablet slow?", explanation:"Clear cache, restart, remove unused apps or factory reset.", device:"Tablet", category:"Performance" },
  { id:4, title:"How do I cast my phone to my TV?", explanation:"TV must support mirroring OR use Chromecast/Fire Stick.", device:"Interactive Smart TV", category:"Connectivity" },
];

export default function FAQs() {

  const devices = ["All","Smart Watch","Laptop","Tablet","Interactive Smart TV","Charging Station","Kiosk Machine"];

  const [active,setActive] = useState<number|null>(null);
  const [search,setSearch] = useState("");
  const [device,setDevice] = useState("All");
  const [modal,setModal] = useState(false);

  const filtered = useMemo(()=>( 
    data.filter(f =>
      (device==="All"||f.device===device) &&
      f.title.toLowerCase().includes(search.toLowerCase())
    )
  ),[search,device]);

  // Scroll Fade Animation
  const refs = useRef<HTMLDivElement[]>([]);
  const [visible,setVisible] = useState<boolean[]>([]);

  useEffect(()=>{
    const obs = refs.current.map((el,i)=>{
      if(!el) return null;
      const ob = new IntersectionObserver(e=>{
        if(e[0].isIntersecting) setVisible(v=>{
          const arr=[...v]; arr[i]=true; return arr;
        });
      },{threshold:.25});
      ob.observe(el);
      return ob;
    });

    return ()=>obs.forEach(o=>o?.disconnect());
  },[filtered]);

  return(
    <section
      className="relative pt-32 md:pt-40 lg:pt-48 pb-36 md:pb-44 lg:pb-56 px-6 md:px-10 lg:px-12 overflow-hidden"
      style={{
        backgroundImage: "url('/live-background/randomBg2Gray.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* GOLD + BLACK FADE OVERLAY */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.85) 5%,
              rgba(0,0,0,0.55) 25%,
              rgba(0,0,0,0.25) 40%,
              rgba(0,0,0,0.08) 60%,
              rgba(0,0,0,0) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(253,204,0,0.35) 0%,
              rgba(253,204,0,0.25) 15%,
              rgba(253,204,0,0.15) 35%,
              rgba(253,204,0,0.08) 55%,
              rgba(253,204,0,0.03) 75%,
              rgba(253,204,0,0) 100%
            ),
            linear-gradient(
              to top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.85) 5%,
              rgba(0,0,0,0.55) 25%,
              rgba(0,0,0,0.25) 40%,
              rgba(0,0,0,0.08) 78%,
              rgba(0,0,0,0) 100%
            )
          `,
        }}
      />

      {/* CONTENT ABOVE OVERLAY */}
      <div className="relative z-10">

        {/* ================= TITLE ================= */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="bee-title-md text-[var(--beesee-gold)] drop-shadow-md">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="bee-body mt-4 opacity-90 max-w-xl mx-auto drop-shadow-sm">
            Discover answers to common inquiries about our products and services.
          </p>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="max-w-xl mx-auto mt-8 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7B897]/70 pointer-events-none"
          />
          <input
            placeholder="Search keyword, issue or device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              input-default w-full 
              pl-12 pr-4 py-3 text-sm
              !bg-black/40 !backdrop-blur-xl
              !border-[#C7B897]/50 focus:!border-[var(--beesee-gold)]
              text-white placeholder:text-[#C7B897]/60
            "
          />
        </div>

        {/* ================= FILTER TABS ================= */}
        <div className="flex gap-2 overflow-x-auto mt-10 justify-center hide-scrollbar">
          {devices.map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`px-4 py-2 rounded-full text-xs transition ${
                device === d
                  ? "bg-[var(--beesee-gold)] text-black font-bold shadow-md"
                  : "bg-[#111]/60 border border-[#FDCC00]/25 text-[#C7B897] hover:border-[#FDCC00]/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* ================= FAQ LIST ================= */}
        <div className="relative z-10 max-w-4xl mx-auto mt-16 space-y-6">
          {filtered.length === 0 && (
            <div className="text-center opacity-90">
              <BookOpen size={40} className="mx-auto mb-3 text-white/90" />
              <h3 className="bee-title-sm text-[var(--beesee-gold)] tracking-wide drop-shadow-sm">
                NO RESULTS FOUND
              </h3>
              <p className="bee-body text-sm mt-1 opacity-70 drop-shadow-sm">
                Try adjusting search or filters
              </p>
            </div>
          )}

          {filtered.map((f, i) => (
            <div key={f.id} ref={el => el && (refs.current[i]=el)}
              className={`
                transition-all duration-700 ease-out
                ${visible[i]?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}
              `}
            >
              <div
                className="beesee-card-content cursor-pointer !text-left hover:shadow-lg hover:scale-[1.02] transition-transform duration-300"
                onClick={() => setActive(active === f.id ? null : f.id)}
              >
                <h3 className="bee-title-sm text-white tracking-wide text-[20px] flex justify-between items-center drop-shadow-sm">
                  {f.title}
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      active === f.id
                        ? "rotate-180 text-[var(--beesee-gold)]"
                        : "text-[#C7B897]"
                    }`}
                  />
                </h3>

                <div className={`overflow-hidden transition-all duration-500 ${
                  active === f.id ? "max-h-64 pt-6" : "max-h-0"
                }`}>
                  <div className="bg-black/25 rounded-lg p-5 border border-[var(--beesee-gold)]/20">
                    <p className="bee-body text-[15px] leading-relaxed text-white/95 drop-shadow-sm">
                      {f.explanation}
                    </p>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--beesee-gold)]/10">
                      <span className="px-3 py-1 rounded-full bg-[var(--beesee-gold)]/15 text-[var(--beesee-gold)] text-xs font-medium">
                        {f.device}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs">
                        {f.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ASK QUESTION MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[99]">
          <div className="beesee-card-content max-w-md w-full p-8 relative">
            <button
              onClick={() => setModal(false)}
              className="absolute right-5 top-5 text-[#C7B897] hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="bee-title-sm text-[var(--beesee-gold)] text-center mb-4 drop-shadow-sm">
              ASK A QUESTION
            </h3>

            <div className="space-y-3">
              <input className="input-default" placeholder="Your Name" />
              <input className="input-default" placeholder="Your Email" />
              <textarea
                rows={4}
                className="input-default resize-none"
                placeholder="Enter your question..."
              />
              <button className="beesee-button mt-2">Submit</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setModal(true)}
        className="beesee-button beesee-button--small fixed bottom-10 right-10 z-[98] shadow-xl"
      >
        <MessageCircle size={18} /> Chat
      </button>

    </section>
  );
}

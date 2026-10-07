export default function HealthcareIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-[540px] aspect-[4/3] select-none ${className}`}>
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/60 via-blue-50/50 to-emerald-50/40 rounded-3xl -z-10" />

      {/* Main Electronic Health Record Card Screen */}
      <div className="absolute top-[10%] left-[8%] right-[8%] bottom-[8%] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Window Top Bar */}
        <div className="h-9 bg-slate-50 border-b border-slate-100 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[11px] font-medium text-slate-400 tracking-wide">
            EHR System • Health Bridge
          </div>
          <div className="w-10" />
        </div>

        {/* Dashboard Content */}
        <div className="p-4 grid grid-cols-12 gap-3 flex-1">
          {/* Left Sidebar icons */}
          <div className="col-span-2 bg-slate-50/80 rounded-xl p-2 flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
              </svg>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>

          {/* Center Health Records Preview */}
          <div className="col-span-10 flex flex-col gap-3">
            {/* Top Patient Bar */}
            <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-100/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  DR
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Patient Consultation Active
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Syncing live vitals & records
                  </div>
                </div>
              </div>
              {/* Heart Pulse mini badge */}
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-blue-200 text-[10px] font-semibold text-emerald-600 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                72 BPM
              </div>
            </div>

            {/* Vital Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Heart Rate</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Normal</div>
                <div className="h-1 w-full bg-emerald-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Lungs / SPO2</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">99%</div>
                <div className="h-1 w-full bg-blue-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 w-4/5 rounded-full" />
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Prescription</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Verified</div>
                <div className="h-1 w-full bg-cyan-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-cyan-500 w-full rounded-full" />
                </div>
              </div>
            </div>

            {/* Simulated Live ECG Waveform */}
            <div className="h-12 bg-slate-900 rounded-xl p-2 relative overflow-hidden flex items-center">
              <svg
                className="w-full h-8 text-emerald-400 stroke-current fill-none stroke-[2]"
                viewBox="0 0 300 40"
                preserveAspectRatio="none"
              >
                <path d="M0,20 L50,20 L60,10 L70,30 L80,5 L90,35 L100,20 L160,20 L170,8 L180,32 L190,4 L200,36 L210,20 L300,20" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Medical Shield Badge Top Right */}
      <div className="absolute top-2 right-4 bg-white/95 backdrop-blur shadow-lg border border-emerald-100 p-2.5 rounded-2xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
        </div>
        <div className="pr-1">
          <div className="text-[11px] font-bold text-slate-800">HIPAA Secure</div>
          <div className="text-[9px] text-slate-400">Encrypted Health Data</div>
        </div>
      </div>

      {/* Floating Doctor & Patient Status Bottom Left */}
      <div className="absolute bottom-2 left-4 bg-white/95 backdrop-blur shadow-lg border border-blue-100 p-2.5 rounded-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
        </div>
        <div className="pr-1">
          <div className="text-[11px] font-bold text-slate-800">Doctor & Patient Portal</div>
          <div className="text-[9px] text-slate-400">Seamless Appointments</div>
        </div>
      </div>
    </div>
  );
}

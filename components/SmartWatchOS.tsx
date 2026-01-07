
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Activity, Thermometer, Droplets, AlertTriangle, 
  Phone, BarChart3, MapPin, Ambulance, 
  Mic, ShieldAlert, Check, Users, Compass, Navigation, Sun, Smile, Meh, Frown
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Scene, Vitals, Alert } from '../types';
import { getHealthRiskAnalysis, getAshaGreeting } from '../services/geminiService';

interface SmartWatchOSProps {
  currentScene: Scene;
  vitals: Vitals;
  activeAlert: Alert | null;
  onScenarioSelect: (scenario: string) => void;
  setVitals: React.Dispatch<React.SetStateAction<Vitals>>;
  onEmergency: (reason?: string) => void;
  onCancelEmergency: () => void;
  onDismissAlert: () => void;
}

// --- Extracted Components ---

const StatusBar = ({ time }: { time: Date }) => (
  <div className="absolute top-0 w-full px-6 py-3 flex justify-between text-xs font-medium text-gray-400 z-40 pointer-events-none">
    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    <div className="flex gap-2">
      <Activity size={14} className="text-emerald-500" />
      <span>100%</span>
    </div>
  </div>
);

const AlertPopup = ({ alert, onDismiss }: { alert: Alert, onDismiss: () => void }) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (startX === null) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      setOffsetX(diff);
  };

  const handleTouchEnd = () => {
      if (Math.abs(offsetX) > 100) {
          onDismiss(); // Dismiss if dragged far enough
      } else {
          setOffsetX(0); // Reset if not
      }
      setStartX(null);
      setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setStartX(e.clientX);
      setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || startX === null) return;
      setOffsetX(e.clientX - startX);
  };

  const handleMouseUp = () => {
      if (Math.abs(offsetX) > 100) {
          onDismiss();
      } else {
          setOffsetX(0);
      }
      setStartX(null);
      setIsDragging(false);
  };

  return (
      <div 
          className={`absolute top-12 left-2 right-2 p-3 rounded-2xl z-50 shadow-2xl backdrop-blur-md border cursor-grab active:cursor-grabbing touch-none select-none ${
          alert.type === 'critical' ? 'bg-red-900/95 border-red-500' : 'bg-yellow-900/95 border-yellow-500'
          }`}
          style={{ 
              transform: `translateX(${offsetX}px)`, 
              opacity: 1 - Math.abs(offsetX) / 300,
              transition: isDragging ? 'none' : 'transform 0.3s, opacity 0.3s'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
      >
      <div className="flex items-start gap-3 pointer-events-none">
          {alert.type === 'critical' ? <AlertTriangle className="text-white animate-pulse" /> : <Activity className="text-yellow-200" />}
          <div>
          <h4 className="font-bold text-white text-sm uppercase">{alert.type === 'critical' ? 'Critical Alert' : 'Health Warning'}</h4>
          <p className="text-xs text-gray-100 mt-1 font-semibold">{alert.message}</p>
          {alert.subtext && <p className="text-[10px] text-gray-300 mt-1">{alert.subtext}</p>}
          </div>
      </div>
      <div className="absolute bottom-1 w-full left-0 flex justify-center opacity-30">
          <div className="w-12 h-1 bg-white rounded-full"></div>
      </div>
      </div>
  );
};

const Dashboard = ({ vitals }: { vitals: Vitals }) => (
  <div className="h-full pt-12 pb-20 px-4 flex flex-col gap-3 watch-scroll overflow-y-auto">
    <div className="text-center mb-1">
      <h2 className="text-emerald-400 text-xs font-bold tracking-widest uppercase">AllWays Care</h2>
    </div>

    {/* Heart Rate Card */}
    <button className="w-full bg-gray-900/80 p-3 rounded-2xl border border-gray-800 flex items-center justify-between active:scale-95 transition-transform group hover:border-gray-600">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/20 rounded-full group-hover:bg-red-500/30 transition-colors">
          <Heart size={20} className="text-red-500 animate-pulse" fill={vitals.heartRate > 100 ? "currentColor" : "none"} />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400">Heart Rate</p>
          <p className="text-xl font-bold font-mono-tech text-white">{vitals.heartRate} <span className="text-xs font-sans font-normal text-gray-500">BPM</span></p>
        </div>
      </div>
      <div className="h-[30px] w-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { v: vitals.heartRate - 5 }, { v: vitals.heartRate + 2 }, { v: vitals.heartRate }, { v: vitals.heartRate - 2 }, { v: vitals.heartRate + 5 }
          ]}>
             <Area type="monotone" dataKey="v" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>

    {/* BP & Sugar Grid */}
    <div className="grid grid-cols-2 gap-2">
      <button className="bg-gray-900/80 p-3 rounded-2xl border border-gray-800 text-left active:scale-95 transition-transform hover:border-gray-600">
         <p className="text-[10px] text-gray-400 flex items-center gap-1"><Activity size={10} /> BP</p>
         <p className={`text-lg font-bold font-mono-tech mt-1 ${vitals.bpSystolic > 140 ? 'text-orange-400' : 'text-white'}`}>
           {vitals.bpSystolic}/{vitals.bpDiastolic}
         </p>
      </button>
      <button className="bg-gray-900/80 p-3 rounded-2xl border border-gray-800 text-left active:scale-95 transition-transform hover:border-gray-600">
         <p className="text-[10px] text-gray-400 flex items-center gap-1"><Droplets size={10} /> Glucose</p>
         <p className={`text-lg font-bold font-mono-tech mt-1 ${vitals.glucose < 80 ? 'text-red-400' : 'text-white'}`}>
           {vitals.glucose}
         </p>
      </button>
    </div>

    {/* Stress */}
    <button className="w-full bg-gray-900/80 p-3 rounded-2xl border border-gray-800 text-left active:scale-95 transition-transform hover:border-gray-600">
      <div className="flex justify-between items-end mb-1">
        <p className="text-xs text-gray-400">Stress Level</p>
        <p className="text-sm font-bold text-white">{vitals.stress}/100</p>
      </div>
      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${vitals.stress > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
          style={{ width: `${vitals.stress}%` }}
        />
      </div>
    </button>
    
    <div className="text-center mt-2 opacity-50">
      <div className="w-1 h-1 bg-white rounded-full mx-auto mb-1"></div>
      <p className="text-[10px]">Scroll for more</p>
    </div>
  </div>
);

const ScenarioSelector = ({ onSelect }: { onSelect: (id: string) => void }) => (
  <div className="h-full pt-12 px-2 flex flex-col gap-2 overflow-y-auto pb-4">
    <h3 className="text-center text-sm font-semibold mb-2">Simulation Mode</h3>
    {[
      { id: 'morning_walk', icon: Activity, label: 'Morning Walk', color: 'bg-green-600' },
      { id: 'stress_event', icon: Thermometer, label: 'Stress Spike', color: 'bg-orange-600' },
      { id: 'low_sugar', icon: Droplets, label: 'Low Glucose', color: 'bg-purple-600' },
      { id: 'fall_event', icon: AlertTriangle, label: 'Hard Fall', color: 'bg-red-600' },
    ].map((s) => (
      <button 
        key={s.id}
        onClick={() => onSelect(s.id)}
        className="w-full p-3 bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all rounded-xl flex items-center gap-3 border border-gray-700 shrink-0"
      >
        <div className={`p-2 rounded-full ${s.color}`}>
          <s.icon size={18} className="text-white" />
        </div>
        <span className="font-medium text-sm">{s.label}</span>
      </button>
    ))}
  </div>
);

const MedicineReminder = () => (
  <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-900">
    <div className="w-full bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-lg text-center">
      <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Medicine Reminder</p>
      <img 
        src="https://picsum.photos/100/100?random=1" 
        alt="Pill" 
        className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-emerald-500 object-cover"
      />
      <h3 className="text-lg font-bold">Metformin</h3>
      <p className="text-gray-400 text-sm mb-4">500mg - Take with food</p>
      
      <div className="flex gap-2 w-full">
        <button className="flex-1 bg-gray-700 py-3 rounded-xl text-xs font-bold">Snooze</button>
        <button className="flex-1 bg-emerald-600 py-3 rounded-xl text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">TAKEN</button>
      </div>
    </div>
  </div>
);

const Analytics = ({ riskAnalysis }: { riskAnalysis: string }) => (
  <div className="h-full pt-12 px-4 pb-4 overflow-y-auto">
    <h3 className="text-center text-sm font-bold mb-4 flex items-center justify-center gap-2">
      <BarChart3 size={16} className="text-purple-400" /> 
      AI Prediction
    </h3>
    
    <div className="h-32 w-full mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[
           {name: 'M', hr: 72}, {name: 'T', hr: 75}, {name: 'W', hr: 71}, 
           {name: 'T', hr: 78}, {name: 'F', hr: 82}, {name: 'S', hr: 85}, {name: 'S', hr: 90}
        ]}>
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Area type="monotone" dataKey="hr" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
         <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold text-purple-300">INSIGHT GENERATED</span>
      </div>
      <p className="text-sm leading-snug text-gray-200">
        {riskAnalysis}
      </p>
    </div>
  </div>
);

const FallDetection = ({ onEmergency, onCancelEmergency, vitals }: { onEmergency: (reason: string) => void, onCancelEmergency: () => void, vitals: Vitals }) => {
  const [count, setCount] = useState(10);
  
  useEffect(() => {
      if(count === 0) { 
          onEmergency('Fall Verified - Auto Triggered'); 
          return;
      }
      const t = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(t);
  }, [count, onEmergency]);

  // Calculate progress for a ring SVG
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((10 - count) / 10) * circumference;

  return (
      <div className="h-full flex flex-col items-center justify-center bg-red-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
          
          <div className="z-10 flex flex-col items-center w-full px-4">
              <div className="mb-2 relative flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-red-900" />
                      <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-red-500 transition-all duration-1000 ease-linear" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={offset} 
                      />
                  </svg>
                  <span className="absolute text-2xl font-mono-tech font-bold text-white">{count}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-1 text-red-500 animate-bounce">
                  <AlertTriangle size={20} fill="currentColor" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Fall Detected</h2>
              
              {/* Vitals during fall */}
              <div className="flex gap-2 w-full mb-4 px-2">
                  <div className="flex-1 bg-red-900/40 p-2 rounded-lg border border-red-800 flex flex-col items-center">
                      <div className="flex items-center gap-1 mb-1">
                          <Heart size={10} className="text-red-400" />
                          <span className="text-[9px] text-red-300 uppercase font-bold">Heart Rate</span>
                      </div>
                      <span className="text-lg font-bold font-mono-tech text-white leading-none">{vitals.heartRate} <span className="text-[8px] font-sans font-normal text-red-200">BPM</span></span>
                  </div>
                  <div className="flex-1 bg-red-900/40 p-2 rounded-lg border border-red-800 flex flex-col items-center">
                      <div className="flex items-center gap-1 mb-1">
                          <Activity size={10} className="text-orange-400" />
                          <span className="text-[9px] text-orange-300 uppercase font-bold">Stress</span>
                      </div>
                      <span className="text-lg font-bold font-mono-tech text-white leading-none">{vitals.stress}%</span>
                  </div>
              </div>

              <p className="text-red-200 text-[10px] mb-4 text-center">Auto-alert in {count}s</p>
              
              <div className="flex gap-2 w-full">
                  <button 
                  onClick={onCancelEmergency}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold text-xs shadow-lg border border-gray-600"
                  >
                      I'M OK
                  </button>
                  <button 
                  onClick={() => onEmergency('Fall Verified - User Confirmed')}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-1 animate-pulse"
                  >
                      SOS NOW
                  </button>
              </div>
          </div>
      </div>
  );
};

const FamilyAlbum = () => (
  <div className="h-full pt-12 px-4 flex flex-col items-center">
      <h3 className="text-center text-xs font-bold uppercase text-emerald-300 mb-4 flex items-center gap-2">
          <Users size={14} /> Family Locket
      </h3>
      <div className="w-full aspect-square bg-gray-800 rounded-2xl overflow-hidden mb-3 relative border-2 border-gray-700 shadow-inner group">
          <img 
            src="https://picsum.photos/300/300?random=10" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            alt="Family" 
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white font-bold text-sm">Grandson (Ravi)</p>
              <p className="text-gray-300 text-[10px]">"Love you Dadi!"</p>
          </div>
      </div>
      <p className="text-center text-[10px] text-gray-500">Swipe for more photos</p>
      
      <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
      </div>
  </div>
);

const EmergencyMode = ({ onCancelEmergency }: { onCancelEmergency: () => void }) => {
  const [familyNotified, setFamilyNotified] = useState(false);
  
  useEffect(() => {
      // Simulate network delay for family notification
      const t = setTimeout(() => setFamilyNotified(true), 2500);
      return () => clearTimeout(t);
  }, []);

  return (
      <div className="h-full flex flex-col items-center justify-center bg-red-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-600/20 animate-pulse z-0"></div>
      <div className="z-10 text-center p-3 w-full">
          <ShieldAlert size={36} className="text-red-500 mx-auto mb-2 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-0.5">EMERGENCY</h2>
          <p className="text-red-200 text-xs mb-4">Help is on the way</p>
          
          <div className="bg-gray-900/80 p-2 rounded-xl border border-gray-700 w-full mb-2 flex items-center gap-3">
              <Ambulance className="text-red-400 shrink-0" size={20} />
              <div className="text-left w-full">
                  <p className="text-[10px] font-bold text-gray-200">Ambulance Dispatched</p>
                  <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-red-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
                  </div>
              </div>
          </div>

          <div className="bg-gray-900/80 p-2 rounded-xl border border-gray-700 w-full mb-4">
              <div className="flex items-start gap-3">
                  <Users className="text-blue-400 shrink-0 mt-1" size={18} />
                  <div className="text-left w-full">
                      <p className="text-[10px] font-bold text-gray-200 mb-1">Notifying Contacts</p>
                      <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>Son (Ravi)</span>
                              {familyNotified ? 
                                  <span className="text-green-400 flex items-center gap-0.5"><Check size={8} /> Sent</span> : 
                                  <span className="text-yellow-500 animate-pulse">Sending...</span>
                              }
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>Daughter (Priya)</span>
                              {familyNotified ? 
                                  <span className="text-green-400 flex items-center gap-0.5"><Check size={8} /> Sent</span> : 
                                  <span className="text-yellow-500 animate-pulse">Sending...</span>
                              }
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-[10px] text-gray-300">Sharing Live Location</span>
          </div>
          
          <button 
          onClick={onCancelEmergency}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-[10px] font-bold text-gray-400 border border-gray-700"
          >
          False Alarm (Hold)
          </button>
      </div>
      </div>
  );
};

const AshaConnect = ({ message }: { message: string }) => (
  <div className="h-full flex flex-col items-center justify-center bg-teal-950 p-4">
      <div className="w-20 h-20 rounded-full border-2 border-teal-500 overflow-hidden mb-4 relative">
           <img src="https://picsum.photos/100/100?random=2" className="w-full h-full object-cover" alt="ASHA" />
           <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
      </div>
      <h2 className="text-lg font-bold text-white">Priya (ASHA)</h2>
      <p className="text-teal-300 text-xs mb-6">Connected • Live Audio</p>
      
      <div className="bg-teal-900/50 p-4 rounded-xl border border-teal-700 w-full mb-6">
          <p className="text-sm italic text-teal-100 text-center">"{message}"</p>
      </div>

      <div className="flex gap-4">
          <button className="p-4 bg-red-600 rounded-full text-white shadow-lg active:scale-95 transition-transform">
              <Phone size={24} className="rotate-[135deg]" />
          </button>
           <button className="p-4 bg-gray-700 rounded-full text-white shadow-lg active:scale-95 transition-transform">
              <Mic size={24} />
          </button>
      </div>
  </div>
);

const NavigationMode = () => (
  <div className="h-full pt-12 px-4 flex flex-col items-center">
    <div className="text-center mb-6">
      <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
        <Compass size={14} /> Return Home
      </h3>
    </div>
    
    <div className="relative w-32 h-32 flex items-center justify-center mb-6">
      <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
      <div className="absolute top-0 w-2 h-2 bg-emerald-500 rounded-full"></div>
      <Navigation size={64} className="text-emerald-500 animate-[pulse_3s_ease-in-out_infinite]" fill="currentColor" />
    </div>

    <div className="text-center">
      <h2 className="text-3xl font-bold text-white font-mono-tech">120<span className="text-sm text-gray-500 font-sans ml-1">m</span></h2>
      <p className="text-gray-400 text-sm mt-1">Walk straight ahead</p>
    </div>

    <div className="mt-6 w-full bg-gray-900 rounded-xl p-3 border border-gray-800 flex items-center gap-3">
       <div className="bg-gray-800 p-2 rounded-lg"><MapPin size={16} className="text-emerald-400" /></div>
       <div className="text-left">
          <p className="text-[10px] text-gray-500">Destination</p>
          <p className="text-xs font-bold text-white">Sweet Home</p>
       </div>
    </div>
  </div>
);

const WellnessCheck = () => {
  const [checkedIn, setCheckedIn] = useState(false);

  if (checkedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-emerald-900/20">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <Check size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white text-center">Great!</h3>
        <p className="text-emerald-200 text-center text-sm mt-2">Family has been notified that you are feeling good.</p>
      </div>
    );
  }

  return (
    <div className="h-full pt-12 px-4 flex flex-col items-center">
      <Sun size={32} className="text-yellow-400 mb-2 animate-[spin_10s_linear_infinite]" />
      <h3 className="text-lg font-bold text-white text-center mb-1">Good Morning!</h3>
      <p className="text-gray-400 text-xs text-center mb-6">How are you feeling today?</p>

      <div className="w-full grid gap-3">
        <button 
          onClick={() => setCheckedIn(true)}
          className="bg-gray-800 hover:bg-emerald-900/30 border border-gray-700 hover:border-emerald-500 p-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400"><Smile size={20} /></div>
          <span className="font-bold text-sm">I'm feeling great</span>
        </button>
        
        <button 
          onClick={() => setCheckedIn(true)}
          className="bg-gray-800 hover:bg-yellow-900/30 border border-gray-700 hover:border-yellow-500 p-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400"><Meh size={20} /></div>
          <span className="font-bold text-sm">I'm okay</span>
        </button>

        <button 
          onClick={() => setCheckedIn(true)}
          className="bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500 p-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <div className="p-2 bg-red-500/20 rounded-full text-red-400"><Frown size={20} /></div>
          <span className="font-bold text-sm">Not good</span>
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---

const SmartWatchOS: React.FC<SmartWatchOSProps> = ({ 
  currentScene, 
  vitals, 
  activeAlert, 
  onScenarioSelect,
  setVitals,
  onEmergency,
  onCancelEmergency,
  onDismissAlert
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ashaMessage, setAshaMessage] = useState("Connecting...");
  const [riskAnalysis, setRiskAnalysis] = useState("Analyzing recent biometric patterns...");
  
  // SOS Button State
  const [sosProgress, setSosProgress] = useState(0);
  const pressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI content based on scene
  useEffect(() => {
    if (currentScene === Scene.ANALYTICS) {
      setRiskAnalysis("Analyzing biometric patterns...");
      getHealthRiskAnalysis(vitals).then(setRiskAnalysis);
    }
    if (currentScene === Scene.ASHA_CONNECT) {
      setAshaMessage("Connecting secure line...");
      getAshaGreeting(vitals).then(setAshaMessage);
    }
  }, [currentScene, vitals]);

  // SOS Logic
  const startSosPress = (e: React.SyntheticEvent) => {
    if (currentScene === Scene.EMERGENCY || currentScene === Scene.FALL_DETECTION) return;
    
    let progress = 0;
    setSosProgress(0);

    if (pressInterval.current) clearInterval(pressInterval.current);

    pressInterval.current = setInterval(() => {
      progress += 50; 
      const percent = (progress / 2000) * 100;
      setSosProgress(Math.min(percent, 100));

      if (progress >= 2000) {
        if (pressInterval.current) clearInterval(pressInterval.current);
        setSosProgress(0);
        onEmergency('SOS Manual Activation');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
      }
    }, 50);
  };

  const endSosPress = () => {
    if (pressInterval.current) {
      clearInterval(pressInterval.current);
      pressInterval.current = null;
    }
    setSosProgress(0);
  };

  return (
    <div className="w-full h-full relative font-sans">
      <StatusBar time={currentTime} />
      
      {/* Alert Overlay with Swipe Dismiss */}
      {activeAlert && (
         <AlertPopup alert={activeAlert} onDismiss={onDismissAlert} />
      )}

      {/* Persistent SOS Button */}
      {currentScene !== Scene.EMERGENCY && currentScene !== Scene.FALL_DETECTION && (
        <button
          className="absolute bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center active:scale-95 transition-transform overflow-hidden shadow-lg group"
          onTouchStart={startSosPress}
          onTouchEnd={endSosPress}
          onMouseDown={startSosPress}
          onMouseUp={endSosPress}
          onMouseLeave={endSosPress}
        >
            <div 
                className="absolute inset-0 bg-red-600 transition-all duration-75 ease-linear opacity-50"
                style={{ height: `${sosProgress}%`, bottom: 0, top: 'auto' }}
            />
            <span className="relative font-bold text-[10px] text-white z-10 font-mono">SOS</span>
            {sosProgress > 0 && <span className="absolute -top-3 text-[8px] font-bold text-red-300 w-max bg-black/80 px-1 rounded animate-pulse">HOLD</span>}
        </button>
      )}

      {/* Main Content Switcher */}
      <div className="h-full w-full">
        {currentScene === Scene.DASHBOARD && <Dashboard vitals={vitals} />}
        {currentScene === Scene.SCENARIOS && <ScenarioSelector onSelect={onScenarioSelect} />}
        {currentScene === Scene.MEDICINE && <MedicineReminder />}
        {currentScene === Scene.ANALYTICS && <Analytics riskAnalysis={riskAnalysis} />}
        {currentScene === Scene.FALL_DETECTION && <FallDetection onEmergency={onEmergency} onCancelEmergency={onCancelEmergency} vitals={vitals} />}
        {currentScene === Scene.FAMILY_ALBUM && <FamilyAlbum />}
        {currentScene === Scene.EMERGENCY && <EmergencyMode onCancelEmergency={onCancelEmergency} />}
        {currentScene === Scene.ASHA_CONNECT && <AshaConnect message={ashaMessage} />}
        {currentScene === Scene.NAVIGATION && <NavigationMode />}
        {currentScene === Scene.CHECK_IN && <WellnessCheck />}
      </div>
    </div>
  );
};

export default SmartWatchOS;

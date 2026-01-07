
import React, { useState, useEffect, useCallback } from 'react';
import { WatchFrame } from './components/WatchFrame';
import SmartWatchOS from './components/SmartWatchOS';
import { Scene, Vitals, Alert } from './types';
import { 
  Play, Activity, AlertTriangle, Pill, BarChart2, 
  Phone, Users, Navigation, Sun
} from 'lucide-react';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.DASHBOARD);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  
  // Initial State: "Normal" senior vitals
  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 78,
    bpSystolic: 132,
    bpDiastolic: 84,
    glucose: 105,
    steps: 1240,
    stress: 25
  });

  // --- Demo Logic ---

  // Simulate subtle live fluctuations (The "Real-time" effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => {
        // Don't fluctuate wildly if we are in specific scenarios
        const drift = (Math.random() - 0.5) * 4; 
        return {
          ...prev,
          heartRate: Math.round(prev.heartRate + (Math.random() - 0.5) * 2),
          // Keep BP somewhat stable unless triggered
          bpSystolic: Math.max(90, Math.min(200, prev.bpSystolic + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
          steps: prev.steps + (Math.random() > 0.5 ? 1 : 0),
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Scenario Triggers
  const triggerScenario = (scenarioId: string) => {
    setActiveAlert(null); // Clear previous alerts
    
    switch(scenarioId) {
      case 'morning_walk':
        setCurrentScene(Scene.DASHBOARD);
        // Animate HR up over time
        let step = 0;
        const walkInt = setInterval(() => {
          step++;
          setVitals(v => ({ ...v, heartRate: 78 + (step * 5), steps: v.steps + 20 }));
          if(step >= 5) {
            clearInterval(walkInt);
             setActiveAlert({
              id: 'walk',
              type: 'info',
              message: 'Activity Detected',
              subtext: 'Light Walking • Hydrate soon'
            });
          }
        }, 800);
        break;

      case 'stress_event':
        setCurrentScene(Scene.DASHBOARD);
        setVitals(v => ({ ...v, heartRate: 118, stress: 85 }));
        setTimeout(() => {
          setActiveAlert({
            id: 'stress',
            type: 'warning',
            message: 'Stress Spike Detected',
            subtext: 'Try breathing exercise'
          });
        }, 1000);
        break;

      case 'low_sugar':
        setCurrentScene(Scene.DASHBOARD);
        setVitals(v => ({ ...v, glucose: 72, stress: 60 }));
        setTimeout(() => {
          setActiveAlert({
            id: 'sugar',
            type: 'critical',
            message: 'Low Glucose Event',
            subtext: 'Consume fast sugar'
          });
        }, 1000);
        break;

      case 'fall_event':
        setCurrentScene(Scene.FALL_DETECTION);
        setVitals(v => ({ ...v, heartRate: 140, stress: 90 }));
        break;
        
      default:
        break;
    }
  };

  const triggerEmergency = (reason?: string) => {
    setCurrentScene(Scene.EMERGENCY);
    setVitals(v => ({ ...v, heartRate: 135, bpSystolic: 160, bpDiastolic: 100 }));
    setActiveAlert({
      id: 'emerg',
      type: 'critical',
      message: reason || 'Possible Hypertensive Episode',
      subtext: 'Notifying Caregivers...'
    });
  };

  const cancelEmergency = () => {
    setCurrentScene(Scene.DASHBOARD);
    setActiveAlert(null);
    setVitals(v => ({ ...v, heartRate: 85, bpSystolic: 135, stress: 40 }));
  }

  const dismissAlert = () => {
    setActiveAlert(null);
  }

  const menuItems = [
    { label: "Dashboard (Live)", scene: Scene.DASHBOARD, icon: Activity },
    { label: "Scenarios Menu", scene: Scene.SCENARIOS, icon: Play },
    { label: "Medicine Reminder", scene: Scene.MEDICINE, icon: Pill },
    { label: "Return Home", scene: Scene.NAVIGATION, icon: Navigation },
    { label: "Daily Check-in", scene: Scene.CHECK_IN, icon: Sun },
    { label: "Predictive Analytics", scene: Scene.ANALYTICS, icon: BarChart2 },
    { label: "Family Locket", scene: Scene.FAMILY_ALBUM, icon: Users },
    { label: "Simulate Fall", action: () => triggerScenario('fall_event'), icon: AlertTriangle, color: "text-orange-400" },
    { label: "Emergency Sim", action: () => triggerEmergency('Manual Panic Button'), icon: AlertTriangle, color: "text-red-400" },
    { label: "ASHA Connection", scene: Scene.ASHA_CONNECT, icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT: Presentation Controls */}
      <div className="w-full md:w-80 bg-gray-950 border-r border-gray-800 p-6 flex flex-col z-20 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AllWays Care
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Demo Control Center</p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
           {menuItems.map((item, idx) => (
             <button
               key={idx}
               onClick={() => {
                 if (item.action) item.action();
                 else if (item.scene) setCurrentScene(item.scene);
               }}
               className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                 // @ts-ignore
                 currentScene === item.scene 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' 
                  : 'bg-gray-900 hover:bg-gray-800 border border-gray-800'
               }`}
             >
               <item.icon size={18} className={item.color || ""} />
               {item.label}
               {/* @ts-ignore */}
               {currentScene === item.scene && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
             </button>
           ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
           <div className="text-[10px] font-mono text-gray-500 mb-2">LIVE VITALS DEBUG</div>
           <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
              <div>HR: {vitals.heartRate}</div>
              <div>BP: {vitals.bpSystolic}/{vitals.bpDiastolic}</div>
              <div>GLU: {vitals.glucose}</div>
              <div>STR: {vitals.stress}%</div>
           </div>
        </div>
      </div>

      {/* RIGHT: The Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black p-4 md:p-0">
        
        {/* Cinematic Backdrop Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-10 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
           <div className="absolute bottom-10 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        </div>

        {/* The Watch */}
        <div className="scale-75 md:scale-100 transition-transform duration-500">
          <WatchFrame>
            <SmartWatchOS 
              currentScene={currentScene} 
              vitals={vitals} 
              activeAlert={activeAlert}
              onScenarioSelect={triggerScenario}
              setVitals={setVitals}
              onEmergency={triggerEmergency}
              onCancelEmergency={cancelEmergency}
              onDismissAlert={dismissAlert}
            />
          </WatchFrame>
        </div>

        {/* On-screen quick hint */}
        <div className="absolute bottom-8 text-center opacity-50 text-xs text-gray-400 pointer-events-none">
           <p>Showing: {currentScene.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  );
};

export default App;

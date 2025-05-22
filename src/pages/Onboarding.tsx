
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingParticles from '../components/FloatingParticles';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const roles = ['Teacher', 'Administrator', 'Counselor'];
const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const scheduleTypes = ['Traditional', 'Block', 'Custom'];

const subjectsMap: Record<string, string[]> = {
  elementary: ['Math', 'Reading', 'Science', 'Social Studies', 'Art', 'PE'],
  middle: ['Math', 'ELA', 'Science', 'History', 'Art', 'Health'],
  high: ['Algebra I', 'Geometry', 'Biology', 'English I', 'World History', 'Chemistry', 'Physics']
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [schoolName, setSchoolName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [scheduleType, setScheduleType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step < 0 || step > 5) {
      setStep(0);
      setRole(null);
      setSelectedGrades([]);
      setSelectedSubjects([]);
      setSchoolName('');
      setDistrictName('');
      setScheduleType(null);
    }
  }, [step]);

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const getSuggestedSubjects = () => {
    const gradeNums = selectedGrades.map(g => parseInt(g)).filter(g => !isNaN(g));
    const min = Math.min(...gradeNums);
    if (min <= 5) return subjectsMap.elementary;
    if (min <= 8) return subjectsMap.middle;
    return subjectsMap.high;
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('User not found');

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      role,
      grades: selectedGrades,
      subjects: selectedSubjects,
      school_name: schoolName,
      district_name: districtName,
      schedule_type: scheduleType,
    });

    if (error) {
      alert('Failed to save profile: ' + error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 relative overflow-hidden">
      <FloatingParticles />
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-8 py-10 text-white relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">What is your role?</h2>
              <div className="flex flex-col gap-4">
                {roles.map(r => (
                  <button key={r} className={`w-full py-3 rounded-lg border text-lg font-medium transition ${role === r ? 'bg-blue-600 border-blue-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`} onClick={() => setRole(r)}>{r}</button>
                ))}
              </div>
              <div className="flex justify-end">
                <button disabled={!role} onClick={() => setStep(1)} className="mt-4 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white disabled:opacity-40">Next</button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Which grade(s) do you teach?</h2>
              <div className="grid grid-cols-4 gap-3">
                {grades.map(g => (
                  <button key={g} onClick={() => toggleGrade(g)} className={`py-2 rounded-lg border text-sm font-medium transition ${selectedGrades.includes(g) ? 'bg-blue-600 border-blue-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>{g}</button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="text-sm text-blue-300 hover:underline">Back</button>
                <button onClick={() => setStep(2)} disabled={selectedGrades.length === 0} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white disabled:opacity-40">Next</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Which subjects do you teach?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getSuggestedSubjects().map(subject => (
                  <button key={subject} onClick={() => toggleSubject(subject)} className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${selectedSubjects.includes(subject) ? 'bg-blue-600 border-blue-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>{subject}</button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-blue-300 hover:underline">Back</button>
                <button onClick={() => setStep(3)} disabled={selectedSubjects.length === 0} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white disabled:opacity-40">Next</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Tell us about your school</h2>
              <div className="space-y-4">
                <input type="text" placeholder="School Name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="District Name (optional)" value={districtName} onChange={(e) => setDistrictName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="text-sm text-blue-300 hover:underline">Back</button>
                <button onClick={() => setStep(4)} disabled={!schoolName.trim()} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white disabled:opacity-40">Next</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Which schedule type do you use?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scheduleTypes.map(type => (
                  <button key={type} onClick={() => setScheduleType(type)} className={`py-3 px-4 rounded-lg border text-center font-medium transition ${scheduleType === type ? 'bg-blue-600 border-blue-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>{type}</button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="text-sm text-blue-300 hover:underline">Back</button>
                <button onClick={() => setStep(5)} disabled={!scheduleType} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded text-white disabled:opacity-40">Finish</button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">You're all set!</h2>
              <p className="text-white/80">Welcome to PlanWise, {role} from {schoolName}.</p>
              <p className="text-white/60 text-sm">We'll use your setup to tailor your dashboard experience.</p>
              <button onClick={handleSubmit} className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white font-semibold">Go to Dashboard</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

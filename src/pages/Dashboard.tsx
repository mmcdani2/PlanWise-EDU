import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/planwise-logo.png';
import FloatingParticles from '../components/FloatingParticles';
import { supabase } from '../lib/supabase';
import { Home, Calendar, BookOpen, CheckCircle, LogOut, Menu, Users, ClipboardList, FileText } from 'lucide-react';
import StudentRosterEntryModal from "../components/Rosters/StudentRosterEntryModal";


const sampleTodos = [
    { id: 1, text: 'Submit lesson plan for Algebra I', priority: 'High' },
    { id: 2, text: 'Call parent about missing work', priority: 'Medium' },
    { id: 3, text: 'Update IEP for Jason T.', priority: 'Low' },
];

const sampleProgress = [
    { student: 'Ava Johnson', note: 'Struggling with linear equations' },
    { student: 'Ethan Brown', note: 'Improved quiz scores' },
    { student: 'Liam Smith', note: 'Missed 3 classes in a row' },
];

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout failed:', error.message);
        } else {
            setTimeout(() => navigate('/auth'), 100);
        }
    };

    const menuItems = [
        { label: 'Home', icon: <Home size={20} />, path: '/dashboard' },
        { label: 'Planner', icon: <Calendar size={20} />, path: '/planner' },
        { label: 'Lessons', icon: <BookOpen size={20} />, path: '/lessons' },
        { label: 'Goals', icon: <CheckCircle size={20} />, path: '/goals' },
        { label: 'Rosters', icon: <Users size={20} />, path: '/rosters' },
        { label: 'Accommodations', icon: <ClipboardList size={20} />, path: '/accommodations' },
        { label: 'Progress', icon: <FileText size={20} />, path: '/progress' },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white relative">
            <FloatingParticles />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            <aside
                className={`fixed z-40 md:static transform transition-transform duration-300 ease-in-out w-64 bg-white/5 border-r border-white/10 flex flex-col p-6 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="mb-8 flex justify-center">
                    <img src={logo} alt="PlanWise Logo" className="h-[3.5rem] w-auto" />
                </div>
                <nav className="flex flex-col gap-4">
                    {menuItems.map(item => (
                        <SidebarItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                        />
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-white/10">
                    <SidebarItem icon={<LogOut size={20} />} label="Log Out" onClick={handleLogout} />
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-8 relative z-10 w-full">
                <button onClick={() => setSidebarOpen(prev => !prev)} className="md:hidden mb-4 text-white hover:text-blue-400">
                    <Menu size={28} />
                </button>

                <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
                <p className="text-white/70">Welcome to your planning workspace.</p>

                <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div
                        onClick={() => navigate('/planner')}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                        <h3 className="text-lg font-semibold mb-3">📅 Planner Snapshot</h3>
                        <p className="text-sm text-white/70">Today's schedule appears here soon.</p>
                    </div>

                    <div
                        onClick={() => navigate('/goals')}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                        <h3 className="text-lg font-semibold mb-3">✅ To-Do Snapshot</h3>
                        <ul className="text-sm space-y-1">
                            {sampleTodos.map(todo => (
                                <li key={todo.id} className="flex justify-between">
                                    <span>{todo.text}</span>
                                    <span className="text-xs text-blue-400">{todo.priority}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-blue-300 hover:underline mt-2">View All</p>
                    </div>

                    <div
                        onClick={() => navigate('/progress')}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                        <h3 className="text-lg font-semibold mb-3">📊 Progress Summaries</h3>
                        <ul className="text-sm space-y-1">
                            {sampleProgress.map((entry, idx) => (
                                <li key={idx}>
                                    <strong>{entry.student}</strong>: {entry.note}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-blue-300 hover:underline mt-2">View Full Report</p>
                    </div>

                    <div
                        onClick={() => setShowRosterModal(true)}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                        <h3 className="text-lg font-semibold mb-2">👥 Student Rosters</h3>
                        <p className="text-sm text-white/70">Import or manage your class rosters.</p>
                    </div>

                    <div
                        onClick={() => navigate('/accommodations')}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition"
                    >
                        <h3 className="text-lg font-semibold mb-2">🛠 Accommodations Tracker</h3>
                        <p className="text-sm text-white/70">Track and log IEP/504/BIP implementation.</p>
                    </div>
                </div>

                <StudentRosterEntryModal
                    open={showRosterModal}
                    onClose={() => setShowRosterModal(false)}
                />
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, onClick, active }: { icon: JSX.Element; label: string; onClick: () => void; active?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${active ? 'bg-blue-600 border-blue-400 border' : 'hover:bg-white/10'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

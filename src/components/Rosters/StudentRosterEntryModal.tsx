import { useState, useEffect } from "react"
import Papa from "papaparse"
import { supabase } from "../../lib/supabase"
import Toast from "../ui/Toast"
import { accommodationsData, getPlanNames, getCategoriesForPlan } from "../data/accommodationsData";


export default function StudentRosterEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [scheduleType, setScheduleType] = useState<string | null>(null)
    const [customPeriods, setCustomPeriods] = useState<string[]>([])
    const [toastMessage, setToastMessage] = useState<string>("")
    const [showInstructions, setShowInstructions] = useState(false);
    const [activePeriods, setActivePeriods] = useState<string[]>([]);
    const [viewingPeriod, setViewingPeriod] = useState<string | null>(null);
    const [rosterForPeriod, setRosterForPeriod] = useState<any[]>([]);
    const [accomStudent, setAccomStudent] = useState<any | null>(null);
    const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState<string>("");
    const [customPlan, setCustomPlan] = useState<string>("");
    const [customCategory, setCustomCategory] = useState<string>("");


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setSelectedFile(file)
            parseCSV(file)
        }
    }

    const handleAddCustom = () => {
        if (customInput.trim() && customPlan && customCategory) {
            setSelectedAccommodations((prev) => [...prev, customInput.trim()]);
            setCustomInput("");
        }
    };


    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<any>) => {
                setParsedData(results.data as any[])
            },
        })
    }

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]
            setSelectedFile(file)
            parseCSV(file)
            e.dataTransfer.clearData()
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
    }

    const handleOpenPeriodRoster = async (period: string) => {
        setViewingPeriod(period);
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from("students")
            .select("first_name, last_name, student_id, accommodations, period")
            .eq("teacher_id", userData?.user?.id)
            .eq("period", period);

        if (error) {
            console.error("Error fetching roster:", error.message);
            setRosterForPeriod([]);
        } else {
            const sorted = [...data].sort((a, b) => a.last_name.localeCompare(b.last_name));
            setRosterForPeriod(sorted);
        }
    };

    const handleSaveAccommodations = async () => {
        if (!accomStudent) return;

        const updated = rosterForPeriod.map((s) =>
            s.student_id === accomStudent.student_id
                ? { ...s, accommodations: selectedAccommodations }
                : s
        );
        setRosterForPeriod(updated);

        await supabase
            .from("students")
            .update({ accommodations: selectedAccommodations })
            .eq("student_id", accomStudent.student_id);

        await handleOpenPeriodRoster(accomStudent.period);
        if (error) {
        setToastMessage("❌ Failed to save accommodations.");
      } else {
        setToastMessage("✅ Accommodations saved successfully.");
      }
      setTimeout(() => setToastMessage(""), 3000);
      setAccomStudent(null);
    };

    const getPeriods = () => {
        if (scheduleType === "Block") {
            return ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", ...customPeriods]
        }
        if (scheduleType === "Traditional") {
            return ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", ...customPeriods]
        }
        return customPeriods
    }

    const addCustomPeriod = () => {
        const label = prompt("Enter a period name (e.g., T1 or Seminar)")?.trim()
        if (label && !getPeriods().includes(label)) {
            setCustomPeriods([...customPeriods, label])
        }
    }

    const handleSaveToSupabase = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData?.user?.id) {
            setToastMessage("❌ User session error. Please log in again.")
            setTimeout(() => setToastMessage(""), 3000)
            return
        }

        const teacherId = userData.user.id

        const formattedStudents = parsedData.map((row) => ({
            teacher_id: teacherId,
            student_id: String(row["Student ID"] || row["student_id"]),
            first_name: String(row["First Name"] || row["first_name"]),
            last_name: String(row["Last Name"] || row["last_name"]),
            period: String(row["Class Period"] || row["class_period"] || "Unassigned"),
            email: ""
        }))

        const { error } = await supabase.from("students").insert(formattedStudents)
        if (error) {
            setToastMessage("❌ Error saving students: " + error.message)
        } else {
            setToastMessage("✅ Successfully saved student roster!")
            setParsedData([])
            setSelectedFile(null)
            await fetchActivePeriods();
        }
        setTimeout(() => setToastMessage(""), 3000)
    }

    const fetchActivePeriods = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) return;

        const { data, error } = await supabase
            .from("students")
            .select("period")
            .eq("teacher_id", userData.user.id);

        if (error) {
            console.error("Error fetching periods:", error.message);
        } else {
            const unique = [...new Set(data.map((s) => s.period))];
            setActivePeriods(unique);
        }
    };

    useEffect(() => {
        fetchActivePeriods();
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-gray-900 text-gray-50 rounded-2xl shadow-2xl border border-gray-800 p-6 relative">
                {toastMessage && <Toast message={toastMessage} type={toastMessage.startsWith("âŒ") ? "error" : "success"} />}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage Student Rosters</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                {!scheduleType ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
                        <p className="text-white/80 mb-4">&#128197; You haven't set up your schedule yet.</p>
                        <p className="text-sm mb-4">Select your schedule type to get started.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setScheduleType("Traditional")} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">Traditional</button>
                            <button onClick={() => setScheduleType("Block")} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">Block</button>
                            <button onClick={() => setScheduleType("Custom")} className="bg-white/10 border border-gray-500 px-4 py-2 rounded text-white text-sm">Custom</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 mt-2">
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <p className="mb-2 text-sm font-semibold">Upload a CSV file</p>
                            <label
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="block cursor-pointer text-center py-8 border-2 border-dashed border-gray-600 rounded-xl bg-gray-900 hover:border-blue-500"
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {selectedFile ? selectedFile.name : "Drag and drop a CSV here or click to upload"}
                            </label>
                            <a href="/csv-template.csv" download className="text-blue-500 text-sm mt-2 inline-block">Download template</a>
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowInstructions(!showInstructions)}
                                    className="text-blue-400 text-sm hover:underline"
                                >
                                    {showInstructions ? "Hide Instructions" : "How to Use the Template"}
                                </button>

                                {showInstructions && (
                                    <div className="mt-2 text-sm text-white/80 bg-gray-800 border border-gray-700 rounded-lg p-4">
                                        <h3 className="text-base font-semibold mb-1">ðŸ§© How to Use the Template</h3>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Click <strong>Download Template</strong> to get a blank CSV file.</li>
                                            <li>Open the file using <strong>Excel</strong> or <strong>Google Sheets</strong>.</li>
                                            <li>Fill in each row with your studentsâ€™ info:
                                                <ul className="list-disc list-inside ml-5">
                                                    <li><code>Class Period</code>: e.g., A1, B3, 1st, etc.</li>
                                                    <li><code>Student ID</code>: as listed in your SIS</li>
                                                    <li><code>First Name</code> and <code>Last Name</code></li>
                                                </ul>
                                            </li>
                                            <li>Do not delete or rename the column headers.</li>
                                            <li>When finished, click <strong>File â†’ Download â†’ .CSV</strong>.</li>
                                            <li>Then upload the file using the box above.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleSaveToSupabase}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm rounded text-white"
                                >
                                    Save to Supabase
                                </button>
                            </div>

                            {parsedData.length > 0 && (
                                <div className="mt-4 text-sm max-h-40 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                {Object.keys(parsedData[0]).map((key) => (
                                                    <th key={key} className="pr-4 pb-1 border-b border-gray-600">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, colIdx) => (
                                                        <td key={colIdx} className="pr-4 py-1 border-b border-gray-700">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="mt-2 text-xs text-gray-400">
                                        Showing {Math.min(parsedData.length, 10)} of {parsedData.length} students
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold">Class Periods</p>
                                <button onClick={addCustomPeriod} className="text-blue-400 text-sm hover:underline">+ Add Period</button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {getPeriods().map(period => {
                                    const isActive = activePeriods.includes(period);
                                    return (
                                        <button
                                            key={period}
                                            onClick={() => isActive && handleOpenPeriodRoster(period)}
                                            className={`px-4 py-2 rounded-lg border border-gray-600 text-white text-sm transition 
                          ${isActive ? "bg-white/10 hover:bg-blue-600" : "bg-gray-700 opacity-40 cursor-not-allowed"}`}
                                            disabled={!isActive}
                                        >
                                            {period}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {viewingPeriod && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700 text-white max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Students in {viewingPeriod}</h3>
                            <button onClick={() => setViewingPeriod(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        {rosterForPeriod.length > 0 ? (
                            <ul className="space-y-4 text-sm">
                                {rosterForPeriod.map((student) => (
                                    <li key={student.student_id} className="border-b border-gray-700 pb-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{student.last_name}, {student.first_name} <span className="text-white/50">({student.student_id})</span></span>
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                <label><input type="checkbox" className="mr-1" /> IEP</label>
                                                <label><input type="checkbox" className="mr-1" /> 504</label>
                                                <label><input type="checkbox" className="mr-1" /> BIP</label>
                                                <label><input type="checkbox" className="mr-1" /> ELL</label>
                                            </div>
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => {
                                                        setAccomStudent(student);
                                                        setSelectedAccommodations(student.accommodations ?? []);
                                                    }}
                                                    className="text-blue-400 text-sm hover:underline"
                                                >
                                                    + Manage Accommodations
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">No students found.</p>
                        )}
                    </div>
                </div>
            )}


            {accomStudent && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-5xl border border-gray-700 text-white overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Accommodations for {accomStudent.last_name}, {accomStudent.first_name}</h3>
                            <button onClick={() => setAccomStudent(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-6">
                            {accommodationsData.map(plan => (
                                <div key={plan.plan}>
                                    <h2 className="text-xl font-semibold text-blue-400 mb-2">{plan.plan}</h2>
                                    {plan.categories.map(category => (
                                        <div key={category.name} className="mb-4">
                                            <h4 className="font-medium mb-1 text-gray-300">{category.name}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {category.items.map(item => (
                                                    <button key={item} onClick={() =>
                                                        setSelectedAccommodations(prev =>
                                                            prev.includes(item)
                                                                ? prev.filter(i => i !== item)
                                                                : [...prev, item]
                                                        )
                                                    } className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 ${selectedAccommodations.includes(item)
                                                        ? 'bg-purple-600 text-white border-purple-800'
                                                        : 'bg-gray-800 text-gray-200 border-gray-600'
                                                        }`}>{item}</button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-white/80">➕ Add a Custom Accommodation</p>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs mb-1 text-white/60">Plan Type (504, IEP, etc.)</label>
                                        <select
                                            value={customPlan}
                                            onChange={(e) => {
                                                setCustomPlan(e.target.value);
                                                setCustomCategory("");
                                            }}
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                                        >
                                            <option value="">Select Plan</option>
                                            {getPlanNames().map((plan) => (
                                                <option key={plan} value={plan}>{plan}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-xs mb-1 text-white/60">Accommodation Category</label>
                                        <select
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            disabled={!customPlan}
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                                        >
                                            <option value="">Select Category</option>
                                            {customPlan && getCategoriesForPlan(customPlan).map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {customPlan && customCategory && (
                                    <div className="mt-2">
                                        <label className="block text-xs mb-1 text-white/60">Accommodation Description</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customInput}
                                                onChange={(e) => setCustomInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                                                placeholder="Type and press Enter..."
                                            />
                                            <button
                                                onClick={handleAddCustom}
                                                className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="mt-6 flex justify-end">
                                <button onClick={handleSaveAccommodations} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

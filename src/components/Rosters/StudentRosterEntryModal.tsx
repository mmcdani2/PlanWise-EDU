import { useState } from "react"
import Papa from "papaparse"

export default function StudentRosterEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setSelectedFile(file)
            parseCSV(file)
        }
    }

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

    const handleOpenPeriodRoster = (period: string) => {
        console.log("Open roster for:", period)
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-gray-900 text-gray-50 rounded-2xl shadow-2xl border border-gray-800 p-6 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage Student Rosters</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-2">
                    {/* CSV Upload Section */}
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
                                                    <td key={colIdx}>{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Class Period Buttons */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <p className="mb-2 text-sm font-semibold">Or select a class period</p>
                        <div className="flex flex-wrap gap-2">
                            {["A1", "A2", "A3", "B1", "B2", "B3"].map(period => (
                                <button
                                    key={period}
                                    onClick={() => handleOpenPeriodRoster(period)}
                                    className="px-4 py-2 rounded-lg border border-gray-600 bg-white/10 hover:bg-blue-600 text-white text-sm transition"
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

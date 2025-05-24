import { motion, AnimatePresence } from "framer-motion"

export type ToastType = "success" | "error" | "info"

export default function Toast({
    message,
    type = "info"
}: {
    message: string
    type?: ToastType
}) {
    const base = "fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50"
    const colors = {
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-blue-600 text-white"
    }

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    key="toast"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`${base} ${colors[type]}`}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

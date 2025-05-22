import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAgree }) => {
  const [view, setView] = useState<'terms' | 'privacy'>('terms');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 max-w-2xl w-full rounded-xl shadow-lg relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {view === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </h2>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 text-sm leading-relaxed space-y-3">
              {view === 'terms' ? (
                <>
                  <p>Welcome to PlanWise EDU. By using our service, you agree to the following:</p>
                  <ul className="list-disc list-inside">
                    <li>You won’t share your account with others.</li>
                    <li>Your data may be stored securely via Supabase.</li>
                    <li>You’ll use the app respectfully and lawfully.</li>
                    <li>Terms may change without notice and continued use implies consent.</li>
                  </ul>
                  <p>If you do not agree, you must discontinue use.</p>
                </>
              ) : (
                <>
                  <p>Your privacy matters. This policy outlines how we collect and use your data:</p>
                  <ul className="list-disc list-inside">
                    <li>We collect only what's needed to personalize your experience.</li>
                    <li>We do not sell your data or use it for advertising.</li>
                    <li>All data is encrypted and stored securely via Supabase.</li>
                    <li>You can request deletion of your account and data at any time.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-x-4 text-sm">
                <button
                  className={`hover:underline ${
                    view === 'terms' ? 'font-semibold text-blue-500' : ''
                  }`}
                  onClick={() => setView('terms')}
                >
                  Terms
                </button>
                <button
                  className={`hover:underline ${
                    view === 'privacy' ? 'font-semibold text-blue-500' : ''
                  }`}
                  onClick={() => setView('privacy')}
                >
                  Privacy
                </button>
              </div>
              <div className="space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onAgree();
                    onClose();
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Agree
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;

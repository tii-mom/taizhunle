/**
 * 玻璃悬浮创建按钮
 */
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateFloatingGlass() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 rounded-2xl border border-amber-400/20 bg-gray-900/95 backdrop-blur-md shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-400">创建预测</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/create');
            }}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3 font-semibold text-gray-900 shadow-lg transition-all hover:shadow-amber-400/20 active:scale-95"
          >
            开始创建
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-24 right-6 z-40 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-400 to-orange-400 p-4 shadow-2xl transition-all hover:scale-110 active:scale-95"
    >
      <Plus size={24} className="text-gray-900" />
    </button>
  );
}

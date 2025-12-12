import { useState } from 'react';
import { Building2, Sparkles } from 'lucide-react';

interface BusinessNameStepProps {
  initialValue: string;
  onNext: (businessName: string) => void;
}

export default function BusinessNameStep({ initialValue, onNext }: BusinessNameStepProps) {
  const [businessName, setBusinessName] = useState(initialValue);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      setError('الرجاء إدخال اسم المؤسسة');
      return;
    }

    if (businessName.trim().length < 2) {
      setError('اسم المؤسسة يجب أن يكون حرفين على الأقل');
      return;
    }

    if (businessName.trim().length > 50) {
      setError('اسم المؤسسة يجب ألا يتجاوز 50 حرفاً');
      return;
    }

    onNext(businessName.trim());
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" fill="currentColor" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          مرحباً بك في كرزون
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          رحلتك القادمة نحو المستقبل تبدأ من هذه الخطوة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-900">
            اسم المؤسسة/النشاط
          </label>
          <div className="relative group">
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setError('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="أدخل اسم مؤسستك"
              dir="rtl"
              maxLength={50}
              className={`w-full pr-5 pl-12 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                error
                  ? 'border-red-300 focus:border-red-500'
                  : isFocused
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              autoFocus
            />
            {businessName && !error && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          <p className="text-sm text-gray-500">
            هذا سيكون اسم مساحة العمل الخاصة بك ولا يمكن تغييره لاحقاً
          </p>
        </div>

        <button
          type="submit"
          className="group relative w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
        >
          <span className="flex items-center justify-center gap-2">
            متابعة
            <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500">
          موثوق به من قبل أكثر من 10,000 شركة حول العالم
        </p>
      </div>
    </div>
  );
}

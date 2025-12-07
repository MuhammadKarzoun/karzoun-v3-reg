import { useState, useEffect } from 'react';
import { Globe, ArrowLeft, CheckCircle, XCircle, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { octobotsApiService } from '../../services/octobotsApiService';

interface SubdomainStepProps {
  initialValue: string;
  businessName: string;
  onComplete: (subdomain: string) => void;
  onBack: () => void;
}

export default function SubdomainStep({
  initialValue,
  businessName,
  onComplete,
  onBack,
}: SubdomainStepProps) {
  const [subdomain, setSubdomain] = useState(initialValue || generateSubdomain(businessName));
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (subdomain && isValidSubdomain(subdomain)) {
        checkAvailability(subdomain);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [subdomain]);

  function generateSubdomain(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
  }

  function isValidSubdomain(value: string): boolean {
    const re = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return re.test(value) && value.length >= 3 && value.length <= 30;
  }

  const checkAvailability = async (value: string) => {
    setChecking(true);
    setAvailable(null);
    setError('');
    setSuggestions([]);

    try {
      const response = await octobotsApiService.checkSubdomain(value);
      setAvailable(response.data.available);
      if (!response.data.available && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (err) {
      setError('فشل في التحقق من التوفر');
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(cleaned);
    setAvailable(null);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subdomain) {
      setError('يرجى إدخال اسم نطاق فرعي');
      return;
    }

    if (!isValidSubdomain(subdomain)) {
      setError('يجب أن يتكون اسم النطاق الفرعي من 3-30 حرفاً، ويحتوي فقط على أحرف صغيرة وأرقام وشرطات');
      return;
    }

    if (available === false) {
      setError('هذا النطاق الفرعي غير متاح');
      return;
    }

    if (available === true) {
      onComplete(subdomain);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-6">
          <Globe className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          اختر عنوان URL لمساحة عملك
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          سيكون هذا عنوان مساحة عملك الفريد
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label htmlFor="subdomain" className="block text-sm font-medium text-gray-900">
            النطاق الفرعي لمساحة العمل
          </label>
          <div className="relative">
            <input
              type="text"
              id="subdomain"
              value={subdomain}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="your-workspace"
              dir="ltr"
              className={`w-full px-5 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 pr-12 ${
                error
                  ? 'border-red-300 focus:border-red-500'
                  : isFocused
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {checking ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : available === true ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : available === false ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1.5">
                  ستكون مساحة عملك متاحة على:
                </p>
                <p className="text-lg font-bold text-blue-700 break-all font-mono">
                  {subdomain || 'your-workspace'}.staging.karzoun.chat
                </p>
              </div>
            </div>
          </div>

          {available === true && (
            <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">ممتاز! مساحة العمل هذه متاحة</span>
            </div>
          )}

          {available === false && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">مساحة العمل هذه مأخوذة بالفعل</span>
              </div>
              {suggestions.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-100">
                  <div className="flex items-start gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm font-semibold text-gray-900">جرِّب أحد هذه البدائل المتاحة:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleChange(suggestion)}
                        className="px-3 py-2 text-sm font-medium text-amber-900 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors duration-150"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          <p className="text-sm text-gray-500">
            استخدم من 3 إلى 30 حرفاً: أحرف صغيرة وأرقام وشرطات فقط. يجب أن يبدأ وينتهي بحرف أو رقم.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200"
          >
            رجوع
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
          <button
            type="submit"
            disabled={!available || checking}
            className="group flex-1 bg-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              إكمال الإعداد
            </span>
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500">
          أنت على بعد خطوة واحدة من إطلاق مساحة عملك
        </p>
      </div>
    </div>
  );
}

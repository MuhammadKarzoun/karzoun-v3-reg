import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, ArrowLeft, RotateCw, Shield } from 'lucide-react';
import { octobotsApiService } from '../../services/octobotsApiService';

interface VerificationStepProps {
  type: 'email' | 'phone';
  value: string;
  onNext: () => void;
  onBack: () => void;
  skipInitialSend?: boolean;
}
 
const CODE_LENGTH = 4;

export default function VerificationStep({
  type,
  value,
  onNext,
  onBack,
  skipInitialSend = false,
}: VerificationStepProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentInitialCode = useRef(false);

  const cleanIdentifier = type === 'phone' ? value.replace(/\s+/g, '') : value;

  const Icon = type === 'email' ? Mail : Phone;
  const title = type === 'email' ? 'تحقق من بريدك الإلكتروني' : 'تحقق من رقم هاتفك';
  const description =
    type === 'email'
      ? `أرسلنا رمزاً مكوناً من ${CODE_LENGTH} أرقام إلى`
      : `أرسلنا رمزاً مكوناً من ${CODE_LENGTH} أرقام إلى`;

  useEffect(() => {
    if (!hasSentInitialCode.current && !skipInitialSend) {
      hasSentInitialCode.current = true;
      sendInitialCode();
    }
  }, [skipInitialSend]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendInitialCode = async () => {
    try {
      await octobotsApiService.requestVerification(cleanIdentifier, type);
    } catch (err) {
      setError('فشل في إرسال رمز التحقق');
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await octobotsApiService.requestVerification(cleanIdentifier, type);
      setResendTimer(60);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('فشل في إعادة إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    // move to next input if not last
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // auto-verify when all digits filled
    if (
      newCode.every((digit) => digit !== '') &&
      newCode.join('').length === CODE_LENGTH
    ) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH);

    const newCode = pastedData
      .split('')
      .concat(Array(CODE_LENGTH - pastedData.length).fill(''));

    setCode(newCode);

    if (pastedData.length === CODE_LENGTH) {
      verifyCode(pastedData);
    } else if (pastedData.length > 0) {
      inputRefs.current[pastedData.length]?.focus();
    } else {
      inputRefs.current[0]?.focus();
    }
  };

  const verifyCode = async (codeString: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await octobotsApiService.verifyCode(codeString, cleanIdentifier, type);

      if (response.success) {
        setTimeout(() => {
          onNext();
        }, 500);
      } else {
        setError('رمز غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const errorData = err?.response?.data || err?.data;
      if (errorData?.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setError(errorData.error.message);
      } else {
        setError('فشل التحقق. يرجى المحاولة مرة أخرى.');
      }
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-6">
          <Icon className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-600 mb-2">{description}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4 text-center">
            أدخل الرمز المكون من {CODE_LENGTH} أرقام
          </label>
          <div className="flex gap-3 justify-center mb-6" dir="ltr" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                dir="ltr"
                className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-white outline-none transition-all duration-200 ${
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : digit
                    ? 'border-blue-600 text-gray-900'
                    : 'border-gray-200 text-gray-900 focus:border-blue-600'
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-sm text-red-800 text-center font-medium">{error}</p>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <RotateCw className="w-4 h-4" />
              {resendTimer > 0
                ? `إعادة إرسال الرمز بعد ${resendTimer}ث`
                : 'إعادة إرسال الرمز'}
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            رجوع
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => verifyCode(code.join(''))}
            disabled={!isCodeComplete || loading}
            className="group flex-1 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              {!loading && (
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
              {loading ? 'جاري التحقق...' : 'تحقق'}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>بياناتك مشفرة وآمنة</span>
        </div>
      </div>
    </div>
  );
}
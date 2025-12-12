import { useState, useEffect } from 'react';
import { User, Mail, Phone, ArrowLeft, ChevronDown } from 'lucide-react';

interface UserDetailsStepProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onNext: (data: { firstName: string; lastName: string; email: string; phone: string }) => void;
  onBack: () => void;
  serverErrors?: Record<string, string>;
}

const COUNTRIES = [
  { code: '+966', name: 'السعودية', flag: '🇸🇦', format: 'XX XXX XXXX' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪', format: 'XX XXX XXXX' },
  { code: '+20', name: 'مصر', flag: '🇪🇬', format: 'XXX XXX XXXX' },
  { code: '+962', name: 'الأردن', flag: '🇯🇴', format: 'X XXXX XXXX' },
  { code: '+965', name: 'الكويت', flag: '🇰🇼', format: 'XXXX XXXX' },
  { code: '+973', name: 'البحرين', flag: '🇧🇭', format: 'XXXX XXXX' },
  { code: '+968', name: 'عُمان', flag: '🇴🇲', format: 'XXXX XXXX' },
  { code: '+974', name: 'قطر', flag: '🇶🇦', format: 'XXXX XXXX' },
  { code: '+961', name: 'لبنان', flag: '🇱🇧', format: 'XX XXX XXX' },
  { code: '+963', name: 'سوريا', flag: '🇸🇾', format: 'XXX XXX XXX' },
  { code: '+964', name: 'العراق', flag: '🇮🇶', format: 'XXX XXX XXXX' },
  { code: '+967', name: 'اليمن', flag: '🇾🇪', format: 'XXX XXX XXX' },
  { code: '+218', name: 'ليبيا', flag: '🇱🇾', format: 'XX XXX XXXX' },
  { code: '+216', name: 'تونس', flag: '🇹🇳', format: 'XX XXX XXX' },
  { code: '+213', name: 'الجزائر', flag: '🇩🇿', format: 'XXX XX XX XX' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦', format: 'XXX XXX XXX' },
  { code: '+249', name: 'السودان', flag: '🇸🇩', format: 'XX XXX XXXX' },
  { code: '+970', name: 'فلسطين', flag: '🇵🇸', format: 'XXX XXX XXX' },
  { code: '+90', name: 'تركيا', flag: 'TR', format: 'XX XXX XXXX' }
];

export default function UserDetailsStep({ initialData, onNext, onBack, serverErrors = {} }: UserDetailsStepProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>(serverErrors);

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const extractPhoneData = (fullPhone: string) => {
    if (!fullPhone) return { code: '+966', number: '' };
    const match = fullPhone.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
      return { code: match[1], number: match[2].trim() };
    }
    return { code: '+966', number: '' };
  };

  const phoneData = extractPhoneData(formData.phone);
  const [countryCode, setCountryCode] = useState(phoneData.code);
  const [phoneNumber, setPhoneNumber] = useState(phoneData.number);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const formatPhoneNumber = (value: string, code: string) => {
    const digits = value.replace(/\D/g, '');
    const country = COUNTRIES.find(c => c.code === code);
    const format = country?.format || 'XXX XXX XXXX';

    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }

    while (digitIndex < digits.length) {
      formatted += digits[digitIndex];
      digitIndex++;
    }

    return formatted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اسم العائلة مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'يرجى إدخال عنوان بريد إلكتروني صالح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صالح';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const cleanedPhone = formData.phone.replace(/\s+/g, '');
      onNext({ ...formData, phone: cleanedPhone });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, countryCode);
    setPhoneNumber(formatted);
    const fullPhone = `${countryCode} ${formatted}`;
    setFormData({ ...formData, phone: fullPhone });
    setErrors({ ...errors, phone: '' });
  };

  const handleCountrySelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
    if (phoneNumber) {
      const fullPhone = `${code} ${phoneNumber}`;
      setFormData({ ...formData, phone: fullPhone });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-6">
          <User className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          أنشئ حسابك
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          أخبرنا قليلاً عن نفسك لتخصيص تجربتك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
              الاسم الأول
            </label>
            <div className="relative">
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                placeholder="أحمد"
                dir="rtl"
                className={`w-full px-5 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                  errors.firstName
                    ? 'border-red-300 focus:border-red-500'
                    : focusedField === 'firstName'
                    ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                autoFocus
              />
              {formData.firstName && !errors.firstName && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">
              اسم العائلة
            </label>
            <div className="relative">
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                placeholder="محمد"
                dir="rtl"
                className={`w-full px-5 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                  errors.lastName
                    ? 'border-red-300 focus:border-red-500'
                    : focusedField === 'lastName'
                    ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {formData.lastName && !errors.lastName && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            البريد الإلكتروني للعمل
          </label>
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="you@company.com"
              dir="ltr"
              className={`w-full pr-12 pl-12 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                errors.email
                  ? 'border-red-300 focus:border-red-500'
                  : focusedField === 'email'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {formData.email && !errors.email && validateEmail(formData.email) && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
            رقم الهاتف
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-base">{COUNTRIES.find(c => c.code === countryCode)?.flag}</span>
                  <span className="text-sm font-medium text-gray-700">{countryCode}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-xl z-50 w-64 max-h-64 overflow-y-auto">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-xl">{country.flag}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.format}</div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{country.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder={COUNTRIES.find(c => c.code === countryCode)?.format.replace(/X/g, '0') || '00 000 0000'}
              dir="ltr"
              className={`w-full pl-40 pr-12 py-4 text-base rounded-xl border-2 bg-white outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 ${
                errors.phone
                  ? 'border-red-300 focus:border-red-500'
                  : focusedField === 'phone'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {formData.phone && !errors.phone && validatePhone(formData.phone) && (
              <div className="absolute left-40 top-1/2 -translate-y-1/2 text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.phone}
            </p>
          )}
          <p className="text-sm text-gray-500">
            سنرسل لك رمز تحقق لتأكيد رقم هاتفك
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
            className="group flex-1 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              متابعة
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

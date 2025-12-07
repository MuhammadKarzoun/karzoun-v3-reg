import { useState } from 'react';
import { octobotsApiService } from '../services/octobotsApiService';
import type { RegistrationStep, RegistrationData } from '../types/registration';
import ProgressIndicator from './ProgressIndicator';
import BusinessNameStep from './steps/BusinessNameStep';
import UserDetailsStep from './steps/UserDetailsStep';
import VerificationStep from './steps/VerificationStep';
import SubdomainStep from './steps/SubdomainStep';
import { Loader2, Zap, Shield, TrendingUp, Star } from 'lucide-react';

export default function Registration() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('business-name');
  const [completedSteps, setCompletedSteps] = useState<RegistrationStep[]>([]);
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({
    businessName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subdomain: '',
  });
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const completeStep = (step: RegistrationStep) => {
    setCompletedSteps(prev => [...prev, step]);
  };

  const handleBusinessNameNext = (businessName: string) => {
    setRegistrationData(prev => ({ ...prev, businessName }));
    completeStep('business-name');
    setCurrentStep('user-details');
  };

  const handleUserDetailsNext = (data: { firstName: string; lastName: string; email: string; phone: string }) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    completeStep('user-details');
    setCurrentStep('email-verification');
  };

  const handleEmailVerificationNext = () => {
    setVerifiedEmail(registrationData.email || null);
    completeStep('email-verification');
    setCurrentStep('phone-verification');
  };

  const handlePhoneVerificationNext = () => {
    setVerifiedPhone(registrationData.phone || null);
    completeStep('phone-verification');
    setCurrentStep('subdomain');
  };

  const handleSubdomainComplete = async (subdomain: string) => {
    setLoading(true);
    try {
      const fullData = {
        ...registrationData,
        subdomain,
      } as RegistrationData;

      const cleanedPhone = fullData.phone.replace(/\s+/g, '');

      const response = await octobotsApiService.registerOrganization({
        firstName: fullData.firstName,
        lastName: fullData.lastName,
        email: fullData.email,
        phone: cleanedPhone,
        businessName: fullData.businessName,
        subdomain: fullData.subdomain,
        planId: "free" // you may know what #TODO @MK
      });

      if (response.success) {
        setRegistrationData(fullData);
        completeStep('subdomain');
        window.location.href = `https://${subdomain}.staging.karzoun.chat`;
      } else {
        alert('فشل في إكمال التسجيل. يرجى المحاولة مرة أخرى.');
      }
    } catch (error: any) {
      console.error('Error completing registration:', error);

      if (error.data && error.data.errors && Array.isArray(error.data.errors)) {
        const fieldErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          fieldErrors[err.field] = err.message;
        });
        setValidationErrors(fieldErrors);
        setCurrentStep('user-details');
      } else {
        alert('فشل في إكمال التسجيل. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const steps: RegistrationStep[] = ['business-name', 'user-details', 'email-verification', 'phone-verification', 'subdomain'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-row-reverse">
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">كرزون شات 3</h1>
              </div>
            </div>

            <div className="max-w-lg">
              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                افق جديد, للتواصل مع المستقبل
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                انضم لآلاف الشركات التي تعمل على تبسيط خدمة العملاء وأتمتة سير العمل, لا حدود سوى مخيلتك
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">اتمتة تقلل تكاليفك</h3>
                    <p className="text-blue-100">ابدأ في دقائق، وليس ساعات. لا حاجة لخبرة تقنية</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">ضمان ورفع رضى العملاء</h3>
                    <p className="text-blue-100">مع كرزون شات, فريقك اسرع واكثر احترافية.. عشرات الأدوات المساعدة للفريق لرفع جودة التنسيق الداخلي بينهم</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">تأثير مباشر على زيادة المبيعات</h3>
                    <p className="text-blue-100">ادوات حصرية ومتقدمة, لمتابعة واستهداف اذكى, اوفر, اربح</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  {/* <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-blue-700"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-blue-700"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-blue-700"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-blue-700"></div>
                  </div> */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-blue-100 leading-relaxed">
                  "ساعدنا كرزون في تقليل وقت الاستجابة بنسبة 80٪ والتعامل مع 5 أضعاف استفسارات العملاء بنفس حجم الفريق"
                </p>
                <p className="text-white font-semibold mt-3">عمر العويد, مدير التسويق (متجر ريفي)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold text-white mb-1">+10,000</div>
              <div className="text-blue-100 text-sm">شركة نشطة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">+1 مليار ريال سعودي</div>
              <div className="text-blue-100 text-sm">مبيعات من خلال ادوات الإستهدافس</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-blue-100 text-sm">الدعم الفني</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:w-[55%] xl:w-1/2 flex flex-col min-h-screen">
        <header className="py-6 px-6 lg:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">كرزون</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-6 lg:px-12 xl:px-16 py-8">
            {/* <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} /> */} 
          </div>

          <main className="flex-1 px-6 lg:px-12 xl:px-16 pb-12">
            <div className="max-w-xl mx-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">جاري المعالجة...</p>
                </div>
              )}

              {!loading && currentStep === 'business-name' && (
                <BusinessNameStep
                  initialValue={registrationData.businessName || ''}
                  onNext={handleBusinessNameNext}
                />
              )}

              {!loading && currentStep === 'user-details' && (
                <UserDetailsStep
                  initialData={{
                    firstName: registrationData.firstName || '',
                    lastName: registrationData.lastName || '',
                    email: registrationData.email || '',
                    phone: registrationData.phone || '',
                  }}
                  onNext={handleUserDetailsNext}
                  onBack={handleBack}
                  serverErrors={validationErrors}
                />
              )}

              {!loading && currentStep === 'email-verification' && (
                <VerificationStep
                  type="email"
                  value={registrationData.email || ''}
                  onNext={handleEmailVerificationNext}
                  onBack={handleBack}
                  skipInitialSend={verifiedEmail === registrationData.email}
                />
              )}

              {!loading && currentStep === 'phone-verification' && (
                <VerificationStep
                  type="phone"
                  value={registrationData.phone || ''}
                  onNext={handlePhoneVerificationNext}
                  onBack={handleBack}
                  skipInitialSend={verifiedPhone === registrationData.phone}
                />
              )}

              {!loading && currentStep === 'subdomain' && (
                <SubdomainStep
                  initialValue={registrationData.subdomain || ''}
                  businessName={registrationData.businessName || ''}
                  onComplete={handleSubdomainComplete}
                  onBack={handleBack}
                />
              )}
            </div>
          </main>

          <footer className="py-6 px-6 lg:px-12 xl:px-16 border-t border-gray-100">
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                <p>&copy; 2025 كرزون. جميع الحقوق محفوظة.</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-gray-900 transition-colors">الخصوصية</a>
                  <a href="#" className="hover:text-gray-900 transition-colors">الشروط</a>
                  <a href="#" className="hover:text-gray-900 transition-colors">الدعم</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

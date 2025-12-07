import { Check } from 'lucide-react';
import type { RegistrationStep } from '../types/registration';

interface Step {
  id: RegistrationStep;
  label: string;
  number: number;
}

interface ProgressIndicatorProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
}

const steps: Step[] = [
  { id: 'business-name', label: 'المؤسسة', number: 1 },
  { id: 'user-details', label: 'الحساب', number: 2 },
  { id: 'email-verification', label: 'البريد', number: 3 },
  { id: 'phone-verification', label: 'الهاتف', number: 4 },
  { id: 'subdomain', label: 'المساحة', number: 5 },
];

export default function ProgressIndicator({ currentStep, completedSteps }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-12">
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex items-start justify-between flex-row-reverse">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div className="relative mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-100'
                        : isCurrent
                        ? 'bg-white text-blue-600 shadow-lg shadow-blue-600/20 border-2 border-blue-600 scale-110'
                        : 'bg-white text-gray-400 border-2 border-gray-200 scale-90'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
                  )}
                </div>

                <span
                  className={`text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                    isCompleted
                      ? 'text-gray-900'
                      : isCurrent
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

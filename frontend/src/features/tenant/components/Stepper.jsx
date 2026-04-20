export default function Stepper({ steps, currentStep, onStepClick }) {
    return (
      <aside className="w-72 min-h-screen bg-gray-900 text-white p-6 flex flex-col">
        
        <div className="mb-10">
          <h1 className="text-lg font-semibold">Exactum</h1>
          <p className="text-xs text-gray-400">
            Configure sua empresa
          </p>
        </div>
  
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
  
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const isPending = currentStep < stepNumber;
  
            return (
              <div
                key={stepNumber}
                onClick={() => onStepClick?.(stepNumber)}
                className="flex items-start gap-3 cursor-pointer"
              >
                <div
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
  
                <div>
                  <p className="text-xs text-gray-400">
                    Etapa {stepNumber}
                  </p>
                  <p
                    className={`
                      text-sm font-medium
                      ${
                        isActive
                          ? "text-white"
                          : isCompleted
                          ? "text-gray-300"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
  
        <div className="mt-auto text-xs text-gray-500">
          Ao criar o tenant você concorda com os termos.
        </div>
      </aside>
    );
}
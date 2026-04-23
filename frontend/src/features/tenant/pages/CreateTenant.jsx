import { useState } from "react";
import Stepper from "../components/Stepper";
import CompanyStep from "../steps/CompanyStep";
import AdminStep from "../steps/AdminStep";
import PlanStep from "../steps/PlanStep";
import ReviewStep from "../steps/ReviewStep";

export default function CreateTenant() {
  
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    company: {
      name: "",
      cnpj: "",
      fantasyName: "",
      slug: ""
    },
    admin: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    plan: {
      type: "growth",
      features: {
        predictive: true,
        alerts: true,
        import: false,
      }
    },
  });

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const updateCompany = (data) => {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, ...data },
    }));
  };

  const updateAdmin = (data) => {
    setFormData((prev) => ({
      ...prev,
      admin: { ...prev.admin, ...data },
    }));
  };

  const updatePlan = (data) => {
    setFormData((prev) => ({
      ...prev,
      plan: { ...prev.plan, ...data },
    }));
  };

  const steps = [
    { label: "Dados da empresa" },
    { label: "Administrador" },
    { label: "Escolha do Plano" },
    { label: "Revisão Final" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      
      <Stepper
        steps={steps}
        currentStep={step}
        onStepClick={(clickedStep) => {
          // Permite voltar passos clicando, mas não avançar sem validar
          if (clickedStep < step) {
            setStep(clickedStep);
          }
        }}
      />
  
      {/* Área do Formulário */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-8 py-12 md:px-16 lg:py-20">
          
          <div className="relative">
            {step === 1 && (
              <CompanyStep
                data={formData.company}
                updateData={updateCompany}
                next={next}
              />
            )}
    
            {step === 2 && (
              <AdminStep
                data={formData.admin}
                updateData={updateAdmin}
                next={next}
                back={back}
              />
            )}
    
            {step === 3 && (
              <PlanStep
                data={formData.plan}
                updateData={updatePlan}
                next={next}
                back={back}
              />
            )}
    
            {step === 4 && (
              <ReviewStep
                data={formData}
                back={back}
              />
            )}
          </div>

        </div>
      </main>
  
    </div>
  );
}
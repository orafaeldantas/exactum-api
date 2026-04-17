import { useState } from "react";

import Stepper from "../components/Stepper";

import CompanyStep from "../steps/CompanyStep";
import AdminStep from "../steps/AdminStep";
import PlanStep from "../steps/PlanStep";
import ReviewStep from "../steps/ReviewStep";

export default function CreateTenant() {
  const [step, setStep] = useState(3);

  const [formData, setFormData] = useState({
    company: {},
    admin: {},
    plan: {
      type: "growth",
      features: {
        predictive: true,
        alerts: true,
        import: false,
      }},
  });

  function next() {
    setStep((prev) => prev + 1);
  }

  function back() {
    setStep((prev) => prev - 1);
  }

  function updateCompany(data) {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, ...data },
    }));
  }

  function updateAdmin(data) {
    setFormData((prev) => ({
      ...prev,
      admin: { ...prev.admin, ...data },
    }));
  }

  function updatePlan(plan) {
    setFormData((prev) => ({
      ...prev,
      plan,
    }));
  }

  const steps = [
    { label: "Dados da empresa" },
    { label: "Administrador" },
    { label: "Plano" },
    { label: "Revisão" },
  ];

  return (
    <div className="flex flex-row h-screen">

      {/* Sidebar */}
      <div className="w-72 bg-gray-900 text-white p-6">
      <Stepper
        steps={steps}
        currentStep={step}
        onStepClick={(clickedStep) => {
          if (clickedStep < step) {
            setStep(clickedStep);
          }
        }}
      />
      </div>
  
      {/* Área principal */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
  
        <div className="max-w-5xl mx-auto p-10">
  
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
              tenantId={formData.company.id}
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
  
    </div>
  );
}
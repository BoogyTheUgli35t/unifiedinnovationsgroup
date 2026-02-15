import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Briefcase, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Address Details", icon: MapPin },
  { id: 3, title: "Employment & Income", icon: Briefcase },
  { id: 4, title: "Account Preferences", icon: CreditCard },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ssnLastFour, setSsnLastFour] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [annualIncomeRange, setAnnualIncomeRange] = useState("");

  const [preferredAccountType, setPreferredAccountType] = useState("");

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !dateOfBirth || !ssnLastFour) {
        toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
        return false;
      }
      if (!/^\d{4}$/.test(ssnLastFour)) {
        toast({ title: "Invalid SSN", description: "Please enter exactly 4 digits.", variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      if (!addressLine1.trim() || !city.trim() || !state || !zipCode.trim()) {
        toast({ title: "Missing fields", description: "Please fill in all required address fields.", variant: "destructive" });
        return false;
      }
    }
    if (step === 3) {
      if (!employmentStatus || !annualIncomeRange) {
        toast({ title: "Missing fields", description: "Please select employment and income information.", variant: "destructive" });
        return false;
      }
    }
    if (step === 4) {
      if (!preferredAccountType) {
        toast({ title: "Missing fields", description: "Please select an account type.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth,
        ssn_last_four: ssnLastFour,
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || null,
        city: city.trim(),
        state,
        zip_code: zipCode.trim(),
        country: "US",
        employment_status: employmentStatus,
        annual_income_range: annualIncomeRange,
        preferred_account_type: preferredAccountType,
        onboarding_completed: true,
      })
      .eq("user_id", session.user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome aboard! 🎉", description: "Your account has been set up successfully." });
      navigate("/dashboard");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <span className="text-navy-950 font-display font-bold text-2xl">U</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-navy-400">Just a few steps to set up your account</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step >= s.id
                    ? "bg-gradient-gold text-navy-950"
                    : "bg-navy-800 text-navy-500"
                }`}>
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-16 lg:w-24 h-0.5 mx-2 transition-all ${
                    step > s.id ? "bg-gold" : "bg-navy-700"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-navy-400 text-center mb-6">
            Step {step} of 4 — {STEPS[step - 1].title}
          </p>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Full Legal Name *</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Michael Doe" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Phone Number *</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Date of Birth *</Label>
                    <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Last 4 Digits of SSN *</Label>
                    <Input value={ssnLastFour} onChange={e => setSsnLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" maxLength={4} className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                    <p className="text-xs text-navy-500">Required for identity verification. Encrypted and stored securely.</p>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Street Address *</Label>
                    <Input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="123 Main Street" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Apt / Suite / Unit</Label>
                    <Input value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Apt 4B" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">City *</Label>
                      <Input value={city} onChange={e => setCity(e.target.value)} placeholder="New York" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">State *</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger className="bg-navy-900/50 border-navy-700 text-foreground">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">ZIP Code *</Label>
                    <Input value={zipCode} onChange={e => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="10001" maxLength={5} className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Employment Status *</Label>
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                      <SelectTrigger className="bg-navy-900/50 border-navy-700 text-foreground">
                        <SelectValue placeholder="Select your employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Annual Income Range *</Label>
                    <Select value={annualIncomeRange} onValueChange={setAnnualIncomeRange}>
                      <SelectTrigger className="bg-navy-900/50 border-navy-700 text-foreground">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_25k">Under $25,000</SelectItem>
                        <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                        <SelectItem value="250k_500k">$250,000 - $500,000</SelectItem>
                        <SelectItem value="over_500k">Over $500,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <p className="text-navy-300 text-sm mb-4">
                    Choose your primary account type. You can always open additional accounts later.
                  </p>
                  <div className="grid gap-4">
                    {[
                      { value: "checking", title: "Checking Account", desc: "Everyday spending with debit card access, no monthly fees" },
                      { value: "savings", title: "Savings Account", desc: "High-yield savings with competitive APY rates" },
                      { value: "both", title: "Checking + Savings", desc: "Open both accounts for maximum flexibility" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPreferredAccountType(opt.value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          preferredAccountType === opt.value
                            ? "border-gold bg-gold/10"
                            : "border-navy-700 bg-navy-900/30 hover:border-navy-600"
                        }`}
                      >
                        <h4 className="font-display font-semibold text-foreground">{opt.title}</h4>
                        <p className="text-sm text-navy-400 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="text-navy-400 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext} className="btn-premium">
                <span className="relative z-10 flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-premium">
                <span className="relative z-10">
                  {isSubmitting ? "Setting up..." : "Complete Setup"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;

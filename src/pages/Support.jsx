import { useState } from "react";
import {
  HelpCircle,
  Send,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { apiService } from "@/config/api";
import API from "@/config/api";

const Support = () => {
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    file: null,
  });

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How long does KYC verification take?",
      answer:
        "KYC verification typically takes 24-48 hours once all required documents are submitted. You'll receive email and SMS notifications about the progress.",
    },
    {
      id: 2,
      question: "Is my bank information secure?",
      answer:
        "Yes, all bank information is encrypted using industry-standard 256-bit encryption and verified through Cashfree's secure payment gateway, which is PCI DSS compliant.",
    },
    {
      id: 3,
      question: "Can I add multiple credit cards?",
      answer:
        "Yes, you can add and manage multiple credit cards in your account. All card details are stored securely and encrypted.",
    },
    {
      id: 4,
      question: "What payment methods are supported?",
      answer:
        "We support credit cards (Visa, Mastercard, Amex), bank transfers, and UPI payments through the Cashfree payment gateway.",
    },
    {
      id: 5,
      question: "How do I track my transactions?",
      answer:
        "You can view all your transactions in the Transaction Reports page, which shows detailed information including date, amount, method, and status.",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("subject", supportForm.subject);
      formData.append("message", supportForm.message);
      if (supportForm.file) formData.append("file", supportForm.file);

      const res = await apiService.post(
        `/` + API.ENDPOINTS.supportContact,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          showSuccess: true,
        }
      );

      if (res?.data?.status) {
        toast.success("Support request sent to admin");
        setSupportForm({ subject: "", message: "", file: null });
      }
    } catch (err) {
      // error is globally handled; optional local toast
      toast.error("Failed to send support request");
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground text-lg">
          Get assistance with your account and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardContent className="pt-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Call Us</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Mon-Fri, 9AM-6PM IST
            </p>
            <a
              href="tel:1800-123-4567"
              className="text-sm font-medium text-primary hover:underline"
            >
              1800-123-4567
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardContent className="pt-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 mx-auto mb-3">
              <Mail className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold mb-1">Email Us</h3>
            <p className="text-sm text-muted-foreground mb-3">24/7 support</p>
            <a
              href="mailto:support@securepay.com"
              className="text-sm font-medium text-primary hover:underline"
            >
              support@securepay.com
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardContent className="pt-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 mx-auto mb-3">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Detailed guides
            </p>
            <a
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              View Docs
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Contact Form */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Send us a message and we'll respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={supportForm.subject}
                    onChange={(e) =>
                      setSupportForm({
                        ...supportForm,
                        subject: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={supportForm.message}
                    onChange={(e) =>
                      setSupportForm({
                        ...supportForm,
                        message: e.target.value,
                      })
                    }
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Attach File (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) =>
                      setSupportForm({
                        ...supportForm,
                        file: e.target.files[0],
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Max file size: 10MB. Supported formats: PDF, JPG, PNG
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-primary shadow-soft hover:shadow-medium gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - FAQs */}
        <div className="space-y-6">
          <Card className="shadow-medium sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <Collapsible
                    key={faq.id}
                    open={openFaq === faq.id}
                    onOpenChange={() =>
                      setOpenFaq(openFaq === faq.id ? null : faq.id)
                    }
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors text-left">
                      <span className="font-medium">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                          openFaq === faq.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pt-3 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;

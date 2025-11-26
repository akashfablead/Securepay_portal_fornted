import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, Calendar, Eye, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const policySections = [
    {
      title: "1. SMS Consent",
      content:
        "By providing your mobile number, you agree to receive SMS notifications, alerts, verification messages and service updates from SecurePay.",
    },
    {
      title: "2. Account Suspension / Termination",
      content:
        "The User agrees that SecurePay, at its sole and absolute discretion, may issue warnings, temporarily or permanently block an account, suspend or terminate Services, cancel deposits, remove content, deny refund of deposit, or withhold or cancel transactions. Reasons include but are not limited to violation of SecurePay policies or rules, breach of this Agreement, fraudulent or suspicious activity, SecurePay being unable to verify or authenticate information provided by the User, or any misuse of the Site, App, or Services. SecurePay reserves the right to take action without prior notice.",
    },
    {
      title: "3. Amendments to the Terms",
      content:
        "SecurePay may amend or update this Privacy Policy or Terms & Conditions at any time. Updated Terms may be sent to your email or posted on the website. Changes become effective 30 days after posting. Continued use of our platform means you accept the updated Terms.",
    },
    {
      title: "4. Accuracy of Content",
      content:
        "SecurePay does not guarantee that all content on the Site/App is accurate, error-free, or legal and non-offensive. By using SecurePay, you agree not to make any claim for losses or damages arising from the use of our platform.",
    },
    {
      title: "5. Our Privacy Commitment",
      content:
        "We are committed to protecting your privacy. All information collected about you will be used lawfully and responsibly. We collect information for processing your requests, providing smooth services, managing KYC and verification, and improving user experience. We do not send promotional emails unless you consent.",
    },
    {
      title: "6. Information We Collect",
      content:
        "We may collect the following details: Name, Address, Phone Number, Email Address, Date of Birth, Aadhaar / PAN / Voter ID / Driving License, Banking and UPI details (for payouts/verification), Images and documents, Contact List (with permission), Files and documents, Device information, Location, and App usage data. We only collect sensitive details with your explicit consent.",
    },
    {
      title: "7. Use of Your Information",
      content:
        "SecurePay may use your information for account verification, KYC processing, fraud detection, transaction processing, customer support, regulatory compliance, analytics, and improving our services.",
    },
    {
      title: "8. Contacts Permission",
      content:
        "If you allow access, we may use your phone contact list for features like recharge, beneficiary selection, and payment services. We do this only after your permission.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 md:pb-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>SecurePay</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: 21/11/2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Your Privacy Matters</span>
          </div>
        </div>
      </div>

      <Card className="shadow-soft border-primary/10">
        <CardContent className="pt-6">
          <p className="mb-4 text-lg">
            Welcome to SecurePay ("Company", "We", "Us", "Our").
          </p>
          <p className="text-muted-foreground">
            This Privacy Policy describes the terms and conditions governing
            your use of our website, mobile application, and services. By
            registering as a User or using the Site, you agree to be bound by
            this Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {policySections.map((section, index) => (
          <Card
            key={index}
            className="shadow-soft border-primary/5 hover:border-primary/20 transition-colors"
          >
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact
            us at
            <span className="font-medium text-primary">
              {" "}
              support@securepay.com
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;

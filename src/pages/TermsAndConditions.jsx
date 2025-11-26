import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  FileText,
  Calendar,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const termsSections = [
    {
      title: "1. Introduction",
      content:
        "These Terms and Conditions govern your use of our website located at https://securepay.com and any related services provided by SecurePay. By accessing our website and using our services, you accept these Terms and Conditions and agree to be bound by them. If you disagree with any part of these terms, you must not use our website or services.",
    },
    {
      title: "2. Intellectual Property",
      content:
        "Other than the content you own, under these Terms, SecurePay and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website.",
    },
    {
      title: "3. Restrictions",
      content:
        "You are specifically restricted from all of the following: Publishing any Website material in any other media; Selling, sublicensing and/or otherwise commercializing any Website material; Publicly performing and/or showing any Website material; Using this Website in any way that is or may be damaging to this Website; Using this Website in any way that impacts user access to this Website; Using this Website contrary to applicable laws and regulations; Engaging in any data mining, data harvesting, data extracting or any other similar activity.",
    },
    {
      title: "4. User Content",
      content:
        'In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant SecurePay a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.',
    },
    {
      title: "5. No Warranties",
      content:
        'This Website is provided "as is," with all faults, and SecurePay expresses no representations or warranties of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.',
    },
    {
      title: "6. Limitation of Liability",
      content:
        "In no event shall SecurePay, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. SecurePay, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.",
    },
    {
      title: "7. Indemnification",
      content:
        "You hereby indemnify to the fullest extent SecurePay from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.",
    },
    {
      title: "8. Severability",
      content:
        "If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.",
    },
    {
      title: "9. Variation of Terms",
      content:
        "SecurePay is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.",
    },
    {
      title: "10. Assignment",
      content:
        "SecurePay is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 md:pb-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
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
            <AlertTriangle className="h-4 w-4" />
            <span>Important Agreement</span>
          </div>
        </div>
      </div>

      <Card className="shadow-soft border-primary/10">
        <CardContent className="pt-6">
          <p className="mb-4 text-lg">
            Welcome to SecurePay. These terms and conditions outline the rules
            and regulations for the use of SecurePay's Website and Services.
          </p>
          <p className="text-muted-foreground">
            By accessing this website, we assume you accept these terms and
            conditions. Do not continue to use SecurePay if you do not agree to
            all of the terms and conditions stated on this page.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {termsSections.map((section, index) => (
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
            If you have any questions about these Terms & Conditions, please
            contact us at
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

export default TermsAndConditions;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Receipt, Calendar, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  const refundSections = [
    {
      title: "1. General Refund Policy",
      content:
        "Refunds for transactions processed through SecurePay are subject to the refund policy of the respective merchant or service provider. SecurePay acts as a payment facilitator and does not have direct control over the goods or services being purchased. For any refund requests, users should contact the merchant or service provider directly. SecurePay will assist in facilitating the refund process as per the merchant's policy and applicable laws.",
    },
    {
      title: "2. E-commerce Transactions",
      content:
        "For e-commerce transactions, refunds are subject to the merchant's return and refund policy. Users should review the merchant's policy before making a purchase. Typical e-commerce refund scenarios include: Product not received; Product not as described; Damaged or defective product; Change of mind (subject to merchant policy).",
    },
    {
      title: "3. Course/Subscription Services",
      content:
        "For course or subscription-based services, refunds are subject to the provider's policy. Users should review the terms before enrolling or subscribing. Common refund scenarios for courses and subscriptions include: Service not delivered as promised; Technical issues preventing access; Cancellation within cooling-off period (if applicable).",
    },
    {
      title: "4. Refund Process",
      content:
        "To request a refund, users should: Contact the merchant or service provider directly; Provide transaction details and reason for refund; Follow the merchant's refund process; Contact SecurePay support if the merchant is unresponsive. SecurePay will investigate refund disputes and mediate between users and merchants when necessary.",
    },
    {
      title: "5. Refund Timeframes",
      content:
        "Refund processing times vary depending on the payment method: Credit/Debit Card: 5-10 business days; Bank Transfer: 7-14 business days; UPI: 2-5 business days; Wallet: 2-3 business days. These timeframes are indicative and may vary based on the issuing bank or financial institution.",
    },
    {
      title: "6. Non-Refundable Transactions",
      content:
        "Certain transactions are non-refundable: Completed services; Consumed digital content; Participated events or courses; Customized or personalized items; Third-party fees (processing, convenience, etc.).",
    },
    {
      title: "7. Disputed Transactions",
      content:
        "If you believe you're entitled to a refund but the merchant has refused, you can: Contact SecurePay support with transaction details; Provide evidence of the issue; Allow SecurePay to investigate and mediate. SecurePay will work with both parties to resolve the dispute fairly.",
    },
    {
      title: "8. Chargebacks",
      content:
        "Initiating chargebacks directly with your bank or card issuer should be a last resort. Users should first attempt to resolve issues through the merchant and SecurePay support. Unnecessary chargebacks may result in: Account restrictions; Transaction fees; Loss of refund eligibility.",
    },
    {
      title: "9. Policy Changes",
      content:
        "SecurePay reserves the right to update this refund policy at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after any changes constitutes acceptance of the revised policy.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 md:pb-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
          <Receipt className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
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
            <Clock className="h-4 w-4" />
            <span>Effective Immediately</span>
          </div>
        </div>
      </div>

      <Card className="shadow-soft border-primary/10">
        <CardContent className="pt-6">
          <p className="mb-4 text-lg">
            SecurePay processes payments for various merchants and service
            providers. As such, our refund policy is aligned with the policies
            of the respective merchants and service providers.
          </p>
          <p className="text-muted-foreground">
            Please read this refund policy carefully. This policy applies to all
            transactions processed through the SecurePay platform.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {refundSections.map((section, index) => (
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
            If you have any questions about this Refund Policy, please contact
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

export default RefundPolicy;

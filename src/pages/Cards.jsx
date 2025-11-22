import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Shield,
  Lock,
  AlertCircle,
  Wifi,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  listCards,
  addCard as apiAddCard,
  deleteCard as apiDeleteCard,
} from "@/services/cardService";

const Cards = () => {
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detectedBrand, setDetectedBrand] = useState("");

  const formatCardNumber = (value) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5);
  };

  const handleCardChange = (field, value) => {
    let formattedValue = value;
    if (field === "number") {
      const digitsOnly = value.replace(/\D/g, "");
      formattedValue = formatCardNumber(digitsOnly);
      setDetectedBrand(detectCardBrand(digitsOnly));
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }
    setNewCard({ ...newCard, [field]: formattedValue });
  };

  const detectCardBrand = (num) => {
    if (!num) return "";
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "Amex";
    if (/^6/.test(num)) return "RuPay";
    return "Unknown";
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.holder) {
      toast.error("Please fill all card details");
      return;
    }
    // Simulate tokenization: never send PAN/CVV; generate a pseudo token client-side for demo
    const sanitizedNumber = newCard.number.replace(/\s/g, "");
    const last4 = sanitizedNumber.slice(-4);
    const [mm, yy] = newCard.expiry.split("/");
    const token = `tok_${Date.now()}_${last4}`;

    try {
      await apiAddCard({
        holder: newCard.holder,
        token,
        last4,
        expiryMonth: Number(mm),
        expiryYear: Number(`20${yy}`),
        brand: detectCardBrand(sanitizedNumber),
      });
      toast.success("Card added successfully!");
      setIsDialogOpen(false);
      setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
      setDetectedBrand("");
      await loadCards();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add card");
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      await apiDeleteCard(id);
      toast.success("Card removed successfully");
      await loadCards();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to remove card");
    }
  };

  const loadCards = async () => {
    try {
      setLoading(true);
      const res = await listCards();
      const items = (res?.cards || []).map((c) => ({
        id: c._id,
        last4: c.last4,
        brand: c.brand,
        expiry: `${String(c.expiryMonth).padStart(2, "0")}/${String(
          c.expiryYear
        ).slice(-2)}`,
        holder: c.holder,
        isDefault: c.isDefault,
      }));
      setSavedCards(items);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const getCardBrandColor = (brand) => {
    const colors = {
      Visa: "from-blue-500 to-blue-600",
      Mastercard: "from-red-500 to-orange-500",
      Amex: "from-green-500 to-teal-500",
      RuPay: "from-slate-600 to-slate-700",
    };
    return colors[brand] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="flex items-center justify-between  mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Credit Card Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage your saved payment methods
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary shadow-soft hover:shadow-medium">
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Enter your card details securely
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) => handleCardChange("number", e.target.value)}
                  maxLength={19}
                />
                {detectedBrand && (
                  <p className="text-xs text-muted-foreground">
                    Detected brand: {detectedBrand}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => handleCardChange("expiry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => handleCardChange("cvv", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holder">Cardholder Name</Label>
                <Input
                  id="holder"
                  placeholder="John Doe"
                  value={newCard.holder}
                  onChange={(e) =>
                    handleCardChange("holder", e.target.value.toUpperCase())
                  }
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                Save Card
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Saved Cards */}
        <div className="space-y-6">
          <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <p className="text-sm">
                  Your card information is encrypted and stored securely using
                  industry-standard PCI DSS compliance
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Saved Cards ({savedCards.length})
            </h2>
            {loading && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="shadow-medium">
                  <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse" />
                </Card>
                <Card className="shadow-medium">
                  <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse" />
                </Card>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {savedCards.map((card) => (
                <Card
                  key={card.id}
                  className="shadow-medium hover:shadow-glow transition-all overflow-hidden rounded-2xl border-0"
                >
                  <div
                    className={` bg-gradient-to-br ${getCardBrandColor(
                      card.brand
                    )} p-6 text-white relative overflow-hidden rounded-2xl ring-1 ring-white/10 hover:-translate-y-0.5 duration-200`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_35%)]" />
                    <div className="relative flex justify-between items-start mb-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span className="text-sm font-semibold tracking-wide uppercase opacity-95">
                          {card.brand}
                        </span>
                        {!card.isDefault && null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-inner opacity-90" />
                        <Wifi className="h-4 w-4 opacity-80" />
                      </div>
                      <p className="text-[15px] leading-8 font-mono tracking-[0.3em]">
                        •••• •••• •••• {card.last4}
                      </p>
                      <div className="flex justify-between items-end text-sm">
                        <div>
                          <p className="text-[10px] opacity-80 mb-0.5 uppercase">
                            Cardholder
                          </p>
                          <p className="font-semibold text-[15px] font-mono tracking-wide">
                            {card.holder}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-80 mb-0.5 uppercase text-right">
                            Expires
                          </p>
                          <p className="font-semibold text-[15px] font-mono tracking-wide">
                            {card.expiry}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {savedCards.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No cards saved yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a credit card to make faster payments
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Card
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Security Info */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">PCI DSS Compliant</p>
                    <p className="text-sm text-muted-foreground">
                      Our platform meets the highest security standards for
                      payment card industry
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">256-bit Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      All card data is encrypted using bank-grade security
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Tokenization</p>
                    <p className="text-sm text-muted-foreground">
                      Card numbers are replaced with secure tokens
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">3D Secure</p>
                    <p className="text-sm text-muted-foreground">
                      Additional authentication for online transactions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-secondary/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Card Management Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>You can save multiple cards for quick checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>
                    Update card details before expiry to avoid payment failures
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Remove unused cards to keep your account secure</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>All transactions are protected by fraud detection</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cards;
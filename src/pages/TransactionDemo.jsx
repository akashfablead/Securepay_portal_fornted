import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TransactionDetails from "../components/TransactionDetails";

const TransactionDemo = () => {
  // Sample transaction data similar to what you provided
  const sampleTransaction = {
    id: "6926a27a8da3cf524185d516",
    type: "payout",
    orderId: "PAYOUT_6926a27a8da3cf524185d516",
    amount: 100,
    bankDetails: {
      accountHolderName: "akash",
      accountNumber: "026291800001191",
      ifsc: "YESB0000262",
    },
    createdAt: "2025-11-26T06:47:22.889Z",
    currency: "INR",
    fee: 20,
    status: "RECEIVED",
    totalDeduction: 120,
    updatedAt: "2025-11-26T06:47:23.877Z",
  };

  const [transactionData, setTransactionData] = useState(sampleTransaction);
  const [customData, setCustomData] = useState(
    JSON.stringify(sampleTransaction, null, 2)
  );

  const handleLoadSample = () => {
    setTransactionData(sampleTransaction);
  };

  const handleLoadCustom = () => {
    try {
      const parsed = JSON.parse(customData);
      setTransactionData(parsed);
    } catch (error) {
      alert("Invalid JSON format");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transaction Details Demo</h1>
        <p className="text-muted-foreground">
          Properly formatted display of transaction information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={handleLoadSample} variant="outline">
                Load Sample Data
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customData">Custom JSON Data</Label>
              <textarea
                id="customData"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="w-full h-64 p-2 border rounded font-mono text-sm"
                placeholder="Enter transaction JSON data"
              />
              <Button onClick={handleLoadCustom}>Load Custom Data</Button>
            </div>
          </CardContent>
        </Card>

        {/* Display Section */}
        <Card>
          <CardHeader>
            <CardTitle>Formatted Display</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionDetails transaction={transactionData} />
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Transaction Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(transactionData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDemo;

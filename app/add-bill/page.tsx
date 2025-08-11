"use client";

import { Suspense } from 'react';
import { AddBillForm } from "@/components/add-bill-form"
import { Card, CardContent } from "@/components/ui/card";

function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddBill() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddBillForm />
    </Suspense>
  );
}

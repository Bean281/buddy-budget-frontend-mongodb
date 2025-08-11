"use client";

import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionFormSchema,
  TransactionFormValues,
} from "./add-transaction-form/helpers/schema";
import { useCreateTransaction, useTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  ShoppingCart,
  Car,
  Utensils,
  Tv,
  Briefcase,
  Wallet,
  Gift,
  Smartphone,
  Droplet,
  Lightbulb,
  Wifi,
  DollarSign,
  AlertCircle,
  Loader2,
  PiggyBank,
  TrendingUp,
  Building,
  Landmark,
  CreditCard,
  Scissors,
  Shirt,
  GraduationCap,
  Heart,
  Plane,
  Coffee,
  Music,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Icon mapping function to map API icon names to Lucide React icons
import { ToastAction } from "@/components/ui/toast";
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    home: <Home className="h-6 w-6 mb-1" />,
    "shopping-cart": <ShoppingCart className="h-6 w-6 mb-1" />,
    car: <Car className="h-6 w-6 mb-1" />,
    utensils: <Utensils className="h-6 w-6 mb-1" />,
    tv: <Tv className="h-6 w-6 mb-1" />,
    briefcase: <Briefcase className="h-6 w-6 mb-1" />,
    gift: <Gift className="h-6 w-6 mb-1" />,
    smartphone: <Smartphone className="h-6 w-6 mb-1" />,
    lightbulb: <Lightbulb className="h-6 w-6 mb-1" />,
    wifi: <Wifi className="h-6 w-6 mb-1" />,
    droplet: <Droplet className="h-6 w-6 mb-1" />,
    "dollar-sign": <DollarSign className="h-6 w-6 mb-1" />,
    wallet: <Wallet className="h-6 w-6 mb-1" />,
    "piggy-bank": <PiggyBank className="h-6 w-6 mb-1" />,
    "trending-up": <TrendingUp className="h-6 w-6 mb-1" />,
    building: <Building className="h-6 w-6 mb-1" />,
    landmark: <Landmark className="h-6 w-6 mb-1" />,
    "credit-card": <CreditCard className="h-6 w-6 mb-1" />,
    scissors: <Scissors className="h-6 w-6 mb-1" />,
    shirt: <Shirt className="h-6 w-6 mb-1" />,
    "graduation-cap": <GraduationCap className="h-6 w-6 mb-1" />,
    heart: <Heart className="h-6 w-6 mb-1" />,
    plane: <Plane className="h-6 w-6 mb-1" />,
    coffee: <Coffee className="h-6 w-6 mb-1" />,
    music: <Music className="h-6 w-6 mb-1" />,
    "book-open": <BookOpen className="h-6 w-6 mb-1" />,
  };

  return iconMap[iconName] || <DollarSign className="h-6 w-6 mb-1" />;
};

interface AddTransactionFormProps {
  transactionId?: string;
  isEditing?: boolean;
}

export function AddTransactionForm({ transactionId, isEditing = false }: AddTransactionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  const { data: transaction, isLoading: isLoadingTransaction } = useTransaction(transactionId || "");

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      type: "EXPENSE",
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
      description: "",
      notes: "",
      billId: "",
    },
  });

  // Load transaction data when editing
  useEffect(() => {
    if (isEditing && transaction) {
      form.reset({
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date.slice(0, 10), // Format to YYYY-MM-DD
        categoryId: transaction.categoryId,
        description: transaction.description || "",
        notes: transaction.notes || "",
        billId: transaction.billId || "",
      });
    }
  }, [form, isEditing, transaction]);

  const type = form.watch("type");
  const categoryId = form.watch("categoryId");

  // Fetch categories from API
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(type);

  const isPending = isCreating || isUpdating;
  const isLoading = isLoadingCategories || (isEditing && isLoadingTransaction);

  function onSubmit(values: TransactionFormValues) {
    if (!values.amount || isNaN(values.amount)) {
      form.setError("amount", { message: "Amount is required" });
      return;
    }

    // Log the values being submitted
    console.log("Submitting transaction:", values);

    // Make sure categoryId is selected
    if (!values.categoryId) {
      form.setError("categoryId", { message: "Please select a category" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category"
      });
      return;
    }

    const dataToSubmit = { ...values };
    if (dataToSubmit.billId === "") {
      delete dataToSubmit.billId;
    }

    console.log("Submitting transaction verified data:", dataToSubmit);

    if (isEditing && transactionId) {
      updateTransaction(
        { id: transactionId, data: dataToSubmit },
        {
          onSuccess: () => {
            toast({
              title: "Transaction Updated",
              description: `${dataToSubmit.type === "INCOME" ? "Income" : "Expense"} of $${dataToSubmit.amount.toFixed(2)} for ${dataToSubmit.description || "unnamed transaction"} has been updated.`,
              variant: "transaction_update",
              action: (
                <ToastAction 
                  altText="View All" 
                  onClick={() => router.push("/transactions")}
                >
                  View All
                </ToastAction>
              ),
            });
            router.push("/transactions");
          },
          onError: (err: any) => {
            console.error("Error updating transaction:", err);
            toast({
              variant: "destructive",
              title: "Update Failed",
              description: "Could not update transaction. Please try again."
            });
          },
        }
      );
    } else {
      createTransaction(dataToSubmit, {
        onSuccess: () => {
          toast({
            title: "Transaction Added",
            description: `${dataToSubmit.type === "INCOME" ? "Income" : "Expense"} of $${dataToSubmit.amount.toFixed(2)} for ${dataToSubmit.description || "unnamed transaction"} has been added.`,
            variant: "transaction_create",
            action: (
              <ToastAction 
                altText="Add Another" 
                onClick={() => {
                  form.reset({
                    amount: 0,
                    type: dataToSubmit.type,
                    date: new Date().toISOString().slice(0, 10),
                    categoryId: "",
                    description: "",
                    notes: "",
                    billId: "",
                  });
                  router.push("/add-transaction");
                }}
              >
                Add Another
              </ToastAction>
            ),
          });
          form.reset();
          router.push("/transactions");
        },
        onError: (err: any) => {
          console.error("Error creating transaction:", err);
          toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "Could not add transaction. Please try again."
          });
        },
      });
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Edit Transaction" : "Add Transaction"}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Transaction" : "New Transaction"}</CardTitle>
          <CardDescription>
            {isEditing ? "Modify your transaction details" : "Record your income or expense"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs
                value={type}
                onValueChange={(v) =>
                  form.setValue("type", v as "EXPENSE" | "INCOME")
                }
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
                  <TabsTrigger value="INCOME">Income</TabsTrigger>
                </TabsList>
                <TabsContent value="EXPENSE">
                  {isLoadingCategories ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex justify-center items-center py-8 text-center">
                      <div>
                        <p className="mb-2">No expense categories found</p>
                        <p className="text-sm text-muted-foreground">
                          Please create categories in the category management
                          section
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 my-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer border transition-colors ${
                            categoryId === category.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            console.log("Setting categoryId to:", category.id);
                            form.setValue("categoryId", category.id);
                            // Clear any previous error
                            form.clearErrors("categoryId");
                          }}
                        >
                          {getIconComponent(category.icon)}
                          <span className="text-xs text-center">
                            {category.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.categoryId && (
                    <div className="text-sm text-red-500 flex items-center mt-1 mb-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.categoryId.message}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="INCOME">
                  {isLoadingCategories ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex justify-center items-center py-8 text-center">
                      <div>
                        <p className="mb-2">No income categories found</p>
                        <p className="text-sm text-muted-foreground">
                          Please create categories in the category management
                          section
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 my-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer border transition-colors ${
                            categoryId === category.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            console.log("Setting categoryId to:", category.id);
                            form.setValue("categoryId", category.id);
                            // Clear any previous error
                            form.clearErrors("categoryId");
                          }}
                        >
                          {getIconComponent(category.icon)}
                          <span className="text-xs text-center">
                            {category.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.categoryId && (
                    <div className="text-sm text-red-500 flex items-center mt-1 mb-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.categoryId.message}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <div className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.amount.message}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...form.register("date")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billId">Bill ID (optional)</Label>
                    <Input id="billId" type="text" {...form.register("billId")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" type="text" {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional details..."
                    {...form.register("notes")}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    isEditing ? "Update Transaction" : "Add Transaction"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

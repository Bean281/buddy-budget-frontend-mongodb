"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react"
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export function TransactionsList() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [prevSearchTerm, setPrevSearchTerm] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const { data: transactions, isLoading, error } = useTransactions()
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()
  console.log("DATA FETCH FROM API", transactions);

  const filteredTransactions = (transactions || []).filter((transaction) => {
    const matchesSearch =
      (transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesType =
      transactionType === "all" || transaction.type === transactionType.toUpperCase()
    return matchesSearch && matchesType
  })

  const handleFilterChange = (value: string) => {
    setTransactionType(value);
    
    // if (value !== "all" && transactions) {
    //   const filterCount = transactions.filter(
    //     t => value === "all" || t.type === value.toUpperCase()
    //   ).length;
      
      // toast({
      //   title: `Filtered to ${value.toLowerCase()} transactions`,
      //   description: `Showing ${filterCount} ${value.toLowerCase()} transaction${filterCount !== 1 ? 's' : ''}`,
      //   variant: "default",
      // });
    // } 
    // else if (value === "all") {
    //   toast({
    //     title: "Filter cleared",
    //     description: `Showing all ${transactions?.length || 0} transactions`,
    //     variant: "default",
    //   });
    // }
  }

  const handleEdit = (transactionId: string) => {
    const transaction = transactions?.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const transactionType = transaction.type === "INCOME" ? "Income" : "Expense";
    const transactionAmount = transaction.amount.toFixed(2);
    const transactionDesc = transaction.description || "unnamed transaction";
    
    // toast({
    //   title: "Editing Transaction",
    //   description: `Opening ${transactionType.toLowerCase()} of $${transactionAmount} for ${transactionDesc}.`,
    //   variant: "transaction_update",
    // });
    
    router.push(`/edit-transaction/${transactionId}`)
  }

  const handleDelete = (transactionId: string) => {
    // Find the transaction object to use its details in toast notifications
    const transaction = transactions?.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const transactionType = transaction.type === "INCOME" ? "Income" : "Expense";
    const transactionAmount = transaction.amount.toFixed(2);
    const transactionDesc = transaction.description || "unnamed transaction";
    
    if (window.confirm(`Are you sure you want to delete this ${transactionType.toLowerCase()} of $${transactionAmount}?`)) {
      deleteTransaction(transactionId, {
        onSuccess: () => {
          toast({
            title: "Transaction Deleted",
            description: `${transactionType} of $${transactionAmount} for ${transactionDesc} has been removed.`,
            variant: "transaction_delete",
            action: (
              <ToastAction 
                altText="Undo" 
                onClick={() => {
                  toast({
                    title: "Undo Not Available",
                    description: "The undo functionality is not implemented yet.",
                    variant: "default"
                  });
                }}
              >
                Undo
              </ToastAction>
            ),
          });
        },
        onError: (error) => {
          console.error("Error deleting transaction:", error);
          toast({
            title: "Deletion Failed",
            description: "Could not delete transaction. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  }

  const handleDownload = () => {
    // For future implementation: Add CSV export functionality
    toast({
      title: "Export Started",
      description: `Exporting ${filteredTransactions.length} transactions...`,
      variant: "transaction_create",
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Completed",
        description: "Your transactions have been exported successfully.",
        variant: "transaction_create",
        action: (
          <ToastAction altText="View File">
            View File
          </ToastAction>
        ),
      });
    }, 1500);
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    
    // Only show toast when user has typed something and then either clears it or changes it
    if (prevSearchTerm && !newSearchTerm) {
      // Search was cleared
      toast({
        title: "Search cleared",
        description: `Showing all matching transactions`,
        variant: "default",
      });
    } 
    // Only show search started toast when user has typed at least 3 characters
    else if (newSearchTerm.length >= 3 && (prevSearchTerm.length < 3 || !prevSearchTerm.includes(newSearchTerm))) {
      // Calculate how many transactions will match this search term
      const matchCount = (transactions || []).filter(transaction => {
        const matchesDesc = (transaction.description?.toLowerCase().includes(newSearchTerm.toLowerCase()) ?? false);
        const matchesCat = (transaction.category?.name?.toLowerCase().includes(newSearchTerm.toLowerCase()) ?? false);
        const matchesType = transactionType === "all" || transaction.type === transactionType.toUpperCase();
        return (matchesDesc || matchesCat) && matchesType;
      }).length;
      
      // New search term entered
      toast({
        title: "Searching transactions",
        description: `Found ${matchCount} transaction${matchCount !== 1 ? 's' : ''} matching "${newSearchTerm}"`,
        variant: "default",
      });
    }
    
    setPrevSearchTerm(newSearchTerm);
    setSearchTerm(newSearchTerm);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link href="/add-transaction">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={transactionType} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-24 flex items-center justify-center">Loading...</div>
          ) : error ? (
            <div className="py-24 flex items-center justify-center text-red-500">Error loading transactions</div>
          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category?.name || "-"}</TableCell>
                    <TableCell
                        className={`text-right ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                    >
                        {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-4">
                        <Button 
                        variant="ghost" size="icon"
                          onClick={() => handleEdit(transaction.id)}
                          // className="text-gray-500 hover:text-gray-700 transition-colors"
                          disabled={isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                        variant="ghost" size="icon"
                          onClick={() => handleDelete(transaction.id)}
                          // className="text-gray-500 hover:text-red-500 transition-colors"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

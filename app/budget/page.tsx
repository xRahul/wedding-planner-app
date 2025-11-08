'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetCategory {
  id: string;
  name: string;
  description: string | null;
  allocatedAmount: string;
  order: number;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  estimatedAmount: string;
  actualAmount: string | null;
}

interface Expense {
  id: string;
  categoryId: string | null;
  budgetItemId: string | null;
  vendorId: string | null;
  amount: string;
  currency: string;
  description: string;
  expenseDate: string;
  paymentMethod: string | null;
  notes: string | null;
}

interface BudgetData {
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function BudgetPage() {
  const user = useUser({ or: 'redirect' });
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    allocatedAmount: '',
  });
  const [expenseForm, setExpenseForm] = useState({
    categoryId: '',
    budgetItemId: '',
    vendorId: '',
    amount: '',
    currency: 'INR',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: '',
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    estimatedAmount: '',
    actualAmount: '',
    vendorId: '',
    notes: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchBudget();
    }
  }, [weddingId]);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    }
  }

  async function fetchBudget() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setBudgetData(data.data);
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCategoryDialog(category?: BudgetCategory) {
    if (category) {
      setSelectedCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        allocatedAmount: category.allocatedAmount,
      });
    } else {
      setSelectedCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        allocatedAmount: '',
      });
    }
    setIsCategoryDialogOpen(true);
  }

  function openExpenseDialog() {
    setExpenseForm({
      categoryId: '',
      budgetItemId: '',
      vendorId: '',
      amount: '',
      currency: 'INR',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      notes: '',
    });
    setIsExpenseDialogOpen(true);
  }

  function openItemDialog(categoryId: string) {
    setSelectedCategory(budgetData?.categories.find((c) => c.id === categoryId) || null);
    setItemForm({
      name: '',
      description: '',
      estimatedAmount: '',
      actualAmount: '',
      vendorId: '',
      notes: '',
    });
    setIsItemDialogOpen(true);
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...categoryForm,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCategoryDialogOpen(false);
        fetchBudget();
      } else {
        alert(data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  }

  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    try {
      const response = await fetch('/api/budget/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...expenseForm,
          categoryId: expenseForm.categoryId || null,
          budgetItemId: expenseForm.budgetItemId || null,
          vendorId: expenseForm.vendorId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsExpenseDialogOpen(false);
        fetchBudget();
      } else {
        alert(data.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const response = await fetch('/api/budget/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          ...itemForm,
          estimatedAmount: itemForm.estimatedAmount,
          actualAmount: itemForm.actualAmount || null,
          vendorId: itemForm.vendorId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsItemDialogOpen(false);
        fetchBudget();
      } else {
        alert(data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  }

  const spentPercentage = budgetData?.totalBudget
    ? (budgetData.totalSpent / budgetData.totalBudget) * 100
    : 0;

  const chartData = budgetData?.categories.map((cat) => {
    const categoryExpenses = budgetData.expenses
      .filter((exp) => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      name: cat.name,
      allocated: parseFloat(cat.allocatedAmount),
      spent: categoryExpenses,
      remaining: parseFloat(cat.allocatedAmount) - categoryExpenses,
    };
  }) || [];

  const pieData = budgetData?.categories.map((cat) => {
    const categoryExpenses = budgetData.expenses
      .filter((exp) => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      name: cat.name,
      value: categoryExpenses || 0,
    };
  }) || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Budget</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Track your wedding expenses and budget
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => openCategoryDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Budget Category</DialogTitle>
                      <DialogDescription>
                        Create a new budget category
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit}>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name *</Label>
                          <Input
                            id="categoryName"
                            value={categoryForm.name}
                            onChange={(e) =>
                              setCategoryForm({ ...categoryForm, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescription">Description</Label>
                          <Textarea
                            id="categoryDescription"
                            value={categoryForm.description}
                            onChange={(e) =>
                              setCategoryForm({ ...categoryForm, description: e.target.value })
                            }
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="allocatedAmount">Allocated Amount *</Label>
                          <Input
                            id="allocatedAmount"
                            type="number"
                            step="0.01"
                            value={categoryForm.allocatedAmount}
                            onChange={(e) =>
                              setCategoryForm({ ...categoryForm, allocatedAmount: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCategoryDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Category</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button onClick={openExpenseDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : budgetData ? (
              <>
                <div className="mb-6 grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(budgetData.totalBudget)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(budgetData.totalSpent)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {spentPercentage.toFixed(1)}% of budget
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${
                          budgetData.remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(budgetData.remaining)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget vs Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                          <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {budgetData.categories.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        No budget categories yet. Create your first category to get started.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {budgetData.categories.map((category) => {
                          const categoryExpenses = budgetData.expenses
                            .filter((exp) => exp.categoryId === category.id)
                            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                          const categorySpent = categoryExpenses;
                          const categoryRemaining =
                            parseFloat(category.allocatedAmount) - categorySpent;
                          const categoryPercentage =
                            parseFloat(category.allocatedAmount) > 0
                              ? (categorySpent / parseFloat(category.allocatedAmount)) * 100
                              : 0;

                          return (
                            <div
                              key={category.id}
                              className="rounded-lg border p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{category.name}</h3>
                                  {category.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {category.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openItemDialog(category.id)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Item
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Allocated
                                  </p>
                                  <p className="font-semibold">
                                    {formatCurrency(parseFloat(category.allocatedAmount))}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
                                  <p className="font-semibold">
                                    {formatCurrency(categorySpent)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Remaining
                                  </p>
                                  <p
                                    className={`font-semibold ${
                                      categoryRemaining < 0 ? 'text-red-600' : 'text-green-600'
                                    }`}
                                  >
                                    {formatCurrency(categoryRemaining)}
                                  </p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    categoryPercentage > 100
                                      ? 'bg-red-600'
                                      : categoryPercentage > 80
                                      ? 'bg-yellow-600'
                                      : 'bg-green-600'
                                  }`}
                                  style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500">
                                {categoryPercentage.toFixed(1)}% spent
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {budgetData.expenses.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        No expenses yet. Add your first expense to get started.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">
                                Description
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">
                                Payment Method
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {budgetData.expenses
                              .sort(
                                (a, b) =>
                                  new Date(b.expenseDate).getTime() -
                                  new Date(a.expenseDate).getTime()
                              )
                              .slice(0, 10)
                              .map((expense) => {
                                const category = budgetData.categories.find(
                                  (c) => c.id === expense.categoryId
                                );
                                return (
                                  <tr
                                    key={expense.id}
                                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <td className="px-4 py-3">
                                      {formatDate(expense.expenseDate)}
                                    </td>
                                    <td className="px-4 py-3">{expense.description}</td>
                                    <td className="px-4 py-3">
                                      {formatCurrency(parseFloat(expense.amount), expense.currency)}
                                    </td>
                                    <td className="px-4 py-3">
                                      {category?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                      {expense.paymentMethod || '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No budget data available.
                </CardContent>
              </Card>
            )}

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>Record a new expense</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="expenseDescription">Description *</Label>
                      <Input
                        id="expenseDescription"
                        value={expenseForm.description}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expenseAmount">Amount *</Label>
                        <Input
                          id="expenseAmount"
                          type="number"
                          step="0.01"
                          value={expenseForm.amount}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, amount: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="expenseCurrency">Currency</Label>
                        <Select
                          value={expenseForm.currency}
                          onValueChange={(value) =>
                            setExpenseForm({ ...expenseForm, currency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expenseCategory">Category</Label>
                        <Select
                          value={expenseForm.categoryId}
                          onValueChange={(value) =>
                            setExpenseForm({ ...expenseForm, categoryId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetData?.categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expenseDate">Date</Label>
                        <Input
                          id="expenseDate"
                          type="date"
                          value={expenseForm.expenseDate}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, expenseDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={expenseForm.paymentMethod}
                        onValueChange={(value) =>
                          setExpenseForm({ ...expenseForm, paymentMethod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expenseNotes">Notes</Label>
                      <Textarea
                        id="expenseNotes"
                        value={expenseForm.notes}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsExpenseDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Expense</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Add Budget Item - {selectedCategory?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Add a budget item to this category
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleItemSubmit}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="itemName">Item Name *</Label>
                      <Input
                        id="itemName"
                        value={itemForm.name}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemDescription">Description</Label>
                      <Textarea
                        id="itemDescription"
                        value={itemForm.description}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, description: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estimatedAmount">Estimated Amount *</Label>
                        <Input
                          id="estimatedAmount"
                          type="number"
                          step="0.01"
                          value={itemForm.estimatedAmount}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, estimatedAmount: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="actualAmount">Actual Amount</Label>
                        <Input
                          id="actualAmount"
                          type="number"
                          step="0.01"
                          value={itemForm.actualAmount}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, actualAmount: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="itemNotes">Notes</Label>
                      <Textarea
                        id="itemNotes"
                        value={itemForm.notes}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, notes: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsItemDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}

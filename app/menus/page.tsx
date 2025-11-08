'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UtensilsCrossed, Plus, Edit, Trash2, Check, X, Filter } from 'lucide-react';

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isJain: boolean;
  isGlutenFree: boolean;
  servingSize?: string;
  quantity?: number;
  order?: number;
}

interface Menu {
  id: string;
  name: string;
  description?: string;
  eventId?: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  items: MenuItem[];
}

interface Event {
  id: string;
  name: string;
  eventType: string;
}

export default function MenusPage() {
  const user = useUser({ or: 'redirect' });
  const [menus, setMenus] = useState<Menu[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedMenuForItem, setSelectedMenuForItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [guestCount, setGuestCount] = useState<number>(0);
  const [showQuantityCalculator, setShowQuantityCalculator] = useState<boolean>(false);

  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    eventId: '',
  });

  const [itemForm, setItemForm] = useState<MenuItem>({
    name: '',
    description: '',
    category: '',
    isVegetarian: true,
    isVegan: false,
    isJain: false,
    isGlutenFree: false,
    servingSize: '',
    quantity: undefined,
    order: 0,
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchMenus();
      fetchEvents();
      fetchGuestCount();
    }
  }, [weddingId]);

  useEffect(() => {
    if (menuForm.eventId) {
      fetchGuestCount(menuForm.eventId);
    } else {
      fetchGuestCount();
    }
  }, [menuForm.eventId]);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    if (!weddingId) return;
    try {
      const res = await fetch(`/api/events?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  async function fetchGuestCount(eventId?: string) {
    if (!weddingId) return;
    try {
      const res = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        const confirmedGuests = data.data.filter((g: any) => g.rsvpStatus === 'confirmed').length;
        const plusOnes = data.data.filter((g: any) => g.rsvpStatus === 'confirmed' && g.plusOne).length;
        const totalCount = confirmedGuests + plusOnes;
        
        // If event is selected, use event's expected guests if available
        if (eventId) {
          const event = events.find((e) => e.id === eventId);
          if (event && (event as any).expectedGuests) {
            setGuestCount((event as any).expectedGuests);
            return;
          }
        }
        
        setGuestCount(totalCount);
      }
    } catch (error) {
      console.error('Error fetching guest count:', error);
    }
  }

  function calculateQuantity(servingSize?: string, baseQuantity?: number): number {
    if (!guestCount || !servingSize) return baseQuantity || 0;
    
    // Parse serving size (e.g., "per person", "per 2 people", "per plate")
    const perPersonMatch = servingSize.match(/per\s+(\d+)/i);
    const perPerson = perPersonMatch ? parseInt(perPersonMatch[1]) : 1;
    
    // Calculate quantity based on guest count
    const calculated = Math.ceil(guestCount / perPerson);
    
    // If base quantity is provided, use it as multiplier
    if (baseQuantity) {
      return calculated * baseQuantity;
    }
    
    return calculated;
  }

  async function fetchMenus() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menus?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  }

  function openMenuDialog(menu?: Menu) {
    if (menu) {
      setSelectedMenu(menu);
      setMenuForm({
        name: menu.name,
        description: menu.description || '',
        eventId: menu.eventId || '',
      });
    } else {
      setSelectedMenu(null);
      setMenuForm({ name: '', description: '', eventId: '' });
    }
    setIsMenuDialogOpen(true);
  }

  function closeMenuDialog() {
    setIsMenuDialogOpen(false);
    setSelectedMenu(null);
    setMenuForm({ name: '', description: '', eventId: '' });
  }

  async function handleMenuSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !menuForm.name) return;

    try {
      const url = selectedMenu
        ? `/api/menus/${selectedMenu.id}`
        : '/api/menus';
      const method = selectedMenu ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          eventId: menuForm.eventId || null,
          name: menuForm.name,
          description: menuForm.description || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchMenus();
        closeMenuDialog();
      } else {
        alert(data.error || 'Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Failed to save menu');
    }
  }

  async function handleDeleteMenu(menuId: string) {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchMenus();
      } else {
        alert(data.error || 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Failed to delete menu');
    }
  }

  function openItemDialog(menuId: string, item?: MenuItem) {
    setSelectedMenuForItem(menuId);
    if (item) {
      setSelectedItem(item);
      setItemForm({ ...item });
    } else {
      setSelectedItem(null);
      setItemForm({
        name: '',
        description: '',
        category: '',
        isVegetarian: true,
        isVegan: false,
        isJain: false,
        isGlutenFree: false,
        servingSize: '',
        quantity: undefined,
        order: 0,
      });
    }
    setIsItemDialogOpen(true);
  }

  function closeItemDialog() {
    setIsItemDialogOpen(false);
    setSelectedMenuForItem(null);
    setSelectedItem(null);
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMenuForItem || !itemForm.name) return;

    try {
      if (selectedItem?.id) {
        // Update existing item
        const res = await fetch(`/api/menus/items/${selectedItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });

        const data = await res.json();
        if (data.success) {
          await fetchMenus();
          closeItemDialog();
        } else {
          alert(data.error || 'Failed to save menu item');
        }
      } else {
        // Create new item
        const res = await fetch(`/api/menus/${selectedMenuForItem}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemForm),
        });

        const data = await res.json();
        if (data.success) {
          await fetchMenus();
          closeItemDialog();
        } else {
          alert(data.error || 'Failed to create menu item');
        }
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  }

  async function handleDeleteItem(menuId: string, itemId: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const res = await fetch(`/api/menus/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchMenus();
      } else {
        alert(data.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  }

  async function handleApproveMenu(menuId: string, approved: boolean) {
    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchMenus();
      } else {
        alert(data.error || 'Failed to update menu approval');
      }
    } catch (error) {
      console.error('Error updating menu approval:', error);
      alert('Failed to update menu approval');
    }
  }

  function filterMenuItems(items: MenuItem[]) {
    if (dietaryFilter === 'all') return items;
    return items.filter((item) => {
      switch (dietaryFilter) {
        case 'vegetarian':
          return item.isVegetarian;
        case 'vegan':
          return item.isVegan;
        case 'jain':
          return item.isJain;
        case 'gluten-free':
          return item.isGlutenFree;
        default:
          return true;
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Menus</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Plan menus for each event with dietary filters and quantity calculations
                </p>
              </div>
              <Button onClick={() => openMenuDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu
              </Button>
            </div>

            {menus.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No menus found. Create your first menu to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {menus.map((menu) => {
                  const filteredItems = filterMenuItems(menu.items);
                  const event = events.find((e) => e.id === menu.eventId);

                  return (
                    <Card key={menu.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">{menu.name}</CardTitle>
                              {menu.approved && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <Check className="h-3 w-3" />
                                  Approved
                                </span>
                              )}
                            </div>
                            {event && (
                              <CardDescription className="mt-1">
                                Event: {event.name} ({event.eventType})
                              </CardDescription>
                            )}
                            {menu.description && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {menu.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveMenu(menu.id, !menu.approved)}
                            >
                              {menu.approved ? (
                                <>
                                  <X className="mr-1 h-3 w-3" />
                                  Unapprove
                                </>
                              ) : (
                                <>
                                  <Check className="mr-1 h-3 w-3" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMenuDialog(menu)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMenu(menu.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                              value={dietaryFilter}
                              onChange={(e) => setDietaryFilter(e.target.value)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                              <option value="all">All Items</option>
                              <option value="vegetarian">Vegetarian</option>
                              <option value="vegan">Vegan</option>
                              <option value="jain">Jain</option>
                              <option value="gluten-free">Gluten-Free</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowQuantityCalculator(!showQuantityCalculator)}
                            >
                              Calculator
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openItemDialog(menu.id)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Item
                            </Button>
                          </div>
                        </div>

                        {showQuantityCalculator && (
                          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium">Quantity Calculator</span>
                              <button
                                onClick={() => setShowQuantityCalculator(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                ×
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400">
                                  Expected Guest Count
                                </label>
                                <input
                                  type="number"
                                  value={guestCount}
                                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                                  min="0"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Quantities will be calculated based on serving sizes and guest count
                              </p>
                            </div>
                          </div>
                        )}

                        {filteredItems.length === 0 ? (
                          <div className="py-4 text-center text-sm text-gray-500">
                            No menu items found.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredItems.map((item, index) => (
                              <div
                                key={item.id || index}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.name}</span>
                                    {item.isVegetarian && (
                                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Veg
                                      </span>
                                    )}
                                    {item.isVegan && (
                                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        Vegan
                                      </span>
                                    )}
                                    {item.isJain && (
                                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                        Jain
                                      </span>
                                    )}
                                    {item.isGlutenFree && (
                                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                        GF
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="mt-1 flex gap-4 text-xs text-gray-500">
                                    {item.category && <span>Category: {item.category}</span>}
                                    {item.servingSize && <span>Serving: {item.servingSize}</span>}
                                    <span className="font-medium">
                                      Quantity: {item.quantity || (item.servingSize ? calculateQuantity(item.servingSize) : 'Not set')}
                                      {item.servingSize && guestCount > 0 && !item.quantity && (
                                        <span className="ml-1 text-blue-600">(calculated)</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {item.id && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openItemDialog(menu.id, item)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteItem(menu.id, item.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Menu Dialog */}
            <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedMenu ? 'Edit Menu' : 'Create New Menu'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or edit a menu for your wedding event
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMenuSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Menu Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={menuForm.name}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Mehendi Feast, Wedding Dinner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event (Optional)
                      </label>
                      <select
                        value={menuForm.eventId}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, eventId: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <option value="">No specific event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name} ({event.eventType})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={menuForm.description}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, description: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Menu description..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeMenuDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Menu</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Menu Item Dialog */}
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </DialogTitle>
                  <DialogDescription>
                    Add or edit an item in the menu
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleItemSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={itemForm.name}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Butter Chicken, Dal Makhani"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={itemForm.description || ''}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, description: e.target.value })
                        }
                        rows={2}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Item description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        <select
                          value={itemForm.category || ''}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, category: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">Select category</option>
                          <option value="appetizer">Appetizer</option>
                          <option value="main_course">Main Course</option>
                          <option value="dessert">Dessert</option>
                          <option value="beverage">Beverage</option>
                          <option value="bread">Bread</option>
                          <option value="rice">Rice</option>
                          <option value="salad">Salad</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Serving Size
                        </label>
                        <input
                          type="text"
                          value={itemForm.servingSize || ''}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, servingSize: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="e.g., Per person, Per plate"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={itemForm.quantity || ''}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                quantity: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                            placeholder="Quantity needed"
                          />
                          {itemForm.servingSize && guestCount > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const calculated = calculateQuantity(itemForm.servingSize);
                                setItemForm({ ...itemForm, quantity: calculated });
                              }}
                              title="Calculate based on guest count"
                            >
                              Calc
                            </Button>
                          )}
                        </div>
                        {itemForm.servingSize && guestCount > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Suggested: {calculateQuantity(itemForm.servingSize)} (for {guestCount} guests)
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Order
                        </label>
                        <input
                          type="number"
                          value={itemForm.order || 0}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              order: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Dietary Options
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemForm.isVegetarian}
                            onChange={(e) =>
                              setItemForm({ ...itemForm, isVegetarian: e.target.checked })
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Vegetarian</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemForm.isVegan}
                            onChange={(e) =>
                              setItemForm({ ...itemForm, isVegan: e.target.checked })
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Vegan</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemForm.isJain}
                            onChange={(e) =>
                              setItemForm({ ...itemForm, isJain: e.target.checked })
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Jain</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemForm.isGlutenFree}
                            onChange={(e) =>
                              setItemForm({ ...itemForm, isGlutenFree: e.target.checked })
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Gluten-Free</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeItemDialog}
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

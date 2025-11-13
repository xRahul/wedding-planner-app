// Unit Tests for Analytics Dashboard Components

const AnalyticsTests = {
    results: [],
    
    assertEqual(actual, expected, testName) {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            this.results.push({ name: testName, status: 'pass', message: 'Test passed' });
            return true;
        } else {
            this.results.push({ 
                name: testName, 
                status: 'fail', 
                message: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}` 
            });
            return false;
        }
    },
    
    assertTrue(condition, testName, message = '') {
        if (condition) {
            this.results.push({ name: testName, status: 'pass', message: 'Test passed' });
            return true;
        } else {
            this.results.push({ name: testName, status: 'fail', message: message || 'Condition was false' });
            return false;
        }
    },
    
    reset() {
        this.results = [];
    },
    
    testTaskCompletionEmpty() {
        const data = { tasks: [] };
        const stats = this.calculateTaskStats(data);
        this.assertEqual(stats.total, 0, 'Task Completion: Empty tasks array');
        this.assertEqual(stats.completed, 0, 'Task Completion: No completed tasks');
        this.assertEqual(stats.overdue, 0, 'Task Completion: No overdue tasks');
    },
    
    testTaskCompletionBasic() {
        const data = {
            tasks: [
                { status: 'done', priority: 'high', category: 'vendor' },
                { status: 'pending', priority: 'medium', category: 'vendor', deadline: '2020-01-01' },
                { status: 'done', priority: 'low', category: 'shopping' }
            ]
        };
        const stats = this.calculateTaskStats(data);
        this.assertEqual(stats.total, 3, 'Task Completion: Total count');
        this.assertEqual(stats.completed, 2, 'Task Completion: Completed count');
        this.assertEqual(stats.overdue, 1, 'Task Completion: Overdue count');
    },
    
    testTaskCompletionByPriority() {
        const data = {
            tasks: [
                { status: 'done', priority: 'high', category: 'vendor' },
                { status: 'pending', priority: 'high', category: 'vendor' },
                { status: 'done', priority: 'medium', category: 'shopping' }
            ]
        };
        const stats = this.calculateTaskStats(data);
        this.assertEqual(stats.byPriority.high, 2, 'Task Completion: High priority count');
        this.assertEqual(stats.completedByPriority.high, 1, 'Task Completion: High priority completed');
    },
    
    testGuestAnalyticsEmpty() {
        const data = { guests: [] };
        const stats = this.calculateGuestStats(data);
        this.assertEqual(stats.totalFamilies, 0, 'Guest Analytics: No families');
        this.assertEqual(stats.totalSingles, 0, 'Guest Analytics: No singles');
        this.assertEqual(stats.totalIndividuals, 0, 'Guest Analytics: No individuals');
    },
    
    testGuestAnalyticsBasic() {
        const data = {
            guests: [
                { type: 'single', rsvpStatus: 'yes', side: 'bride', category: 'family', dietary: 'veg', needsAccommodation: true, aadharCollected: true },
                { type: 'family', rsvpStatus: 'pending', side: 'groom', category: 'friends', familyMembers: [{ dietary: 'jain', aadharCollected: false }], needsAccommodation: false, aadharCollected: true }
            ]
        };
        const stats = this.calculateGuestStats(data);
        this.assertEqual(stats.totalSingles, 1, 'Guest Analytics: Singles count');
        this.assertEqual(stats.totalFamilies, 1, 'Guest Analytics: Families count');
        this.assertEqual(stats.totalIndividuals, 3, 'Guest Analytics: Total individuals');
    },
    
    testGuestAnalyticsRSVP() {
        const data = {
            guests: [
                { type: 'single', rsvpStatus: 'yes', side: 'bride', category: 'family' },
                { type: 'family', rsvpStatus: 'yes', side: 'groom', category: 'friends', familyMembers: [{}, {}] },
                { type: 'single', rsvpStatus: 'pending', side: 'bride', category: 'family' }
            ]
        };
        const stats = this.calculateGuestStats(data);
        this.assertEqual(stats.rsvp.yes, 2, 'Guest Analytics: RSVP yes count');
        this.assertEqual(stats.rsvpPeople.yes, 4, 'Guest Analytics: RSVP yes people');
    },
    
    testGuestAnalyticsDietary() {
        const data = {
            guests: [
                { type: 'single', rsvpStatus: 'yes', side: 'bride', category: 'family', dietary: 'veg' },
                { type: 'family', rsvpStatus: 'yes', side: 'groom', category: 'friends', dietary: 'jain', familyMembers: [{ dietary: 'veg' }, { dietary: 'jain' }] }
            ]
        };
        const stats = this.calculateGuestStats(data);
        this.assertEqual(stats.dietary.veg, 2, 'Guest Analytics: Veg count');
        this.assertEqual(stats.dietary.jain, 2, 'Guest Analytics: Jain count');
    },
    
    testBudgetHealthEmpty() {
        const data = { budget: [], weddingInfo: { totalBudget: 0 }, vendors: [], menus: [], giftsAndFavors: {}, shopping: {}, travel: {} };
        const stats = this.calculateBudgetStats(data);
        this.assertEqual(stats.totalBudget, 0, 'Budget Health: Empty budget');
        this.assertEqual(stats.totalSpent, 0, 'Budget Health: No spending');
    },
    
    testBudgetHealthBasic() {
        const data = {
            budget: [
                { category: 'venue', planned: 100000, actual: 90000 },
                { category: 'catering', planned: 50000, actual: 55000 }
            ],
            weddingInfo: { totalBudget: 200000, brideBudget: 100000, groomBudget: 100000 },
            vendors: [],
            menus: [],
            giftsAndFavors: {},
            shopping: {},
            travel: { transport: [] },
            guests: [{ rsvpStatus: 'yes', type: 'single' }]
        };
        const stats = this.calculateBudgetStats(data);
        this.assertEqual(stats.totalBudget, 200000, 'Budget Health: Total budget');
        this.assertEqual(stats.totalSpent, 145000, 'Budget Health: Total spent');
        this.assertTrue(stats.utilization === '72.5', 'Budget Health: Utilization percentage', `Expected 72.5, got ${stats.utilization}`);
    },
    
    testBudgetHealthLinkedVendors() {
        const data = {
            budget: [],
            weddingInfo: { totalBudget: 100000, brideBudget: 50000, groomBudget: 50000 },
            vendors: [
                { budgetCategory: 'venue', finalCost: 30000, paymentResponsibility: 'bride' },
                { budgetCategory: 'catering', estimatedCost: 20000, paymentResponsibility: 'groom' }
            ],
            menus: [],
            giftsAndFavors: {},
            shopping: {},
            travel: { transport: [] },
            guests: [{ rsvpStatus: 'yes', type: 'single' }]
        };
        const stats = this.calculateBudgetStats(data);
        this.assertEqual(stats.totalLinkedActual, 30000, 'Budget Health: Linked vendor costs');
        this.assertEqual(stats.brideActual, 30000, 'Budget Health: Bride side spending');
        this.assertEqual(stats.groomActual, 0, 'Budget Health: Groom side spending');
    },
    
    testVendorPerformanceEmpty() {
        const data = { vendors: [] };
        const stats = this.calculateVendorStats(data);
        this.assertEqual(stats.total, 0, 'Vendor Performance: No vendors');
        this.assertEqual(stats.confirmed, 0, 'Vendor Performance: No confirmed');
    },
    
    testVendorPerformanceBasic() {
        const data = {
            vendors: [
                { status: 'confirmed', type: 'photographer', finalCost: 50000 },
                { status: 'pending', type: 'caterer', estimatedCost: 100000 },
                { status: 'confirmed', type: 'photographer', finalCost: 30000 }
            ]
        };
        const stats = this.calculateVendorStats(data);
        this.assertEqual(stats.total, 3, 'Vendor Performance: Total vendors');
        this.assertEqual(stats.confirmed, 2, 'Vendor Performance: Confirmed vendors');
        this.assertEqual(stats.pending, 1, 'Vendor Performance: Pending vendors');
        this.assertEqual(stats.totalCost, 180000, 'Vendor Performance: Total cost');
    },
    
    testVendorPerformanceByType() {
        const data = {
            vendors: [
                { status: 'confirmed', type: 'photographer', finalCost: 50000 },
                { status: 'confirmed', type: 'photographer', finalCost: 30000 },
                { status: 'pending', type: 'caterer', estimatedCost: 100000 }
            ]
        };
        const stats = this.calculateVendorStats(data);
        this.assertEqual(stats.byType.photographer.count, 2, 'Vendor Performance: Photographer count');
        this.assertEqual(stats.byType.photographer.cost, 80000, 'Vendor Performance: Photographer cost');
    },
    
    calculateTaskStats(data) {
        const tasks = data.tasks || [];
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const overdue = tasks.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < new Date()).length;
        
        const byPriority = { high: 0, medium: 0, low: 0 };
        const completedByPriority = { high: 0, medium: 0, low: 0 };
        tasks.forEach(t => {
            byPriority[t.priority]++;
            if (t.status === 'done') completedByPriority[t.priority]++;
        });
        
        return { total, completed, overdue, byPriority, completedByPriority };
    },
    
    calculateGuestStats(data) {
        const guests = data.guests || [];
        const totalFamilies = guests.filter(g => g.type === 'family').length;
        const totalSingles = guests.filter(g => g.type === 'single').length;
        const totalIndividuals = guests.reduce((sum, g) => {
            if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
            return sum + 1;
        }, 0);
        
        const rsvp = { yes: 0, pending: 0, no: 0 };
        const rsvpPeople = { yes: 0, pending: 0, no: 0 };
        guests.forEach(g => {
            rsvp[g.rsvpStatus]++;
            if (g.type === 'family') {
                rsvpPeople[g.rsvpStatus] += 1 + (g.familyMembers?.length || 0);
            } else {
                rsvpPeople[g.rsvpStatus]++;
            }
        });
        
        const bySide = { bride: 0, groom: 0 };
        guests.forEach(g => bySide[g.side]++);
        
        const dietary = { veg: 0, jain: 0, other: 0 };
        guests.forEach(g => {
            if (g.dietary) dietary[g.dietary]++;
            if (g.type === 'family' && g.familyMembers) {
                g.familyMembers.forEach(m => { if (m.dietary) dietary[m.dietary]++; });
            }
        });
        
        const needsRoom = guests.filter(g => g.needsAccommodation).length;
        const aadharCollected = guests.reduce((sum, g) => {
            let count = g.aadharCollected ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.aadharCollected).length;
            }
            return sum + count;
        }, 0);
        
        return { totalFamilies, totalSingles, totalIndividuals, rsvp, rsvpPeople, bySide, dietary, needsRoom, aadharCollected };
    },
    
    calculateBudgetStats(data) {
        const budget = data.budget || [];
        const totalBudget = data.weddingInfo?.totalBudget || 0;
        const totalSpent = budget.reduce((sum, cat) => sum + (cat.actual || 0), 0);
        
        let totalLinkedActual = 0;
        let brideActual = 0;
        let groomActual = 0;
        
        data.vendors?.forEach(v => {
            if (v.budgetCategory) {
                const cost = v.finalCost || 0;
                totalLinkedActual += cost;
                if (v.paymentResponsibility === 'bride') brideActual += cost;
                else if (v.paymentResponsibility === 'groom') groomActual += cost;
                else if (v.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
            }
        });
        
        const totalActualSpent = totalSpent + totalLinkedActual;
        const utilization = totalBudget > 0 ? (totalActualSpent / totalBudget * 100).toFixed(1) : '0';
        
        const brideBudget = data.weddingInfo?.brideBudget || 0;
        const groomBudget = data.weddingInfo?.groomBudget || 0;
        
        const guestCount = data.guests?.reduce((sum, g) => {
            if (g.rsvpStatus === 'yes') {
                if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
                return sum + 1;
            }
            return sum;
        }, 0) || 1;
        
        const costPerGuest = totalActualSpent / guestCount;
        
        return { totalBudget, totalSpent, totalLinkedActual, totalActualSpent, utilization, 
                 brideActual, groomActual, brideBudget, groomBudget, costPerGuest };
    },
    
    calculateVendorStats(data) {
        const vendors = data.vendors || [];
        const total = vendors.length;
        const confirmed = vendors.filter(v => v.status === 'confirmed').length;
        const pending = vendors.filter(v => v.status === 'pending').length;
        
        const byType = {};
        vendors.forEach(v => {
            if (!byType[v.type]) byType[v.type] = { count: 0, cost: 0 };
            byType[v.type].count++;
            byType[v.type].cost += v.finalCost || v.estimatedCost || 0;
        });
        
        const totalCost = vendors.reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);
        
        return { total, confirmed, pending, byType, totalCost };
    },
    
    runAll() {
        this.reset();
        console.log('Running Analytics Dashboard Tests...');
        
        this.testTaskCompletionEmpty();
        this.testTaskCompletionBasic();
        this.testTaskCompletionByPriority();
        this.testGuestAnalyticsEmpty();
        this.testGuestAnalyticsBasic();
        this.testGuestAnalyticsRSVP();
        this.testGuestAnalyticsDietary();
        this.testBudgetHealthEmpty();
        this.testBudgetHealthBasic();
        this.testBudgetHealthLinkedVendors();
        this.testVendorPerformanceEmpty();
        this.testVendorPerformanceBasic();
        this.testVendorPerformanceByType();
        
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        
        console.log(`Tests completed: ${passed} passed, ${failed} failed`);
        return { passed, failed, results: this.results };
    }
};

window.AnalyticsTests = AnalyticsTests;

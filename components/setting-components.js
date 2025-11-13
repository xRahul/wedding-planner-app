const { useState, useEffect, useMemo } = React;

        // ==================== SETTINGS COMPONENT ====================

        const Settings = ({ weddingInfo, updateData, allData, setData, showNotification }) => {
            const [editMode, setEditMode] = useState(false);
            const [formData, setFormData] = useState(weddingInfo);
            const [testResults, setTestResults] = useState(null);
            const [runningTests, setRunningTests] = useState(false);



            const [formErrors, setFormErrors] = useState({});

            const handleSave = () => {
                const errors = validateWeddingInfo(formData);
                if (errors) {
                    setFormErrors(errors);
                    return;
                }
                updateData('weddingInfo', formData);
                setEditMode(false);
                setFormErrors({});
            };

            const handleExport = () => {
                try {
                    if (!allData || typeof allData !== 'object') {
                        alert('No data available to export.');
                        return;
                    }

                    const dataStr = JSON.stringify(allData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `wedding-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Export error:', error);
                    alert(`Failed to export data: ${error.message}`);
                }
            };

            const handleImport = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (!file.name.endsWith('.json')) {
                    alert('Please select a valid JSON file.');
                    event.target.value = '';
                    return;
                }

                if (!confirm('This will replace all current data. Are you sure?')) {
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate imported data structure
                        const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
                        const missingKeys = requiredKeys.filter(key => !importedData[key]);
                        
                        if (missingKeys.length > 0) {
                            alert(`Invalid data file. Missing required fields: ${missingKeys.join(', ')}`);
                            event.target.value = '';
                            return;
                        }

                        await saveData(importedData);
                        setData(importedData);
                        setFormData(importedData.weddingInfo);
                        showNotification('Data imported successfully!', 'success');
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            alert('Invalid JSON file. Please check the file format.');
                        } else {
                            alert(`Error importing data: ${error.message}`);
                        }
                        console.error('Import error:', error);
                    }
                    event.target.value = '';
                };
                reader.onerror = () => {
                    alert('Failed to read file. Please try again.');
                    event.target.value = '';
                };
                reader.readAsText(file);
            };

            const handleReset = async () => {
                if (confirm('This will reset all data to default values. This action cannot be undone. Are you sure?')) {
                    const resetData = { ...DEFAULT_DATA };
                    await saveData(resetData);
                    setData(resetData);
                    setFormData(resetData.weddingInfo);
                    alert('Data has been reset to defaults.');
                }
            };

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Wedding Information</h2>
                        {!editMode ? (
                            <>
                                <div className="grid-2" style={{ marginBottom: '16px' }}>
                                    <div>
                                        <p><strong>Bride's Name:</strong> {weddingInfo.brideName}</p>
                                        <p><strong>Groom's Name:</strong> {weddingInfo.groomName}</p>
                                    </div>
                                    <div>
                                        <p><strong>Wedding Date:</strong> {formatDate(weddingInfo.weddingDate)}</p>
                                        <p><strong>Location:</strong> {weddingInfo.location}</p>
                                        <p><strong>👰 Bride Budget:</strong> {formatCurrency(weddingInfo.brideBudget || 0)}</p>
                                        <p><strong>🤵 Groom Budget:</strong> {formatCurrency(weddingInfo.groomBudget || 0)}</p>
                                        <p><strong>Total Budget:</strong> {formatCurrency((weddingInfo.brideBudget || 0) + (weddingInfo.groomBudget || 0))}</p>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Information</button>
                            </>
                        ) : (
                            <>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Bride's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.brideName ? 'error' : ''}`}
                                            value={formData.brideName}
                                            onChange={e => {
                                                setFormData({ ...formData, brideName: e.target.value });
                                                if (formErrors.brideName) {
                                                    setFormErrors({ ...formErrors, brideName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.brideName && <div className="error-message">{formErrors.brideName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Groom's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.groomName ? 'error' : ''}`}
                                            value={formData.groomName}
                                            onChange={e => {
                                                setFormData({ ...formData, groomName: e.target.value });
                                                if (formErrors.groomName) {
                                                    setFormErrors({ ...formErrors, groomName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.groomName && <div className="error-message">{formErrors.groomName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Wedding Date</label>
                                        <input 
                                            type="date"
                                            className={`form-input ${formErrors.weddingDate ? 'error' : ''}`}
                                            value={formData.weddingDate}
                                            onChange={e => {
                                                setFormData({ ...formData, weddingDate: e.target.value });
                                                if (formErrors.weddingDate) {
                                                    setFormErrors({ ...formErrors, weddingDate: null });
                                                }
                                            }}
                                        />
                                        {formErrors.weddingDate && <div className="error-message">{formErrors.weddingDate}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.location ? 'error' : ''}`}
                                            value={formData.location}
                                            onChange={e => {
                                                setFormData({ ...formData, location: e.target.value });
                                                if (formErrors.location) {
                                                    setFormErrors({ ...formErrors, location: null });
                                                }
                                            }}
                                        />
                                        {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">👰 Bride Side Budget (₹)</label>
                                        <input 
                                            type="number"
                                            className={`form-input ${formErrors.brideBudget ? 'error' : ''}`}
                                            value={formData.brideBudget || 0}
                                            onChange={e => {
                                                setFormData({ ...formData, brideBudget: parseFloat(e.target.value) || 0 });
                                                if (formErrors.brideBudget) {
                                                    setFormErrors({ ...formErrors, brideBudget: null });
                                                }
                                            }}
                                        />
                                        {formErrors.brideBudget && <div className="error-message">{formErrors.brideBudget}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">🤵 Groom Side Budget (₹)</label>
                                        <input 
                                            type="number"
                                            className={`form-input ${formErrors.groomBudget ? 'error' : ''}`}
                                            value={formData.groomBudget || 0}
                                            onChange={e => {
                                                setFormData({ ...formData, groomBudget: parseFloat(e.target.value) || 0 });
                                                if (formErrors.groomBudget) {
                                                    setFormErrors({ ...formErrors, groomBudget: null });
                                                }
                                            }}
                                        />
                                        {formErrors.groomBudget && <div className="error-message">{formErrors.groomBudget}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Budget (₹)</label>
                                        <input 
                                            type="number"
                                            className="form-input"
                                            value={(formData.brideBudget || 0) + (formData.groomBudget || 0)}
                                            disabled
                                            style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}
                                        />
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Auto-calculated from bride + groom budgets</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                                    <button className="btn btn-outline" onClick={() => { setEditMode(false); setFormData(weddingInfo); }}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="card-title">Data Management</h2>
                        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            Export all your wedding data as a JSON backup file, or import previously saved data.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="btn btn-success" onClick={handleExport} style={{ flex: '1', minWidth: '200px' }}>
                                📥 Export All Data
                            </button>
                            <label className="btn btn-primary" style={{ cursor: 'pointer', flex: '1', minWidth: '200px' }}>
                                📤 Import All Data
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <button className="btn btn-danger" onClick={handleReset}>
                                🔄 Reset to Default Data
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">Data Statistics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Guests</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.guests?.length || 0}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Vendors</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.vendors?.length || 0}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Tasks</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.tasks?.length || 0}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Budget Categories</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.budget?.length || 0}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Timeline Events</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.timeline?.reduce((sum, day) => sum + (day.events?.length || 0), 0) || 0}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Transport Vehicles</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{allData.travel?.transport?.length || 0}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">🧪 Unit Tests</h2>
                        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            Run unit tests for analytics dashboard components to verify calculations are working correctly.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => {
                                setRunningTests(true);
                                setTimeout(() => {
                                    const results = window.AnalyticsTests.runAll();
                                    setTestResults(results);
                                    setRunningTests(false);
                                    if (results.failed === 0) {
                                        showNotification(`All ${results.passed} tests passed! ✅`, 'success');
                                    } else {
                                        showNotification(`${results.failed} test(s) failed. Check results below.`, 'error');
                                    }
                                }, 100);
                            }}
                            disabled={runningTests}
                        >
                            {runningTests ? '⏳ Running Tests...' : '▶️ Run Unit Tests'}
                        </button>
                        
                        {testResults && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '8px', flex: 1, textAlign: 'center', border: '2px solid var(--color-success)' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>{testResults.passed}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Passed</div>
                                    </div>
                                    <div style={{ padding: '12px', background: testResults.failed > 0 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', flex: 1, textAlign: 'center', border: testResults.failed > 0 ? '2px solid var(--color-error)' : '2px solid var(--color-border)' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: testResults.failed > 0 ? 'var(--color-error)' : 'inherit' }}>{testResults.failed}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Failed</div>
                                    </div>
                                </div>
                                
                                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', background: 'var(--color-bg-secondary)' }}>
                                    {testResults.results.map((result, idx) => (
                                        <div key={idx} style={{ 
                                            padding: '8px', 
                                            marginBottom: '8px', 
                                            borderRadius: '4px',
                                            background: result.status === 'pass' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                            borderLeft: `4px solid ${result.status === 'pass' ? 'var(--color-success)' : 'var(--color-error)'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{result.name}</span>
                                                <span style={{ fontSize: '18px' }}>{result.status === 'pass' ? '✅' : '❌'}</span>
                                            </div>
                                            {result.status === 'fail' && (
                                                <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                                                    {result.message}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="card-title">About North Indian Wedding Planner</h2>
                        <p style={{ marginBottom: '8px' }}>
                            <strong>💒 Complete North Indian Wedding Management Solution</strong>
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            Specially designed for North Indian weddings with features for traditional ceremonies, 
                            ritual management, vendor coordination, and guest management. Includes templates for 
                            common rituals like Mehendi, Sangeet, Haldi, Baraat, and Pheras.
                        </p>
                        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Key Features</div>
                            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                • Traditional ritual planning with North Indian ceremonies<br/>
                                • Vendor management with Indian wedding specific categories<br/>
                                • Guest management with family structures and gift tracking<br/>
                                • Budget tracking with wedding-specific categories<br/>
                                • Transport coordination for baraat and guest travel<br/>
                                • Menu planning with North Indian cuisine options<br/>
                                • Shopping lists with traditional outfit categories<br/>
                                • Timeline management with ceremony scheduling
                            </div>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                            💾 <strong>Data Storage:</strong> All data is stored locally in your browser. 
                            Use Export/Import to backup and restore your wedding planning data.
                        </p>
                    </div>
                </div>
            );
        };


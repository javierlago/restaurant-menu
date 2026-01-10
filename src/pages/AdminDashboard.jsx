import { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../supabase/client';
import { THEMES } from '../data/themes';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { FaEye, FaEyeSlash, FaTrash, FaPlus, FaEdit, FaTimes, FaCheck, FaUpload, FaDownload } from 'react-icons/fa';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const { menuItems, categories, toggleVisibility, updateDish, addDish, deleteDish, addCategory, updateCategory, deleteCategory, toggleCategoryVisibility } = useMenu();
    const { config, updateConfig, updateColor, uploadLogo } = useConfig();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [viewMode, setViewMode] = useState('dishes'); // 'dishes' | 'categories' | 'branding'

    // Auth State
    const [isRecovering, setIsRecovering] = useState(false); // Can "Forgot Password" mode
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('png'); // Show "New Password" inputs
    const [newPassword, setNewPassword] = useState('');

    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingDishId, setEditingDishId] = useState(null);
    const [dishForm, setDishForm] = useState({
        name: '', category: 'entrantes', price: '', description: '', allergens: '', portionSize: '', image: ''
    });
    const [imageFile, setImageFile] = useState(null);

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });
    const [categoryImageFile, setCategoryImageFile] = useState(null);

    const [logoFile, setLogoFile] = useState(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    // Check for existing session or password recovery event
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setIsAuthenticated(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                setIsAuthenticated(true);
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
            } else if (event === 'PASSWORD_RECOVERY') {
                setShowPasswordReset(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert('Error: ' + error.message);
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error de conexión');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
                redirectTo: window.location.origin + '/admin',
            });
            if (error) throw error;
            alert('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
            setIsRecovering(false);
        } catch (error) {
            alert('Error al enviar correo: ' + error.message);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            alert('Contraseña actualizada con éxito');
            setShowPasswordReset(false);
            setNewPassword('');
        } catch (error) {
            alert('Error al actualizar contraseña: ' + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    };

    // Dish Actions
    const handleEditClick = (dish) => {
        setDishForm({
            name: dish.name,
            category: dish.category,
            price: dish.price,
            description: dish.description,
            allergens: dish.allergens.join(', '),
            portionSize: dish.portionSize,
            image: dish.image // Keep URL for display
        });
        setEditingDishId(dish.id);
        setImageFile(null); // Reset file input
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveDish = (e) => {
        e.preventDefault();
        const formattedDish = {
            ...dishForm,
            price: parseFloat(dishForm.price),
            allergens: dishForm.allergens.split(',').map(s => s.trim()).filter(Boolean)
        };

        if (editingDishId) {
            updateDish(editingDishId, formattedDish, imageFile);
            alert('Plato actualizado');
        } else {
            addDish(formattedDish, imageFile);
            alert('Plato añadido');
        }
        resetForm();
    };

    const resetForm = () => {
        setDishForm({ name: '', category: categories[0]?.id || '', price: '', description: '', allergens: '', portionSize: '', image: '' });
        setEditingDishId(null);
        setImageFile(null);
        setIsFormVisible(false);
    };

    // Category Actions
    const handleEditCategoryClick = (cat) => {
        setCategoryForm({ name: cat.name, image: cat.image });
        setEditingCategoryId(cat.id);
        setCategoryImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveCategory = (e) => {
        e.preventDefault();
        if (!categoryForm.name) return;

        if (editingCategoryId) {
            updateCategory(editingCategoryId, categoryForm, categoryImageFile);
            alert('Categoría actualizada');
            setEditingCategoryId(null);
        } else {
            addCategory(categoryForm.name, categoryImageFile);
            alert('Categoría añadida');
        }
        setCategoryForm({ name: '', image: '' });
        setCategoryImageFile(null);
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;
        setIsUploadingLogo(true);
        try {
            await uploadLogo(logoFile);
            alert('Logo actualizado con éxito');
            setLogoFile(null);
        } catch (error) {
            alert('Error al actualizar logo: ' + error.message);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const downloadQRCode = async () => {
        const canvas = document.getElementById('menu-qr');
        if (!canvas) return;

        try {
            if (downloadFormat === 'png') {
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = 'menu-qr.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                const pdf = new jsPDF();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const center = pageWidth / 2;

                let yPos = 30;

                // Try to add Logo
                if (config.icon) {
                    try {
                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.src = config.icon;
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                            // Timeout after 3s
                            setTimeout(() => reject(new Error('Timeout')), 3000);
                        });

                        const imgWidth = 40;
                        const imgHeight = (img.height * imgWidth) / img.width;
                        pdf.addImage(img, 'PNG', center - (imgWidth / 2), yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 15;
                    } catch (e) {
                        console.error("Could not load logo for PDF", e);
                    }
                }

                pdf.setFontSize(24);
                pdf.text(config.restaurantName || 'Menú Digital', center, yPos, { align: 'center' });
                yPos += 20;

                const qrImage = canvas.toDataURL('image/png');
                const qrSize = 100;
                pdf.addImage(qrImage, 'PNG', center - (qrSize / 2), yPos, qrSize, qrSize);
                yPos += qrSize + 15;

                pdf.setFontSize(12);
                pdf.setTextColor(100);
                pdf.text('Escanea el código para ver nuestra carta', center, yPos, { align: 'center' });
                pdf.text(window.location.origin, center, yPos + 7, { align: 'center' });

                pdf.save('menu-qr.pdf');
            }
        } catch (error) {
            console.error("Error downloading QR:", error);
            alert("Error al descargar el archivo. Intente nuevamente.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                {isRecovering ? (
                    <form onSubmit={handleForgotPassword} className={styles.loginForm}>
                        <h2>Recuperar Contraseña</h2>
                        <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
                            Introduce tu correo para recibir un enlace de recuperación.
                        </p>
                        <input
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder="Tu Correo Electrónico"
                            className={styles.input}
                            required
                        />
                        <button type="submit" className={styles.button}>Enviar Correo</button>
                        <button
                            type="button"
                            onClick={() => setIsRecovering(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Volver al Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <h2>Acceso Propietario</h2>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo Electrónico" className={styles.input} required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className={styles.input} required />
                        <button type="submit" className={styles.button}>Entrar</button>
                        <button
                            type="button"
                            onClick={() => setIsRecovering(true)}
                            style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </form>
                )}
            </div>
        );
    }

    if (showPasswordReset) {
        return (
            <div className={styles.loginContainer}>
                <form onSubmit={handleUpdatePassword} className={styles.loginForm}>
                    <h2>Nueva Contraseña</h2>
                    <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
                        Introduce tu nueva contraseña.
                    </p>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva Contraseña"
                        className={styles.input}
                        required
                        minLength={6}
                    />
                    <button type="submit" className={styles.button}>Actualizar Contraseña</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Panel de Administración</h1>
                <div className={styles.controls}>
                    <button className={`${styles.tab} ${viewMode === 'dishes' ? styles.activeTab : ''}`} onClick={() => setViewMode('dishes')}>Platos</button>
                    <button className={`${styles.tab} ${viewMode === 'categories' ? styles.activeTab : ''}`} onClick={() => setViewMode('categories')}>Categorías</button>
                    <button className={`${styles.tab} ${viewMode === 'branding' ? styles.activeTab : ''}`} onClick={() => setViewMode('branding')}>Personalización</button>
                    <button onClick={handleLogout} className={styles.tab} style={{ marginLeft: 'auto', backgroundColor: '#e74c3c', color: 'white', borderColor: '#c0392b' }}>Salir</button>
                </div>
            </div>

            {viewMode === 'dishes' && (
                <>
                    <button className={styles.addButton} onClick={() => { resetForm(); setIsFormVisible(!isFormVisible); }}>
                        {isFormVisible ? <><FaTimes /> Cerrar</> : <><FaPlus /> Añadir Plato</>}
                    </button>

                    {isFormVisible && (
                        <form onSubmit={handleSaveDish} className={styles.formPanel}>
                            <h3>{editingDishId ? 'Editar Plato' : 'Nuevo Plato'}</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Nombre del Plato</label>
                                    <input placeholder="Ej. Paella Valenciana" value={dishForm.name} onChange={e => setDishForm({ ...dishForm, name: e.target.value })} className={styles.input} required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Categoría</label>
                                    <select value={dishForm.category} onChange={e => setDishForm({ ...dishForm, category: e.target.value })} className={styles.select}>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Precio (€)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={dishForm.price} onChange={e => setDishForm({ ...dishForm, price: e.target.value })} className={styles.input} required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Tamaño / Porción</label>
                                    <input placeholder="Ej. 1 Persona, 500g..." value={dishForm.portionSize} onChange={e => setDishForm({ ...dishForm, portionSize: e.target.value })} className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Imagen del Plato</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className={styles.input}
                                    />
                                    {dishForm.image && !imageFile && (
                                        <div style={{ marginTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Imagen Actual:</p>
                                            <img src={dishForm.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                        </div>
                                    )}
                                    {imageFile && (
                                        <div style={{ marginTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Nueva Imagen:</p>
                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Alérgenos</label>
                                    <input placeholder="Ej. Gluten, Lactosa (separados por coma)" value={dishForm.allergens} onChange={e => setDishForm({ ...dishForm, allergens: e.target.value })} className={styles.input} />
                                </div>
                                <div className={`${styles.inputGroup}`} style={{ gridColumn: '1 / -1' }}>
                                    <label>Descripción</label>
                                    <textarea placeholder="Describe el plato..." value={dishForm.description} onChange={e => setDishForm({ ...dishForm, description: e.target.value })} className={`${styles.input} ${styles.textarea}`} />
                                </div>
                            </div>
                            <button type="submit" className={styles.submitBtn}>{editingDishId ? 'Actualizar' : 'Guardar'}</button>
                        </form>
                    )}

                    <div className={styles.list}>
                        {menuItems.map(item => (
                            <div key={item.id} className={`${styles.row} ${!item.isVisible ? styles.hiddenRow : ''}`}>
                                <div className={styles.rowInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCategory}>{categories.find(c => c.id === item.category)?.name || item.category}</span>
                                </div>
                                <div className={styles.rowActions}>
                                    <span className={styles.priceTag}>{item.price}€</span>
                                    <button onClick={() => handleEditClick(item)} className={styles.btnEdit} title="Editar"><FaEdit /></button>
                                    <button onClick={() => toggleVisibility(item.id)} className={styles.btnIcon} title="Ocultar">{item.isVisible ? <FaEye /> : <FaEyeSlash />}</button>
                                    <button onClick={() => deleteDish(item.id)} className={styles.btnDelete} title="Eliminar"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {viewMode === 'categories' && (
                <div className={styles.categoryPanel}>
                    <form onSubmit={handleSaveCategory} className={styles.miniForm} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <input placeholder="Nombre Categoría" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className={styles.input} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setCategoryImageFile(e.target.files[0])}
                                className={styles.input}
                            />
                            {/* Previews */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {categoryForm.image && !categoryImageFile && (
                                    <img src={categoryForm.image} alt="Current" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                )}
                                {categoryImageFile && (
                                    <img src={URL.createObjectURL(categoryImageFile)} alt="New" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                )}
                            </div>
                        </div>

                        <button type="submit" className={styles.addButton} style={{ height: 'fit-content' }}>
                            {editingCategoryId ? 'Actualizar' : <><FaPlus /> Añadir</>}
                        </button>
                    </form>
                    <div className={styles.list}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.row}>
                                <span className={styles.itemName}>{cat.name}</span>
                                <div className={styles.rowActions}>
                                    <button onClick={() => handleEditCategoryClick(cat)} className={styles.btnEdit}><FaEdit /></button>
                                    <button onClick={() => toggleCategoryVisibility(cat.id)} className={styles.btnIcon} title={cat.isVisible !== false ? "Ocultar" : "Mostrar"}>
                                        {cat.isVisible !== false ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                    <button onClick={() => deleteCategory(cat.id)} className={styles.btnDelete}><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'branding' && (
                <div className={styles.formPanel}>
                    <h3>Personalización de Marca</h3>

                    <div className={styles.section}>
                        <h4>Identidad</h4>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Nombre del Restaurante</label>
                                <input
                                    value={config.restaurantName}
                                    onChange={(e) => updateConfig('restaurantName', e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mostrar Nombre</label>
                                <input
                                    type="checkbox"
                                    checked={config.showName}
                                    onChange={(e) => updateConfig('showName', e.target.checked)}
                                    style={{ marginLeft: '10px', transform: 'scale(1.5)' }}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Logo / Icono</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc' }}>
                                        <img src={config.icon || '/achabola.png'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files[0])}
                                            className={styles.input}
                                        />
                                        {logoFile && (
                                            <button onClick={handleLogoUpload} disabled={isUploadingLogo} className={styles.submitBtn} style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                                                {isUploadingLogo ? 'Subiendo...' : 'Actualizar Logo'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section} style={{ marginTop: '2rem' }}>
                        <h4>Tema de Color</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => updateConfig('themeId', theme.id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        border: config.themeId === theme.id ? `2px solid var(--color-primary)` : '1px solid var(--border-color)',
                                        backgroundColor: 'var(--color-surface)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {config.themeId === theme.id && (
                                        <div style={{ position: 'absolute', top: '5px', right: '5px', color: 'var(--color-success)' }}>
                                            <FaCheck />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.colors.light.primary, border: '1px solid #ccc' }}></div>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.colors.light.secondary, border: '1px solid #ccc' }}></div>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.colors.light.background, border: '1px solid #ccc' }}></div>
                                    </div>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section} style={{ marginTop: '2rem' }}>
                        <h4>Código QR del Menú</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', width: 'fit-content', border: '1px solid #eee' }}>
                            <QRCodeCanvas
                                id="menu-qr"
                                value={window.location.origin}
                                size={200}
                                level={"H"}
                                includeMargin={true}
                            />
                            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', maxWidth: '200px' }}>
                                Escanea este código para acceder al menú.
                            </p>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <button
                                    onClick={() => setDownloadFormat('png')}
                                    className={`${styles.tab} ${downloadFormat === 'png' ? styles.activeTab : ''}`}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                >
                                    PNG
                                </button>
                                <button
                                    onClick={() => setDownloadFormat('pdf')}
                                    className={`${styles.tab} ${downloadFormat === 'pdf' ? styles.activeTab : ''}`}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                >
                                    PDF
                                </button>
                            </div>

                            <button onClick={downloadQRCode} className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaDownload /> Descargar {downloadFormat.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

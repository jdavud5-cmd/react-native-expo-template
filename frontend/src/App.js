import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Building2, 
  Calculator,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const { toast } = useToast();
  
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [comparativas, setComparativas] = useState({});
  const [categorias, setCategorias] = useState([]);
  
  // Estados para formularios
  const [clienteForm, setClienteForm] = useState({
    nombre_completo: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  
  const [proveedorForm, setProveedorForm] = useState({
    nombre_completo: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    stock: '',
    imagen_url: ''
  });
  
  const [ventaForm, setVentaForm] = useState({
    cliente_id: '',
    productos: [],
    metodo_pago: 'USD'
  });
  
  const [compraForm, setCompraForm] = useState({
    proveedor_id: '',
    productos: [],
    metodo_pago: 'USD'
  });

  // Estados para edición
  const [editingCliente, setEditingCliente] = useState(null);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [editingProducto, setEditingProducto] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesRes, proveedoresRes, productosRes, ventasRes, comprasRes, comparativasRes, categoriasRes] = await Promise.all([
        axios.get(`${API}/clientes`),
        axios.get(`${API}/proveedores`),
        axios.get(`${API}/productos`),
        axios.get(`${API}/ventas`),
        axios.get(`${API}/compras`),
        axios.get(`${API}/comparativas`),
        axios.get(`${API}/categorias`)
      ]);
      
      setClientes(clientesRes.data);
      setProveedores(proveedoresRes.data);
      setProductos(productosRes.data);
      setVentas(ventasRes.data);
      setCompras(comprasRes.data);
      setComparativas(comparativasRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    }
  };

  // Funciones CRUD para Clientes
  const crearCliente = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await axios.put(`${API}/clientes/${editingCliente.id}`, clienteForm);
        toast({ title: "Cliente actualizado correctamente" });
        setEditingCliente(null);
      } else {
        await axios.post(`${API}/clientes`, clienteForm);
        toast({ title: "Cliente creado correctamente" });
      }
      setClienteForm({ nombre_completo: '', ruc: '', direccion: '', telefono: '', email: '' });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar cliente",
        variant: "destructive"
      });
    }
  };

  const editarCliente = (cliente) => {
    setClienteForm({
      nombre_completo: cliente.nombre_completo,
      ruc: cliente.ruc,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email
    });
    setEditingCliente(cliente);
  };

  const eliminarCliente = async (id) => {
    try {
      await axios.delete(`${API}/clientes/${id}`);
      toast({ title: "Cliente eliminado correctamente" });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar cliente",
        variant: "destructive"
      });
    }
  };

  // Funciones CRUD para Proveedores
  const crearProveedor = async (e) => {
    e.preventDefault();
    try {
      if (editingProveedor) {
        await axios.put(`${API}/proveedores/${editingProveedor.id}`, proveedorForm);
        toast({ title: "Proveedor actualizado correctamente" });
        setEditingProveedor(null);
      } else {
        await axios.post(`${API}/proveedores`, proveedorForm);
        toast({ title: "Proveedor creado correctamente" });
      }
      setProveedorForm({ nombre_completo: '', ruc: '', direccion: '', telefono: '', email: '' });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar proveedor",
        variant: "destructive"
      });
    }
  };

  const editarProveedor = (proveedor) => {
    setProveedorForm({
      nombre_completo: proveedor.nombre_completo,
      ruc: proveedor.ruc,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email
    });
    setEditingProveedor(proveedor);
  };

  const eliminarProveedor = async (id) => {
    try {
      await axios.delete(`${API}/proveedores/${id}`);
      toast({ title: "Proveedor eliminado correctamente" });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar proveedor",
        variant: "destructive"
      });
    }
  };

  // Funciones CRUD para Productos
  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      const productoData = {
        ...productoForm,
        precio: parseFloat(productoForm.precio),
        stock: parseInt(productoForm.stock)
      };
      
      if (editingProducto) {
        await axios.put(`${API}/productos/${editingProducto.id}`, productoData);
        toast({ title: "Producto actualizado correctamente" });
        setEditingProducto(null);
      } else {
        await axios.post(`${API}/productos`, productoData);
        toast({ title: "Producto creado correctamente" });
      }
      setProductoForm({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', imagen_url: '' });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar producto",
        variant: "destructive"
      });
    }
  };

  const editarProducto = (producto) => {
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      imagen_url: producto.imagen_url
    });
    setEditingProducto(producto);
  };

  const eliminarProducto = async (id) => {
    try {
      await axios.delete(`${API}/productos/${id}`);
      toast({ title: "Producto eliminado correctamente" });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar producto",
        variant: "destructive"
      });
    }
  };

  // Funciones para Ventas
  const crearVenta = async (e) => {
    e.preventDefault();
    if (ventaForm.productos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await axios.post(`${API}/ventas`, ventaForm);
      toast({ title: "Venta registrada correctamente" });
      setVentaForm({ cliente_id: '', productos: [], metodo_pago: 'USD' });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar venta",
        variant: "destructive"
      });
    }
  };

  const eliminarVenta = async (id) => {
    try {
      await axios.delete(`${API}/ventas/${id}`);
      toast({ title: "Venta eliminada correctamente" });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar venta",
        variant: "destructive"
      });
    }
  };

  // Funciones para Compras
  const crearCompra = async (e) => {
    e.preventDefault();
    if (compraForm.productos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await axios.post(`${API}/compras`, compraForm);
      toast({ title: "Compra registrada correctamente" });
      setCompraForm({ proveedor_id: '', productos: [], metodo_pago: 'USD' });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar compra",
        variant: "destructive"
      });
    }
  };

  const eliminarCompra = async (id) => {
    try {
      await axios.delete(`${API}/compras/${id}`);
      toast({ title: "Compra eliminada correctamente" });
      cargarDatos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar compra",
        variant: "destructive"
      });
    }
  };

  const agregarProductoVenta = (producto) => {
    const productoExiste = ventaForm.productos.find(p => p.producto_id === producto.id);
    if (productoExiste) {
      toast({
        title: "Error",
        description: "El producto ya está agregado",
        variant: "destructive"
      });
      return;
    }
    
    const nuevoProducto = {
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio,
      subtotal: producto.precio
    };
    
    setVentaForm({
      ...ventaForm,
      productos: [...ventaForm.productos, nuevoProducto]
    });
  };

  const agregarProductoCompra = (producto) => {
    const productoExiste = compraForm.productos.find(p => p.producto_id === producto.id);
    if (productoExiste) {
      toast({
        title: "Error",
        description: "El producto ya está agregado",
        variant: "destructive"
      });
      return;
    }
    
    const nuevoProducto = {
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio,
      subtotal: producto.precio
    };
    
    setCompraForm({
      ...compraForm,
      productos: [...compraForm.productos, nuevoProducto]
    });
  };

  const actualizarCantidadVenta = (index, cantidad) => {
    const nuevosProductos = [...ventaForm.productos];
    nuevosProductos[index].cantidad = parseInt(cantidad);
    nuevosProductos[index].subtotal = nuevosProductos[index].precio_unitario * parseInt(cantidad);
    setVentaForm({ ...ventaForm, productos: nuevosProductos });
  };

  const actualizarCantidadCompra = (index, cantidad) => {
    const nuevosProductos = [...compraForm.productos];
    nuevosProductos[index].cantidad = parseInt(cantidad);
    nuevosProductos[index].subtotal = nuevosProductos[index].precio_unitario * parseInt(cantidad);
    setCompraForm({ ...compraForm, productos: nuevosProductos });
  };

  const removerProductoVenta = (index) => {
    const nuevosProductos = ventaForm.productos.filter((_, i) => i !== index);
    setVentaForm({ ...ventaForm, productos: nuevosProductos });
  };

  const removerProductoCompra = (index) => {
    const nuevosProductos = compraForm.productos.filter((_, i) => i !== index);
    setCompraForm({ ...compraForm, productos: nuevosProductos });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Ferretería</h1>
            </div>
            <div className="text-sm text-gray-600">
              Gestión Integral de Negocio
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-sm border border-orange-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-orange-100">Dashboard</TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-orange-100">Clientes</TabsTrigger>
            <TabsTrigger value="proveedores" className="data-[state=active]:bg-orange-100">Proveedores</TabsTrigger>
            <TabsTrigger value="productos" className="data-[state=active]:bg-orange-100">Productos</TabsTrigger>
            <TabsTrigger value="ventas" className="data-[state=active]:bg-orange-100">Ventas</TabsTrigger>
            <TabsTrigger value="compras" className="data-[state=active]:bg-orange-100">Compras</TabsTrigger>
            <TabsTrigger value="comparativas" className="data-[state=active]:bg-orange-100">Comparativas</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{clientes.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{productos.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">${comparativas.total_ventas?.toFixed(2) || '0.00'}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Ganancia Neta</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${comparativas.ganancia_neta?.toFixed(2) || '0.00'}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Imagen de Ferretería</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src="https://images.unsplash.com/photo-1519520104014-df63821cb6f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxmZXJyZXRlciVDMyVBRGF8ZW58MHx8fHwxNzU1NzExODY5fDA&ixlib=rb-4.1.0&q=85"
                    alt="Ferretería"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Productos Destacados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <img 
                      src="https://images.unsplash.com/photo-1602052793312-b99c2a9ee797?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxmZXJyZXRlciVDMyVBRGF8ZW58MHx8fHwxNzU1NzExODY5fDA&ixlib=rb-4.1.0&q=85"
                      alt="Herramientas"
                      className="w-full h-20 object-cover rounded"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1606676539940-12768ce0e762?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxoZXJyYW1pZW50YXN8ZW58MHx8fHwxNzU1NzExODc1fDA&ixlib=rb-4.1.0&q=85"
                      alt="Taladros"
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clientes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={crearCliente} className="space-y-4">
                    <div>
                      <Label htmlFor="nombre_completo">Nombre Completo</Label>
                      <Input
                        id="nombre_completo"
                        value={clienteForm.nombre_completo}
                        onChange={(e) => setClienteForm({...clienteForm, nombre_completo: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruc">RUC</Label>
                      <Input
                        id="ruc"
                        value={clienteForm.ruc}
                        onChange={(e) => setClienteForm({...clienteForm, ruc: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={clienteForm.direccion}
                        onChange={(e) => setClienteForm({...clienteForm, direccion: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={clienteForm.telefono}
                        onChange={(e) => setClienteForm({...clienteForm, telefono: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clienteForm.email}
                        onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingCliente ? 'Actualizar' : 'Crear'} Cliente
                      </Button>
                      {editingCliente && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingCliente(null);
                            setClienteForm({ nombre_completo: '', ruc: '', direccion: '', telefono: '', email: '' });
                          }}
                          className="border-orange-200"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {clientes.map((cliente) => (
                      <div key={cliente.id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{cliente.nombre_completo}</h3>
                            <p className="text-sm text-gray-600">RUC: {cliente.ruc}</p>
                            <p className="text-sm text-gray-600">{cliente.direccion}</p>
                            <p className="text-sm text-gray-600">{cliente.telefono}</p>
                            <p className="text-sm text-gray-600">{cliente.email}</p>
                            <Badge variant="secondary" className="mt-2">
                              {cliente.contador_ventas} ventas
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editarCliente(cliente)}
                              className="border-orange-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarCliente(cliente.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proveedores */}
          <TabsContent value="proveedores" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={crearProveedor} className="space-y-4">
                    <div>
                      <Label htmlFor="proveedor_nombre_completo">Nombre Completo</Label>
                      <Input
                        id="proveedor_nombre_completo"
                        value={proveedorForm.nombre_completo}
                        onChange={(e) => setProveedorForm({...proveedorForm, nombre_completo: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proveedor_ruc">RUC</Label>
                      <Input
                        id="proveedor_ruc"
                        value={proveedorForm.ruc}
                        onChange={(e) => setProveedorForm({...proveedorForm, ruc: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proveedor_direccion">Dirección</Label>
                      <Input
                        id="proveedor_direccion"
                        value={proveedorForm.direccion}
                        onChange={(e) => setProveedorForm({...proveedorForm, direccion: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proveedor_telefono">Teléfono</Label>
                      <Input
                        id="proveedor_telefono"
                        value={proveedorForm.telefono}
                        onChange={(e) => setProveedorForm({...proveedorForm, telefono: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proveedor_email">Email</Label>
                      <Input
                        id="proveedor_email"
                        type="email"
                        value={proveedorForm.email}
                        onChange={(e) => setProveedorForm({...proveedorForm, email: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingProveedor ? 'Actualizar' : 'Crear'} Proveedor
                      </Button>
                      {editingProveedor && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingProveedor(null);
                            setProveedorForm({ nombre_completo: '', ruc: '', direccion: '', telefono: '', email: '' });
                          }}
                          className="border-orange-200"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Lista de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {proveedores.map((proveedor) => (
                      <div key={proveedor.id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{proveedor.nombre_completo}</h3>
                            <p className="text-sm text-gray-600">RUC: {proveedor.ruc}</p>
                            <p className="text-sm text-gray-600">{proveedor.direccion}</p>
                            <p className="text-sm text-gray-600">{proveedor.telefono}</p>
                            <p className="text-sm text-gray-600">{proveedor.email}</p>
                            <Badge variant="secondary" className="mt-2">
                              {proveedor.contador_compras} compras
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editarProveedor(proveedor)}
                              className="border-orange-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarProveedor(proveedor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Productos */}
          <TabsContent value="productos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={crearProducto} className="space-y-4">
                    <div>
                      <Label htmlFor="producto_nombre">Nombre</Label>
                      <Input
                        id="producto_nombre"
                        value={productoForm.nombre}
                        onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="producto_descripcion">Descripción</Label>
                      <Textarea
                        id="producto_descripcion"
                        value={productoForm.descripcion}
                        onChange={(e) => setProductoForm({...productoForm, descripcion: e.target.value})}
                        required
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="producto_categoria">Categoría</Label>
                      <Select 
                        value={productoForm.categoria} 
                        onValueChange={(value) => setProductoForm({...productoForm, categoria: value})}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="producto_precio">Precio ($)</Label>
                        <Input
                          id="producto_precio"
                          type="number"
                          step="0.01"
                          value={productoForm.precio}
                          onChange={(e) => setProductoForm({...productoForm, precio: e.target.value})}
                          required
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="producto_stock">Stock</Label>
                        <Input
                          id="producto_stock"
                          type="number"
                          value={productoForm.stock}
                          onChange={(e) => setProductoForm({...productoForm, stock: e.target.value})}
                          required
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="producto_imagen">URL de Imagen</Label>
                      <Input
                        id="producto_imagen"
                        value={productoForm.imagen_url}
                        onChange={(e) => setProductoForm({...productoForm, imagen_url: e.target.value})}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingProducto ? 'Actualizar' : 'Crear'} Producto
                      </Button>
                      {editingProducto && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingProducto(null);
                            setProductoForm({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', imagen_url: '' });
                          }}
                          className="border-orange-200"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Lista de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {productos.map((producto) => (
                      <div key={producto.id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            {producto.imagen_url && (
                              <img 
                                src={producto.imagen_url} 
                                alt={producto.nombre}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                              <p className="text-sm text-gray-600">{producto.descripcion}</p>
                              <Badge variant="outline" className="mt-1 border-orange-200">
                                {producto.categoria}
                              </Badge>
                              <div className="flex space-x-4 mt-2">
                                <span className="text-sm font-medium text-green-600">
                                  ${producto.precio}
                                </span>
                                <span className="text-sm text-gray-600">
                                  Stock: {producto.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editarProducto(producto)}
                              className="border-orange-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ventas */}
          <TabsContent value="ventas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Nueva Venta</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={crearVenta} className="space-y-4">
                    <div>
                      <Label htmlFor="venta_cliente">Cliente</Label>
                      <Select 
                        value={ventaForm.cliente_id} 
                        onValueChange={(value) => setVentaForm({...ventaForm, cliente_id: value})}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombre_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="venta_metodo_pago">Método de Pago</Label>
                      <Select 
                        value={ventaForm.metodo_pago} 
                        onValueChange={(value) => setVentaForm({...ventaForm, metodo_pago: value})}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Productos a Vender</Label>
                      <div className="max-h-32 overflow-y-auto space-y-2 border border-orange-200 rounded p-2">
                        {productos.filter(p => p.stock > 0).map((producto) => (
                          <div key={producto.id} className="flex justify-between items-center p-2 hover:bg-orange-50 rounded">
                            <div>
                              <span className="font-medium">{producto.nombre}</span>
                              <span className="text-sm text-gray-600 ml-2">${producto.precio}</span>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => agregarProductoVenta(producto)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ventaForm.productos.length > 0 && (
                      <div>
                        <Label>Productos Seleccionados</Label>
                        <div className="space-y-2 border border-orange-200 rounded p-2">
                          {ventaForm.productos.map((producto, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span className="font-medium">{producto.nombre}</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={producto.cantidad}
                                  onChange={(e) => actualizarCantidadVenta(index, e.target.value)}
                                  className="w-16 h-8 border-orange-200"
                                />
                                <span className="text-sm">${producto.subtotal.toFixed(2)}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removerProductoVenta(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right mt-2">
                          <span className="font-bold">
                            Total: ${ventaForm.productos.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Registrar Venta
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Historial de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {ventas.map((venta) => (
                      <div key={venta.id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{venta.cliente_nombre}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(venta.fecha).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              {venta.productos.map((producto, index) => (
                                <p key={index} className="text-sm text-gray-600">
                                  {producto.nombre} x{producto.cantidad} = ${producto.subtotal.toFixed(2)}
                                </p>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary">
                                ${venta.total.toFixed(2)}
                              </Badge>
                              <Badge variant="outline" className="border-orange-200">
                                {venta.metodo_pago}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarVenta(venta.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compras */}
          <TabsContent value="compras" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Nueva Compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={crearCompra} className="space-y-4">
                    <div>
                      <Label htmlFor="compra_proveedor">Proveedor</Label>
                      <Select 
                        value={compraForm.proveedor_id} 
                        onValueChange={(value) => setCompraForm({...compraForm, proveedor_id: value})}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {proveedores.map((proveedor) => (
                            <SelectItem key={proveedor.id} value={proveedor.id}>
                              {proveedor.nombre_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="compra_metodo_pago">Método de Pago</Label>
                      <Select 
                        value={compraForm.metodo_pago} 
                        onValueChange={(value) => setCompraForm({...compraForm, metodo_pago: value})}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Productos a Comprar</Label>
                      <div className="max-h-32 overflow-y-auto space-y-2 border border-orange-200 rounded p-2">
                        {productos.map((producto) => (
                          <div key={producto.id} className="flex justify-between items-center p-2 hover:bg-orange-50 rounded">
                            <div>
                              <span className="font-medium">{producto.nombre}</span>
                              <span className="text-sm text-gray-600 ml-2">${producto.precio}</span>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => agregarProductoCompra(producto)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {compraForm.productos.length > 0 && (
                      <div>
                        <Label>Productos Seleccionados</Label>
                        <div className="space-y-2 border border-orange-200 rounded p-2">
                          {compraForm.productos.map((producto, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span className="font-medium">{producto.nombre}</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={producto.cantidad}
                                  onChange={(e) => actualizarCantidadCompra(index, e.target.value)}
                                  className="w-16 h-8 border-orange-200"
                                />
                                <span className="text-sm">${producto.subtotal.toFixed(2)}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removerProductoCompra(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right mt-2">
                          <span className="font-bold">
                            Total: ${compraForm.productos.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                      <Package className="h-4 w-4 mr-2" />
                      Registrar Compra
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {compras.map((compra) => (
                      <div key={compra.id} className="border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{compra.proveedor_nombre}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(compra.fecha).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              {compra.productos.map((producto, index) => (
                                <p key={index} className="text-sm text-gray-600">
                                  {producto.nombre} x{producto.cantidad} = ${producto.subtotal.toFixed(2)}
                                </p>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary">
                                ${compra.total.toFixed(2)}
                              </Badge>
                              <Badge variant="outline" className="border-orange-200">
                                {compra.metodo_pago}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarCompra(compra.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparativas */}
          <TabsContent value="comparativas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Resumen Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Ventas:</span>
                    <span className="font-bold text-green-600">
                      ${comparativas.total_ventas?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Compras:</span>
                    <span className="font-bold text-red-600">
                      ${comparativas.total_compras?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <Separator className="bg-orange-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ganancia Neta:</span>
                    <span className={`font-bold ${comparativas.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${comparativas.ganancia_neta?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                    Ventas por Método
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">USD:</span>
                    <span className="font-bold">
                      ${comparativas.ventas_por_metodo?.USD?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transferencia:</span>
                    <span className="font-bold">
                      ${comparativas.ventas_por_metodo?.Transferencia?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <Separator className="bg-orange-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transacciones:</span>
                    <span className="font-bold text-orange-600">
                      {comparativas.cantidad_ventas || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-orange-600" />
                    Compras por Método
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">USD:</span>
                    <span className="font-bold">
                      ${comparativas.compras_por_metodo?.USD?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transferencia:</span>
                    <span className="font-bold">
                      ${comparativas.compras_por_metodo?.Transferencia?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <Separator className="bg-orange-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transacciones:</span>
                    <span className="font-bold text-orange-600">
                      {comparativas.cantidad_compras || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-orange-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Imágenes de Referencia</CardTitle>
                <CardDescription>Productos típicos de ferretería</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1631856954913-c751a44490ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxmZXJyZXRlciVDMyVBRGF8ZW58MHx8fHwxNzU1NzExODY5fDA&ixlib=rb-4.1.0&q=85"
                    alt="Estantería de ferretería"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1581783898377-1c85bf937427?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxoZXJyYW1pZW50YXN8ZW58MHx8fHwxNzU1NzExODc1fDA&ixlib=rb-4.1.0&q=85"
                    alt="Herramientas"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1426927308491-6380b6a9936f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxoZXJyYW1pZW50YXN8ZW58MHx8fHwxNzU1NzExODc1fDA&ixlib=rb-4.1.0&q=85"
                    alt="Rack de herramientas"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxoZXJyYW1pZW50YXN8ZW58MHx8fHwxNzU1NzExODc1fDA&ixlib=rb-4.1.0&q=85"
                    alt="Herramienta manual"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;
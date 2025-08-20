from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value:
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

# Models
class Cliente(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre_completo: str
    ruc: str
    direccion: str
    telefono: str
    email: str
    contador_ventas: int = 0
    fecha_registro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClienteCreate(BaseModel):
    nombre_completo: str
    ruc: str
    direccion: str
    telefono: str
    email: str

class Proveedor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre_completo: str
    ruc: str
    direccion: str
    telefono: str
    email: str
    contador_compras: int = 0
    fecha_registro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProveedorCreate(BaseModel):
    nombre_completo: str
    ruc: str
    direccion: str
    telefono: str
    email: str

class Producto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    descripcion: str
    categoria: str
    precio: float
    stock: int
    imagen_url: str = ""
    fecha_creacion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: str
    categoria: str
    precio: float
    stock: int
    imagen_url: str = ""

class ProductoVenta(BaseModel):
    producto_id: str
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class Venta(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    cliente_id: str
    cliente_nombre: str
    productos: List[ProductoVenta]
    total: float
    metodo_pago: str  # USD o Transferencia
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VentaCreate(BaseModel):
    cliente_id: str
    productos: List[ProductoVenta]
    metodo_pago: str

class ProductoCompra(BaseModel):
    producto_id: str
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class Compra(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    proveedor_id: str
    proveedor_nombre: str
    productos: List[ProductoCompra]
    total: float
    metodo_pago: str  # USD o Transferencia
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompraCreate(BaseModel):
    proveedor_id: str
    productos: List[ProductoCompra]
    metodo_pago: str

# Routes for Clientes
@api_router.post("/clientes", response_model=Cliente)
async def crear_cliente(cliente: ClienteCreate):
    cliente_dict = cliente.dict()
    cliente_obj = Cliente(**cliente_dict)
    cliente_mongo = prepare_for_mongo(cliente_obj.dict())
    await db.clientes.insert_one(cliente_mongo)
    return cliente_obj

@api_router.get("/clientes", response_model=List[Cliente])
async def obtener_clientes():
    clientes = await db.clientes.find().to_list(1000)
    return [Cliente(**parse_from_mongo(cliente)) for cliente in clientes]

@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def obtener_cliente(cliente_id: str):
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return Cliente(**parse_from_mongo(cliente))

@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def actualizar_cliente(cliente_id: str, cliente_update: ClienteCreate):
    cliente_dict = cliente_update.dict()
    await db.clientes.update_one({"id": cliente_id}, {"$set": cliente_dict})
    cliente_actualizado = await db.clientes.find_one({"id": cliente_id})
    if not cliente_actualizado:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return Cliente(**parse_from_mongo(cliente_actualizado))

@api_router.delete("/clientes/{cliente_id}")
async def eliminar_cliente(cliente_id: str):
    result = await db.clientes.delete_one({"id": cliente_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado correctamente"}

# Routes for Proveedores
@api_router.post("/proveedores", response_model=Proveedor)
async def crear_proveedor(proveedor: ProveedorCreate):
    proveedor_dict = proveedor.dict()
    proveedor_obj = Proveedor(**proveedor_dict)
    proveedor_mongo = prepare_for_mongo(proveedor_obj.dict())
    await db.proveedores.insert_one(proveedor_mongo)
    return proveedor_obj

@api_router.get("/proveedores", response_model=List[Proveedor])
async def obtener_proveedores():
    proveedores = await db.proveedores.find().to_list(1000)
    return [Proveedor(**parse_from_mongo(proveedor)) for proveedor in proveedores]

@api_router.get("/proveedores/{proveedor_id}", response_model=Proveedor)
async def obtener_proveedor(proveedor_id: str):
    proveedor = await db.proveedores.find_one({"id": proveedor_id})
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return Proveedor(**parse_from_mongo(proveedor))

@api_router.put("/proveedores/{proveedor_id}", response_model=Proveedor)
async def actualizar_proveedor(proveedor_id: str, proveedor_update: ProveedorCreate):
    proveedor_dict = proveedor_update.dict()
    await db.proveedores.update_one({"id": proveedor_id}, {"$set": proveedor_dict})
    proveedor_actualizado = await db.proveedores.find_one({"id": proveedor_id})
    if not proveedor_actualizado:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return Proveedor(**parse_from_mongo(proveedor_actualizado))

@api_router.delete("/proveedores/{proveedor_id}")
async def eliminar_proveedor(proveedor_id: str):
    result = await db.proveedores.delete_one({"id": proveedor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return {"message": "Proveedor eliminado correctamente"}

# Routes for Productos
@api_router.post("/productos", response_model=Producto)
async def crear_producto(producto: ProductoCreate):
    producto_dict = producto.dict()
    producto_obj = Producto(**producto_dict)
    producto_mongo = prepare_for_mongo(producto_obj.dict())
    await db.productos.insert_one(producto_mongo)
    return producto_obj

@api_router.get("/productos", response_model=List[Producto])
async def obtener_productos():
    productos = await db.productos.find().to_list(1000)
    return [Producto(**parse_from_mongo(producto)) for producto in productos]

@api_router.get("/productos/{producto_id}", response_model=Producto)
async def obtener_producto(producto_id: str):
    producto = await db.productos.find_one({"id": producto_id})
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Producto(**parse_from_mongo(producto))

@api_router.put("/productos/{producto_id}", response_model=Producto)
async def actualizar_producto(producto_id: str, producto_update: ProductoCreate):
    producto_dict = producto_update.dict()
    await db.productos.update_one({"id": producto_id}, {"$set": producto_dict})
    producto_actualizado = await db.productos.find_one({"id": producto_id})
    if not producto_actualizado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Producto(**parse_from_mongo(producto_actualizado))

@api_router.delete("/productos/{producto_id}")
async def eliminar_producto(producto_id: str):
    result = await db.productos.delete_one({"id": producto_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado correctamente"}

@api_router.get("/categorias")
async def obtener_categorias():
    return [
        "Herramientas manuales",
        "Herramientas eléctricas",
        "Materiales de construcción",
        "Tornillería y fijaciones",
        "Pinturas y acabados",
        "Plomería",
        "Electricidad",
        "Seguridad industrial"
    ]

# Routes for Ventas
@api_router.post("/ventas", response_model=Venta)
async def crear_venta(venta: VentaCreate):
    # Obtener datos del cliente
    cliente = await db.clientes.find_one({"id": venta.cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Calcular total
    total = sum([producto.subtotal for producto in venta.productos])
    
    # Crear venta
    venta_dict = venta.dict()
    venta_dict["cliente_nombre"] = cliente["nombre_completo"]
    venta_dict["total"] = total
    venta_obj = Venta(**venta_dict)
    venta_mongo = prepare_for_mongo(venta_obj.dict())
    await db.ventas.insert_one(venta_mongo)
    
    # Actualizar contador de ventas del cliente
    await db.clientes.update_one(
        {"id": venta.cliente_id},
        {"$inc": {"contador_ventas": 1}}
    )
    
    # Actualizar stock de productos
    for producto_venta in venta.productos:
        await db.productos.update_one(
            {"id": producto_venta.producto_id},
            {"$inc": {"stock": -producto_venta.cantidad}}
        )
    
    return venta_obj

@api_router.get("/ventas", response_model=List[Venta])
async def obtener_ventas():
    ventas = await db.ventas.find().to_list(1000)
    return [Venta(**parse_from_mongo(venta)) for venta in ventas]

@api_router.get("/ventas/cliente/{cliente_id}", response_model=List[Venta])
async def obtener_ventas_cliente(cliente_id: str):
    ventas = await db.ventas.find({"cliente_id": cliente_id}).to_list(1000)
    return [Venta(**parse_from_mongo(venta)) for venta in ventas]

@api_router.delete("/ventas/{venta_id}")
async def eliminar_venta(venta_id: str):
    venta = await db.ventas.find_one({"id": venta_id})
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    # Restaurar stock de productos
    for producto_venta in venta["productos"]:
        await db.productos.update_one(
            {"id": producto_venta["producto_id"]},
            {"$inc": {"stock": producto_venta["cantidad"]}}
        )
    
    # Decrementar contador de ventas del cliente
    await db.clientes.update_one(
        {"id": venta["cliente_id"]},
        {"$inc": {"contador_ventas": -1}}
    )
    
    result = await db.ventas.delete_one({"id": venta_id})
    return {"message": "Venta eliminada correctamente"}

# Routes for Compras
@api_router.post("/compras", response_model=Compra)
async def crear_compra(compra: CompraCreate):
    # Obtener datos del proveedor
    proveedor = await db.proveedores.find_one({"id": compra.proveedor_id})
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    # Calcular total
    total = sum([producto.subtotal for producto in compra.productos])
    
    # Crear compra
    compra_dict = compra.dict()
    compra_dict["proveedor_nombre"] = proveedor["nombre_completo"]
    compra_dict["total"] = total
    compra_obj = Compra(**compra_dict)
    compra_mongo = prepare_for_mongo(compra_obj.dict())
    await db.compras.insert_one(compra_mongo)
    
    # Actualizar contador de compras del proveedor
    await db.proveedores.update_one(
        {"id": compra.proveedor_id},
        {"$inc": {"contador_compras": 1}}
    )
    
    # Actualizar stock de productos
    for producto_compra in compra.productos:
        await db.productos.update_one(
            {"id": producto_compra.producto_id},
            {"$inc": {"stock": producto_compra.cantidad}}
        )
    
    return compra_obj

@api_router.get("/compras", response_model=List[Compra])
async def obtener_compras():
    compras = await db.compras.find().to_list(1000)
    return [Compra(**parse_from_mongo(compra)) for compra in compras]

@api_router.get("/compras/proveedor/{proveedor_id}", response_model=List[Compra])
async def obtener_compras_proveedor(proveedor_id: str):
    compras = await db.compras.find({"proveedor_id": proveedor_id}).to_list(1000)
    return [Compra(**parse_from_mongo(compra)) for compra in compras]

@api_router.delete("/compras/{compra_id}")
async def eliminar_compra(compra_id: str):
    compra = await db.compras.find_one({"id": compra_id})
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    
    # Restaurar stock de productos
    for producto_compra in compra["productos"]:
        await db.productos.update_one(
            {"id": producto_compra["producto_id"]},
            {"$inc": {"stock": -producto_compra["cantidad"]}}
        )
    
    # Decrementar contador de compras del proveedor
    await db.proveedores.update_one(
        {"id": compra["proveedor_id"]},
        {"$inc": {"contador_compras": -1}}
    )
    
    result = await db.compras.delete_one({"id": compra_id})
    return {"message": "Compra eliminada correctamente"}

# Routes for Comparativas
@api_router.get("/comparativas")
async def obtener_comparativas():
    # Obtener totales de ventas y compras
    ventas = await db.ventas.find().to_list(1000)
    compras = await db.compras.find().to_list(1000)
    
    total_ventas = sum([venta["total"] for venta in ventas])
    total_compras = sum([compra["total"] for compra in compras])
    
    ventas_usd = sum([venta["total"] for venta in ventas if venta["metodo_pago"] == "USD"])
    ventas_transferencia = sum([venta["total"] for venta in ventas if venta["metodo_pago"] == "Transferencia"])
    
    compras_usd = sum([compra["total"] for compra in compras if compra["metodo_pago"] == "USD"])
    compras_transferencia = sum([compra["total"] for compra in compras if compra["metodo_pago"] == "Transferencia"])
    
    ganancia_neta = total_ventas - total_compras
    
    return {
        "total_ventas": total_ventas,
        "total_compras": total_compras,
        "ganancia_neta": ganancia_neta,
        "ventas_por_metodo": {
            "USD": ventas_usd,
            "Transferencia": ventas_transferencia
        },
        "compras_por_metodo": {
            "USD": compras_usd,
            "Transferencia": compras_transferencia
        },
        "cantidad_ventas": len(ventas),
        "cantidad_compras": len(compras)
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Sistema de Gestión de Ferretería API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
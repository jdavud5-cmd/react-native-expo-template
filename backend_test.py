import requests
import sys
import json
from datetime import datetime

class FerreteriaTester:
    def __init__(self, base_url="https://negocio-gestor.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'clientes': [],
            'proveedores': [],
            'productos': [],
            'ventas': [],
            'compras': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if method == 'POST' and 'id' in response_data:
                        print(f"   Created ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test("Root API", "GET", "", 200)
        return success

    def test_categorias(self):
        """Test categories endpoint"""
        success, response = self.run_test("Get Categories", "GET", "categorias", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} categories")
            return True
        return False

    def test_clientes_crud(self):
        """Test complete CRUD for clients"""
        print("\n📋 Testing CLIENTES CRUD...")
        
        # Test GET empty list
        success, _ = self.run_test("Get Clients (empty)", "GET", "clientes", 200)
        if not success:
            return False

        # Test CREATE client
        cliente_data = {
            "nombre_completo": "Juan Pérez Test",
            "ruc": "12345678901",
            "direccion": "Av. Test 123",
            "telefono": "987654321",
            "email": "juan.test@email.com"
        }
        
        success, response = self.run_test("Create Client", "POST", "clientes", 200, cliente_data)
        if not success:
            return False
        
        cliente_id = response.get('id')
        if not cliente_id:
            print("❌ No ID returned from client creation")
            return False
        
        self.created_ids['clientes'].append(cliente_id)

        # Test GET specific client
        success, response = self.run_test("Get Specific Client", "GET", f"clientes/{cliente_id}", 200)
        if not success:
            return False

        # Verify client data
        if response.get('nombre_completo') != cliente_data['nombre_completo']:
            print("❌ Client data mismatch")
            return False

        # Test UPDATE client
        updated_data = cliente_data.copy()
        updated_data['telefono'] = "999888777"
        
        success, response = self.run_test("Update Client", "PUT", f"clientes/{cliente_id}", 200, updated_data)
        if not success:
            return False

        # Verify update
        if response.get('telefono') != "999888777":
            print("❌ Client update failed")
            return False

        # Test GET all clients
        success, response = self.run_test("Get All Clients", "GET", "clientes", 200)
        if not success or len(response) == 0:
            return False

        print("✅ CLIENTES CRUD completed successfully")
        return True

    def test_proveedores_crud(self):
        """Test complete CRUD for suppliers"""
        print("\n🏢 Testing PROVEEDORES CRUD...")
        
        # Test CREATE supplier
        proveedor_data = {
            "nombre_completo": "Ferretería Suministros SA",
            "ruc": "20123456789",
            "direccion": "Jr. Industrial 456",
            "telefono": "987123456",
            "email": "ventas@suministros.com"
        }
        
        success, response = self.run_test("Create Supplier", "POST", "proveedores", 200, proveedor_data)
        if not success:
            return False
        
        proveedor_id = response.get('id')
        if not proveedor_id:
            print("❌ No ID returned from supplier creation")
            return False
        
        self.created_ids['proveedores'].append(proveedor_id)

        # Test GET specific supplier
        success, response = self.run_test("Get Specific Supplier", "GET", f"proveedores/{proveedor_id}", 200)
        if not success:
            return False

        # Test UPDATE supplier
        updated_data = proveedor_data.copy()
        updated_data['email'] = "contacto@suministros.com"
        
        success, response = self.run_test("Update Supplier", "PUT", f"proveedores/{proveedor_id}", 200, updated_data)
        if not success:
            return False

        # Test GET all suppliers
        success, response = self.run_test("Get All Suppliers", "GET", "proveedores", 200)
        if not success or len(response) == 0:
            return False

        print("✅ PROVEEDORES CRUD completed successfully")
        return True

    def test_productos_crud(self):
        """Test complete CRUD for products"""
        print("\n📦 Testing PRODUCTOS CRUD...")
        
        # Test CREATE product
        producto_data = {
            "nombre": "Martillo de Acero",
            "descripcion": "Martillo profesional de acero forjado",
            "categoria": "Herramientas manuales",
            "precio": 25.50,
            "stock": 100,
            "imagen_url": "https://example.com/martillo.jpg"
        }
        
        success, response = self.run_test("Create Product", "POST", "productos", 200, producto_data)
        if not success:
            return False
        
        producto_id = response.get('id')
        if not producto_id:
            print("❌ No ID returned from product creation")
            return False
        
        self.created_ids['productos'].append(producto_id)

        # Test GET specific product
        success, response = self.run_test("Get Specific Product", "GET", f"productos/{producto_id}", 200)
        if not success:
            return False

        # Verify product data
        if response.get('precio') != 25.50:
            print("❌ Product price mismatch")
            return False

        # Test UPDATE product
        updated_data = producto_data.copy()
        updated_data['precio'] = 28.00
        updated_data['stock'] = 150
        
        success, response = self.run_test("Update Product", "PUT", f"productos/{producto_id}", 200, updated_data)
        if not success:
            return False

        # Test GET all products
        success, response = self.run_test("Get All Products", "GET", "productos", 200)
        if not success or len(response) == 0:
            return False

        print("✅ PRODUCTOS CRUD completed successfully")
        return True

    def test_ventas_flow(self):
        """Test sales flow with inventory updates"""
        print("\n💰 Testing VENTAS FLOW...")
        
        if not self.created_ids['clientes'] or not self.created_ids['productos']:
            print("❌ Need clients and products for sales test")
            return False

        cliente_id = self.created_ids['clientes'][0]
        producto_id = self.created_ids['productos'][0]

        # Get initial product stock
        success, producto = self.run_test("Get Product Before Sale", "GET", f"productos/{producto_id}", 200)
        if not success:
            return False
        
        initial_stock = producto.get('stock', 0)
        print(f"   Initial stock: {initial_stock}")

        # Get initial client sales count
        success, cliente = self.run_test("Get Client Before Sale", "GET", f"clientes/{cliente_id}", 200)
        if not success:
            return False
        
        initial_sales_count = cliente.get('contador_ventas', 0)
        print(f"   Initial sales count: {initial_sales_count}")

        # Create sale
        venta_data = {
            "cliente_id": cliente_id,
            "productos": [
                {
                    "producto_id": producto_id,
                    "nombre": "Martillo de Acero",
                    "cantidad": 5,
                    "precio_unitario": 28.00,
                    "subtotal": 140.00
                }
            ],
            "metodo_pago": "USD"
        }
        
        success, response = self.run_test("Create Sale", "POST", "ventas", 200, venta_data)
        if not success:
            return False
        
        venta_id = response.get('id')
        if not venta_id:
            print("❌ No ID returned from sale creation")
            return False
        
        self.created_ids['ventas'].append(venta_id)

        # Verify stock was updated
        success, producto_updated = self.run_test("Get Product After Sale", "GET", f"productos/{producto_id}", 200)
        if not success:
            return False
        
        new_stock = producto_updated.get('stock', 0)
        expected_stock = initial_stock - 5
        
        if new_stock != expected_stock:
            print(f"❌ Stock not updated correctly. Expected: {expected_stock}, Got: {new_stock}")
            return False
        
        print(f"✅ Stock updated correctly: {initial_stock} → {new_stock}")

        # Verify client sales counter was updated
        success, cliente_updated = self.run_test("Get Client After Sale", "GET", f"clientes/{cliente_id}", 200)
        if not success:
            return False
        
        new_sales_count = cliente_updated.get('contador_ventas', 0)
        expected_count = initial_sales_count + 1
        
        if new_sales_count != expected_count:
            print(f"❌ Sales counter not updated. Expected: {expected_count}, Got: {new_sales_count}")
            return False
        
        print(f"✅ Sales counter updated correctly: {initial_sales_count} → {new_sales_count}")

        # Test GET all sales
        success, response = self.run_test("Get All Sales", "GET", "ventas", 200)
        if not success or len(response) == 0:
            return False

        print("✅ VENTAS FLOW completed successfully")
        return True

    def test_compras_flow(self):
        """Test purchases flow with inventory updates"""
        print("\n📥 Testing COMPRAS FLOW...")
        
        if not self.created_ids['proveedores'] or not self.created_ids['productos']:
            print("❌ Need suppliers and products for purchases test")
            return False

        proveedor_id = self.created_ids['proveedores'][0]
        producto_id = self.created_ids['productos'][0]

        # Get initial product stock
        success, producto = self.run_test("Get Product Before Purchase", "GET", f"productos/{producto_id}", 200)
        if not success:
            return False
        
        initial_stock = producto.get('stock', 0)
        print(f"   Initial stock: {initial_stock}")

        # Get initial supplier purchases count
        success, proveedor = self.run_test("Get Supplier Before Purchase", "GET", f"proveedores/{proveedor_id}", 200)
        if not success:
            return False
        
        initial_purchases_count = proveedor.get('contador_compras', 0)
        print(f"   Initial purchases count: {initial_purchases_count}")

        # Create purchase
        compra_data = {
            "proveedor_id": proveedor_id,
            "productos": [
                {
                    "producto_id": producto_id,
                    "nombre": "Martillo de Acero",
                    "cantidad": 20,
                    "precio_unitario": 20.00,
                    "subtotal": 400.00
                }
            ],
            "metodo_pago": "Transferencia"
        }
        
        success, response = self.run_test("Create Purchase", "POST", "compras", 200, compra_data)
        if not success:
            return False
        
        compra_id = response.get('id')
        if not compra_id:
            print("❌ No ID returned from purchase creation")
            return False
        
        self.created_ids['compras'].append(compra_id)

        # Verify stock was updated (increased)
        success, producto_updated = self.run_test("Get Product After Purchase", "GET", f"productos/{producto_id}", 200)
        if not success:
            return False
        
        new_stock = producto_updated.get('stock', 0)
        expected_stock = initial_stock + 20
        
        if new_stock != expected_stock:
            print(f"❌ Stock not updated correctly. Expected: {expected_stock}, Got: {new_stock}")
            return False
        
        print(f"✅ Stock updated correctly: {initial_stock} → {new_stock}")

        # Verify supplier purchases counter was updated
        success, proveedor_updated = self.run_test("Get Supplier After Purchase", "GET", f"proveedores/{proveedor_id}", 200)
        if not success:
            return False
        
        new_purchases_count = proveedor_updated.get('contador_compras', 0)
        expected_count = initial_purchases_count + 1
        
        if new_purchases_count != expected_count:
            print(f"❌ Purchases counter not updated. Expected: {expected_count}, Got: {new_purchases_count}")
            return False
        
        print(f"✅ Purchases counter updated correctly: {initial_purchases_count} → {new_purchases_count}")

        # Test GET all purchases
        success, response = self.run_test("Get All Purchases", "GET", "compras", 200)
        if not success or len(response) == 0:
            return False

        print("✅ COMPRAS FLOW completed successfully")
        return True

    def test_comparativas(self):
        """Test financial comparatives"""
        print("\n📊 Testing COMPARATIVAS...")
        
        success, response = self.run_test("Get Comparatives", "GET", "comparativas", 200)
        if not success:
            return False

        # Verify response structure
        required_fields = ['total_ventas', 'total_compras', 'ganancia_neta', 'ventas_por_metodo', 'compras_por_metodo']
        for field in required_fields:
            if field not in response:
                print(f"❌ Missing field in comparatives: {field}")
                return False

        print(f"   Total Ventas: ${response.get('total_ventas', 0):.2f}")
        print(f"   Total Compras: ${response.get('total_compras', 0):.2f}")
        print(f"   Ganancia Neta: ${response.get('ganancia_neta', 0):.2f}")
        print(f"   Cantidad Ventas: {response.get('cantidad_ventas', 0)}")
        print(f"   Cantidad Compras: {response.get('cantidad_compras', 0)}")

        print("✅ COMPARATIVAS completed successfully")
        return True

    def test_delete_operations(self):
        """Test delete operations and verify reversions"""
        print("\n🗑️ Testing DELETE OPERATIONS...")
        
        # Delete sale and verify stock reversion
        if self.created_ids['ventas']:
            venta_id = self.created_ids['ventas'][0]
            producto_id = self.created_ids['productos'][0]
            
            # Get stock before deletion
            success, producto = self.run_test("Get Product Before Sale Deletion", "GET", f"productos/{producto_id}", 200)
            if success:
                stock_before = producto.get('stock', 0)
                
                success, _ = self.run_test("Delete Sale", "DELETE", f"ventas/{venta_id}", 200)
                if success:
                    # Verify stock was restored
                    success, producto_after = self.run_test("Get Product After Sale Deletion", "GET", f"productos/{producto_id}", 200)
                    if success:
                        stock_after = producto_after.get('stock', 0)
                        if stock_after == stock_before + 5:  # Should restore the 5 units sold
                            print("✅ Sale deletion and stock reversion successful")
                        else:
                            print(f"❌ Stock not restored correctly: {stock_before} → {stock_after}")

        # Delete purchase and verify stock reversion
        if self.created_ids['compras']:
            compra_id = self.created_ids['compras'][0]
            producto_id = self.created_ids['productos'][0]
            
            # Get stock before deletion
            success, producto = self.run_test("Get Product Before Purchase Deletion", "GET", f"productos/{producto_id}", 200)
            if success:
                stock_before = producto.get('stock', 0)
                
                success, _ = self.run_test("Delete Purchase", "DELETE", f"compras/{compra_id}", 200)
                if success:
                    # Verify stock was reduced
                    success, producto_after = self.run_test("Get Product After Purchase Deletion", "GET", f"productos/{producto_id}", 200)
                    if success:
                        stock_after = producto_after.get('stock', 0)
                        if stock_after == stock_before - 20:  # Should remove the 20 units purchased
                            print("✅ Purchase deletion and stock reversion successful")
                        else:
                            print(f"❌ Stock not reduced correctly: {stock_before} → {stock_after}")

        # Delete remaining entities
        for producto_id in self.created_ids['productos']:
            self.run_test("Delete Product", "DELETE", f"productos/{producto_id}", 200)
        
        for cliente_id in self.created_ids['clientes']:
            self.run_test("Delete Client", "DELETE", f"clientes/{cliente_id}", 200)
        
        for proveedor_id in self.created_ids['proveedores']:
            self.run_test("Delete Supplier", "DELETE", f"proveedores/{proveedor_id}", 200)

        print("✅ DELETE OPERATIONS completed successfully")
        return True

def main():
    print("🏪 SISTEMA DE FERRETERÍA - BACKEND API TESTING")
    print("=" * 60)
    
    tester = FerreteriaTester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_categorias,
        tester.test_clientes_crud,
        tester.test_proveedores_crud,
        tester.test_productos_crud,
        tester.test_ventas_flow,
        tester.test_compras_flow,
        tester.test_comparativas,
        tester.test_delete_operations
    ]
    
    all_passed = True
    for test in tests:
        if not test():
            all_passed = False
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if all_passed:
        print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return 0
    else:
        print("❌ SOME TESTS FAILED! Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
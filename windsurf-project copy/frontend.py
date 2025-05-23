from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Serve static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Serve the main HTML file
@app.route('/')
def index():
    return render_template('index.html')

# API proxy endpoints
@app.route('/api/<path:path>', methods=['GET', 'POST'])
def proxy_api(path):
    import requests
    backend_url = f'http://localhost:5008/api/{path}'
    try:
        if request.method == 'GET':
            resp = requests.get(backend_url, params=request.args)
        else:
            resp = requests.post(backend_url, json=request.get_json())
        return (resp.content, resp.status_code, resp.headers.items())
    except requests.exceptions.RequestException as e:
        return str(e), 500

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>T-Shirt Order Management</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .container { margin-bottom: 20px; }
        .button { padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .input { padding: 8px; margin: 5px; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>T-Shirt Order Management</h1>
    
    <div class="container">
        <h2>Available T-Shirts</h2>
        <button onclick="fetchTshirts()" class="button">Get T-Shirts</button>
        <div id="tshirts"></div>
    </div>

    <div class="container">
        <h2>Create Order</h2>
        <input type="text" id="customerName" placeholder="Customer Name" class="input">
        <input type="number" id="quantity" placeholder="Quantity" class="input">
        <input type="number" id="tshirtId" placeholder="T-Shirt ID" class="input">
        <button onclick="createOrder()" class="button">Create Order</button>
        <div id="orderResult"></div>
    </div>

    <div class="container">
        <h2>Orders History</h2>
        <button onclick="fetchOrders()" class="button">Get Orders</button>
        <div id="orders"></div>
    </div>

    <script>
        async function fetchTshirts() {
            try {
                console.log('Fetching t-shirts...');
                const response = await axios.get('http://localhost:5001/api/tshirts');
                console.log('Response received:', response.data);
                
                if (!Array.isArray(response.data)) {
                    throw new Error('Invalid data format received');
                }
                
                const tshirtsDiv = document.getElementById('tshirts');
                
                // First sort t-shirts by design name and then by size
                const sortedTshirts = [...response.data].sort((a, b) => {
                    if (a.design_name !== b.design_name) {
                        return a.design_name.localeCompare(b.design_name);
                    }
                    const sizeOrder = ['2XL', 'XL', 'L', 'M'];
                    return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
                });

                // Group t-shirts by design
                let currentDesign = '';
                let designTotal = 0;
                let tshirtsHtml = '';
                let firstDesign = true;
                
                // First pass to calculate totals
                const designTotals = {};
                sortedTshirts.forEach(t => {
                    if (!designTotals[t.design_name]) {
                        designTotals[t.design_name] = 0;
                    }
                    designTotals[t.design_name] += t.quantity;
                });
                
                // Second pass to generate HTML
                sortedTshirts.forEach((t, index) => {
                    if (t.design_name !== currentDesign) {
                        if (!firstDesign) {
                            tshirtsHtml += '</div>';
                        }
                        currentDesign = t.design_name;
                        tshirtsHtml += `<div><h3>${t.design_name} (Total: ${designTotals[t.design_name]})</h3>`;
                        firstDesign = false;
                    }
                    tshirtsHtml += `
                        <div style="margin-left: 20px;">
                            Size: ${t.size}, Quantity: ${t.quantity}, Price: $${t.price}
                        </div>`;
                });
                
                tshirtsHtml += '</div>';
                tshirtsDiv.innerHTML = tshirtsHtml;;
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('tshirts').innerHTML = '<div class="error">Error loading t-shirts</div>';
            }
        }

        async function createOrder() {
            const customerName = document.getElementById('customerName').value;
            const quantity = document.getElementById('quantity').value;
            const tshirtId = document.getElementById('tshirtId').value;

            try {
                const response = await axios.post('http://localhost:5001/api/orders', {
                    customer_name: customerName,
                    quantity: quantity,
                    tshirt_id: tshirtId
                });
                document.getElementById('orderResult').innerHTML = '<div class="success">Order created successfully!</div>';
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('orderResult').innerHTML = '<div class="error">Error creating order: ' + error.response?.data?.error + '</div>';
            }
        }

        async function fetchOrders() {
            try {
                const response = await axios.get('http://localhost:5001/api/orders');
                const ordersDiv = document.getElementById('orders');
                ordersDiv.innerHTML = '<h3>Orders:</h3>' + 
                    response.data.map(order => `
                        <div>
                            Customer: ${order.customer_name}, 
                            T-Shirt: ${order.tshirt.size} ${order.tshirt.color}, 
                            Quantity: ${order.quantity}, 
                            Status: ${order.status}, 
                            Date: ${new Date(order.order_date).toLocaleString()}
                        </div>
                    `).join('<br>');
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('orders').innerHTML = '<div class="error">Error loading orders</div>';
            }
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

if __name__ == '__main__':
    app.run(port=8004)

from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Add this import at the top of the file
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tshirts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class TShirt(db.Model):
    __tablename__ = 'tshirts'
    id = db.Column(db.Integer, primary_key=True)
    design_name = db.Column(db.String(100), nullable=False)
    size = db.Column(db.String(5), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(20), default='White')  # Default color is white

    # Method to get total quantity for a design
    @classmethod
    def get_design_total(cls, design_name):
        return db.session.query(cls).filter_by(design_name=design_name).all()

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    tshirt_id = db.Column(db.Integer, db.ForeignKey('tshirts.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    tshirt = db.relationship('TShirt', backref='orders')

with app.app_context():
    # Create all tables without dropping first
    db.create_all()
    
    # Clear existing data
    try:
        TShirt.query.delete()
        Order.query.delete()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing data: {e}")
    
    # Add initial t-shirts if none exist
    if not TShirt.query.first():
        tshirts_data = [
            # Winging It - 13 total
            {'design_name': 'Winging It', 'size': 'S', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'M', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            
            # Power to the Meeple - 12 total
            {'design_name': 'Power to the Meeple', 'size': 'S', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'M', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            
            # The Board Gamer - 7 total
            {'design_name': 'The Board Gamer', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'The Board Gamer', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'The Board Gamer', 'size': '2XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            
            # I Don't Make the Rules - 15 total
            {'design_name': 'I Don\'t Make the Rules', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'XL', 'quantity': 1, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            
            # VIRTU Meeple - 15 total
            {'design_name': 'VIRTU Meeple', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': '2XL', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            
            # Before You Ask - 13 total (Price: 800)
            {'design_name': 'Before You Ask', 'size': 'S', 'quantity': 4, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'M', 'quantity': 4, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'L', 'quantity': 1, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'XL', 'quantity': 2, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': '2XL', 'quantity': 2, 'price': 800, 'color': 'Black'},
            
            # Settle Down - 11 total
            {'design_name': 'Settle Down', 'size': 'M', 'quantity': 1, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': 'L', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': '2XL', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            
            # Game Night - 17 total
            {'design_name': 'Game Night', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': '2XL', 'quantity': 5, 'price': 720, 'color': 'Black'},
            
            # Board Game components - 16 total (Price: 700)
            {'design_name': 'Board Game components', 'size': 'S', 'quantity': 4, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'M', 'quantity': 4, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'L', 'quantity': 3, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'XL', 'quantity': 1, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': '2XL', 'quantity': 4, 'price': 700, 'color': 'Navy'}
        ]
        tshirts = [TShirt(**data) for data in tshirts_data]
        db.session.add_all(tshirts)
        db.session.commit()

@app.route('/api/tshirts', methods=['GET'])
def get_tshirts():
    try:
        print("Fetching tshirts from database...")  # Debug log
        tshirts = TShirt.query.all()
        print(f"Found {len(tshirts)} tshirts")  # Debug log
        
        # Convert tshirt objects to dictionaries
        tshirt_list = []
        for t in tshirts:
            tshirt_data = {
                'id': t.id,
                'design_name': t.design_name,
                'size': t.size,
                'color': t.color,
                'quantity': t.quantity,
                'price': float(t.price)  # Ensure price is serializable
            }
            tshirt_list.append(tshirt_data)
            
        print("Returning tshirt data:", tshirt_list)  # Debug log
        
        # Create response with CORS headers
        response = jsonify(tshirt_list)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET')
        return response
        
    except Exception as e:
        print(f"Error in get_tshirts: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    if request.method == 'POST':
        data = request.json
        
        # Check if tshirt exists
        tshirt = TShirt.query.get(data['tshirt_id'])
        if not tshirt:
            return jsonify({'error': 'T-shirt not found'}), 404
        
        # Check if enough quantity
        if tshirt.quantity < data['quantity']:
            return jsonify({'error': 'Not enough t-shirts in stock'}), 400
        
        # Create order with status
        order = Order(
            customer_name=data['customer_name'],
            customer_phone=data.get('customer_phone', ''),
            tshirt_id=data['tshirt_id'],
            quantity=data['quantity'],
            status=data.get('status', 'pending')
        )
        
        # Only reduce inventory for fulfilled orders, not for online orders
        order_status = data.get('status', 'pending')
        if order_status == 'fulfilled':
            tshirt.quantity -= data['quantity']
            print(f"Reducing inventory for fulfilled order: {data['quantity']} units of T-shirt ID {data['tshirt_id']}")
        else:
            print(f"Online order: Not reducing inventory for T-shirt ID {data['tshirt_id']}")
            
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'id': order.id,
            'customer_name': order.customer_name,
            'customer_phone': order.customer_phone,
            'tshirt': {
                'id': tshirt.id,
                'size': tshirt.size,
                'color': tshirt.color,
                'design_name': tshirt.design_name,
                'price': tshirt.price
            },
            'quantity': order.quantity,
            'status': order.status,
            'order_date': order.order_date.isoformat()
        })

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'customer_name': o.customer_name,
        'customer_phone': o.customer_phone,
        'tshirt': {
            'id': o.tshirt.id,
            'design_name': o.tshirt.design_name,
            'size': o.tshirt.size,
            'color': o.tshirt.color,
            'price': o.tshirt.price
        },
        'quantity': o.quantity,
        'status': o.status,
        'order_date': o.order_date.isoformat()
    } for o in orders])

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Restore the tshirt quantity
    tshirt = TShirt.query.get(order.tshirt_id)
    if tshirt:
        tshirt.quantity += order.quantity
    
    # Delete the order
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({'message': 'Order deleted successfully'})

@app.route('/api/reset-inventory', methods=['POST'])
def reset_inventory():
    """Reset the entire inventory to its initial state"""
    try:
        # Clear existing tshirts
        TShirt.query.delete()
        db.session.commit()
        
        # Add initial t-shirts data
        tshirts_data = [
            # Winging It - 13 total
            {'design_name': 'Winging It', 'size': 'S', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'M', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'Winging It', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            
            # Power to the Meeple - 12 total
            {'design_name': 'Power to the Meeple', 'size': 'S', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'M', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Power to the Meeple', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            
            # The Board Gamer - 7 total
            {'design_name': 'The Board Gamer', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'The Board Gamer', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'The Board Gamer', 'size': '2XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            
            # I Don't Make the Rules - 15 total
            {'design_name': 'I Don\'t Make the Rules', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'L', 'quantity': 3, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': 'XL', 'quantity': 1, 'price': 720, 'color': 'Black'},
            {'design_name': 'I Don\'t Make the Rules', 'size': '2XL', 'quantity': 3, 'price': 720, 'color': 'Black'},
            
            # VIRTU Meeple - 15 total
            {'design_name': 'VIRTU Meeple', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': 'XL', 'quantity': 3, 'price': 720, 'color': 'Navy'},
            {'design_name': 'VIRTU Meeple', 'size': '2XL', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            
            # Before You Ask - 13 total (Price: 800)
            {'design_name': 'Before You Ask', 'size': 'S', 'quantity': 4, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'M', 'quantity': 4, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'L', 'quantity': 1, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': 'XL', 'quantity': 2, 'price': 800, 'color': 'Black'},
            {'design_name': 'Before You Ask', 'size': '2XL', 'quantity': 2, 'price': 800, 'color': 'Black'},
            
            # Settle Down - 11 total
            {'design_name': 'Settle Down', 'size': 'M', 'quantity': 1, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': 'L', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Navy'},
            {'design_name': 'Settle Down', 'size': '2XL', 'quantity': 4, 'price': 720, 'color': 'Navy'},
            
            # Game Night - 17 total
            {'design_name': 'Game Night', 'size': 'S', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'M', 'quantity': 4, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'L', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': 'XL', 'quantity': 2, 'price': 720, 'color': 'Black'},
            {'design_name': 'Game Night', 'size': '2XL', 'quantity': 5, 'price': 720, 'color': 'Black'},
            
            # Board Game components - 16 total (Price: 700)
            {'design_name': 'Board Game components', 'size': 'S', 'quantity': 4, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'M', 'quantity': 4, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'L', 'quantity': 3, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': 'XL', 'quantity': 1, 'price': 700, 'color': 'Navy'},
            {'design_name': 'Board Game components', 'size': '2XL', 'quantity': 4, 'price': 700, 'color': 'Navy'}
        ]
        
        # Add all t-shirts back to the database
        tshirts = [TShirt(**data) for data in tshirts_data]
        db.session.add_all(tshirts)
        db.session.commit()
        
        return jsonify({'message': 'Inventory reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting inventory: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-stock', methods=['POST'])
def update_stock():
    """Update t-shirt stock based on sales"""
    try:
        # Get all t-shirts
        tshirts = TShirt.query.all()
        
        # Get recent orders (could be refined to specific time period)
        recent_orders = Order.query.all()
        
        # Calculate adjustment - here we simulate a modest restock for each design
        for tshirt in tshirts:
            # Only add stock if current quantity is below a threshold (e.g., 5)
            if tshirt.quantity < 5:
                # Add between 1-3 items randomly to simulate a restock
                import random
                restock_amount = random.randint(1, 3)
                tshirt.quantity += restock_amount
        
        db.session.commit()
        return jsonify({'message': 'Stock updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating stock: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5008)

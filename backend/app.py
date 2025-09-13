from flask import Flask, jsonify, request
import jwt
from functools import wraps
import datetime
from flask_cors import CORS
from supabase import create_client, Client
import config 



#fkask app setup

app = Flask(__name__)
CORS(app)


# Supabase Setup


supabase : Client = create_client(config.Supabase_url, config.Supabase_Key)

# decorator for verifying the JWT token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            decoded = jwt.decode(
                token,
                config.JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"  # remove this if it causes issues
            )
            current_user = decoded.get("sub")

            # ✅ Tell Supabase client to use this user’s JWT
            supabase.postgrest.auth(token)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

"""
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            decoded = jwt.decode(
                token, config.JWT_SECRET, algorithms=["HS256"], audience="authenticated"
            )
            current_user = decoded.get("sub")
            supabase.postgrest.auth(token)
        except jwt.ExpiredSignatureError:
            refresh_token = request.headers.get('X-Refresh-Token') 
            if refresh_token:
                try:
                    response = supabase.auth.refresh_session(refresh_token)
                    new_token = response.session.access_token
                    supabase.postgrest.auth(new_token)
                    return jsonify({'new_access_token': new_token}), 200
                except Exception as e:
                    return jsonify({'error': 'Refresh token invalid', 'details': str(e)}), 401
            return jsonify({'error': 'Token expired'}), 401
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            decoded = jwt.decode(
                token,
                config.JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            current_user = decoded.get("sub")

            # ✅ Tell supabase client to use this user’s JWT
            supabase.postgrest.auth(token)

        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

"""

#---------------
#   CRUD
#---------------

#Create

@app.route("/tasks", methods=["POST"])
@token_required
def create_task(current_user):
    try:
        data = request.get_json()
        print("Incoming JSON:", data)
        print("Current user:", current_user)

        title = data.get("title") if data else None
        description = data.get("description", "") if data else ""

        if not title:
            return jsonify({"error": "Title is required"}), 400

        res = supabase.table("tasks").insert({
    "user_id": current_user,
    "title": title,
    "description": description,
    "status": data.get("status", "todo")  # default todo
        }).execute()


        print("Supabase response:", res)

        return jsonify(res.data), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
    
#READ

@app.route("/tasks", methods = ["GET"])
@token_required
def get_tasks(current_user):
    try:
        res = supabase.table("tasks").select("*").eq("user_id",current_user).execute()
        return jsonify(res.data),200
    except Exception as e:
        return jsonify({"error": str(e)}),500

#UPDATE 

@app.route("/tasks/<task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    try:
        data = request.get_json()
        updates = {}

        if "title" in data:
            updates["title"] = data["title"]
        if "description" in data:
            updates["description"] = data["description"]
        if "status" in data:   # ✅ add status support
            updates["status"] = data["status"]

        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        res = (
            supabase.table("tasks")
            .update(updates)
            .eq("id", task_id)
            .eq("user_id", current_user)
            .execute()
        )

        if not res.data:
            return jsonify({"error": "Task not found or not authorized"}), 404

        return jsonify(res.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
#DELETE

@app.route('/tasks/<task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    try:
        res = (
            supabase.table("tasks")
            .delete()
            .eq("id", task_id)
            .eq("user_id", current_user)
            .execute()
        )

        if not res.data:
            return jsonify({"error": "Task not found or not authorized"}), 404

        return jsonify({"message": "Task deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# signup route

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get('password')
    
    try:
        response = supabase.auth.sign_up({
            "email" :email,
            'password': password
        })
        return jsonify({"message": "User created successfully",
    "data": response.model_dump()}), 201
    except Exception as e:
        return jsonify ({'error':str(e)}), 400
    
# login route

@app.route("/login", methods = ['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try : 
        response = supabase.auth.sign_in_with_password({
            'email': email,
            'password' : password
        })
        session = response.session
        user = response.user
        
        return jsonify ({'message': 'Login successful',
                         'access_token' : session.access_token,
                         'refresh_token' : session.refresh_token,
                         'user':{
                             'id': user.id,
                             'email' : user.email
                         }
        }), 200
    except Exception as e:
        return jsonify({'error':str(e)}), 401


# for decorators test
"""
@app.route("/tasks", methods=["GET"])
@token_required
def get_tasks(user_data):
    return jsonify({
        "message": "Here are your tasks",
        "user": user_data
    })

"""

@app.route("/health", methods = ['GET'])
def health():
    return jsonify({"status":"ok","message":"Backend is runing"})

if __name__ == "__main__":
    app.run(debug=True)
    